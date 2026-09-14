import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { SongRankingItem, SongHistoryItem } from '@simple-music/interfaces';
import { SongService } from '@simple-music/song-management';
import { OnEvent } from '@nestjs/event-emitter';

/**
 * Схема даних Redis:
 *
 * --- Рейтинги (Sorted Sets / ZSET) ---
 * - `songs:likes_ranking` : Загальний рейтинг всіх пісень за лайками (score = кількість лайків).
 * - `songs:views_ranking` : Загальний рейтинг всіх пісень за переглядами (score = кількість переглядів).
 * - `author:${authorId}:likes_ranking` : Рейтинг пісень конкретного автора за лайками.
 * - `author:${authorId}:views_ranking` : Рейтинг пісень конкретного автора за переглядами.
 * - `category:${categoryId}:likes_ranking` : Рейтинг пісень у конкретній категорії за лайками.
 * - `category:${categoryId}:views_ranking` : Рейтинг пісень у конкретній категорії за переглядами.
 *
 * --- Інформація про пісню ---
 * - `song:${songId}:info` [Hash] : Зберігає метадані пісні (authorId, categoryIds у форматі JSON) для швидкого оновлення відповідних рейтингів.
 * - `song:${songId}:likes` [Set] : Множина ID користувачів, які лайкнули пісню (дозволяє рахувати кількість лайків та перевіряти, чи ставив юзер лайк).
 *
 * --- Дані користувача ---
 * - `user:${userId}:likes` [ZSET] : Список пісень, які вподобав користувач (score = timestamp, member = songId, для сортування від нових до старих).
 * - `user:${userId}:history` [ZSET] : Історія переглядів пісень користувачем (score = timestamp, member = `${songId}:${uuid}`).
 *
 * --- Інше ---
 * - `view:cooldown:${userId}:${songId}` [String] : Тимчасовий ключ з TTL (300 сек) для запобігання накрутці переглядів (cooldown).
 */

@Injectable()
export class UserMetricsService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly songService: SongService,
  ) {}

  @OnEvent('user.deleted')
  async handleUserDeleted(payload: { userId: string }): Promise<void> {
    await this.removeAllUserLikes(payload.userId);
    await this.removeAllUserViews(payload.userId);
  }

  async removeAllUserLikes(userId: string): Promise<void> {
    const userLikes = await this.redis.zrange(`user:${userId}:likes`, 0, -1);
    if (userLikes.length === 0) return;

    const infoPipeline = this.redis.pipeline();
    for (const songId of userLikes) {
      infoPipeline.hgetall(`song:${songId}:info`);
    }
    const infos = await infoPipeline.exec();

    const deletePipeline = this.redis.pipeline();
    deletePipeline.del(`user:${userId}:likes`);

    userLikes.forEach((songId, index) => {
      deletePipeline.srem(`song:${songId}:likes`, userId);
      deletePipeline.zincrby(`songs:likes_ranking`, -1, songId);

      const errAndResult = infos?.[index];
      const infoResult = errAndResult ? (errAndResult[1] as Record<string, string>) : null;

      if (infoResult) {
        if (infoResult['authorId']) {
          deletePipeline.zincrby(`author:${infoResult['authorId']}:likes_ranking`, -1, songId);
        }
        if (infoResult['categoryIds']) {
          try {
            const categoryIds: string[] = JSON.parse(infoResult['categoryIds']);
            categoryIds.forEach((catId) => {
              deletePipeline.zincrby(`category:${catId}:likes_ranking`, -1, songId);
            });
          } catch {
            // ignore
          }
        }
      }
    });

    await deletePipeline.exec();
  }

  async removeAllUserViews(userId: string): Promise<void> {
    await this.redis.del(`user:${userId}:history`);
  }

  async getUserViewHistoryCount(userId: string): Promise<number> {
    return this.redis.zcard(`user:${userId}:history`);
  }

  async getUserLikedSongsCount(userId: string): Promise<number> {
    return this.redis.zcard(`user:${userId}:likes`);
  }

  async getUserViewHistory(
    userId: string,
    from: number,
    to: number,
  ): Promise<SongHistoryItem[]> {
    const historyKey = `user:${userId}:history`;

    const redisResult = await this.redis.zrevrange(historyKey, from, to, 'WITHSCORES');
    if (redisResult.length === 0) return [];

    const historyItems: { songId: string; viewedAt: number }[] = [];
    for (let i = 0; i < redisResult.length; i += 2) {
      const entry = redisResult[i];
      const songId = entry.split(':')[0];
      historyItems.push({
        songId,
        viewedAt: parseInt(redisResult[i + 1], 10),
      });
    }

    const songIds = Array.from(new Set(historyItems.map((item) => item.songId)));

    const pipeline = this.redis.pipeline();
    songIds.forEach(id => {
      pipeline.zscore('songs:likes_ranking', id);
      pipeline.zscore('songs:views_ranking', id);
    });
    const countsResults = await pipeline.exec();

    const likesMap = new Map<string, number>();
    const viewsMap = new Map<string, number>();

    if (countsResults) {
      songIds.forEach((id, index) => {
        const likesVal = countsResults[index * 2][1] as string | null;
        const viewsVal = countsResults[index * 2 + 1][1] as string | null;
        likesMap.set(id, likesVal ? parseInt(likesVal, 10) : 0);
        viewsMap.set(id, viewsVal ? parseInt(viewsVal, 10) : 0);
      });
    }

    const songsMap = await this.songService.fetchSongDocsAndMap(songIds);

    return historyItems
      .map((item) => {
        const songDoc = songsMap.get(item.songId);
        if (!songDoc) return null;

        const likes = likesMap.get(item.songId) || 0;
        const views = viewsMap.get(item.songId) || 0;

        if (songDoc.type === 'EXTERNAL') {
          return {
            id: item.songId,
            type: 'EXTERNAL',
            externalUrl: songDoc.externalUrl || '',
            likes,
            views,
            viewedAt: item.viewedAt,
          } as SongHistoryItem;
        }

        return {
          id: item.songId,
          type: 'LOCAL',
          title: songDoc.title || '',
          cover: songDoc.cover || null,
          likes,
          views,
          viewedAt: item.viewedAt,
        } as SongHistoryItem;
      })
      .filter((item): item is SongHistoryItem => item !== null);
  }

  async getUserLikedSongs(
    userId: string,
    from: number,
    to: number,
  ): Promise<SongRankingItem[]> {
    const redisResult = await this.redis.zrevrange(`user:${userId}:likes`, from, to);
    if (redisResult.length === 0) return [];

    const songIds = redisResult;

    const pipeline = this.redis.pipeline();
    songIds.forEach(id => {
      pipeline.zscore('songs:likes_ranking', id);
      pipeline.zscore('songs:views_ranking', id);
    });
    const countsResults = await pipeline.exec();

    const likesMap = new Map<string, number>();
    const viewsMap = new Map<string, number>();

    if (countsResults) {
      songIds.forEach((id, index) => {
        const likesVal = countsResults[index * 2][1] as string | null;
        const viewsVal = countsResults[index * 2 + 1][1] as string | null;
        likesMap.set(id, likesVal ? parseInt(likesVal, 10) : 0);
        viewsMap.set(id, viewsVal ? parseInt(viewsVal, 10) : 0);
      });
    }

    const songsMap = await this.songService.fetchSongDocsAndMap(songIds);

    return songIds
      .map((songId) => {
        const songDoc = songsMap.get(songId);
        if (!songDoc) return null;

        const likes = likesMap.get(songId) || 0;
        const views = viewsMap.get(songId) || 0;

        if (songDoc.type === 'EXTERNAL') {
          return {
            id: songId,
            type: 'EXTERNAL',
            externalUrl: songDoc.externalUrl || '',
            likes,
            views,
          } as SongRankingItem;
        }

        return {
          id: songId,
          type: 'LOCAL',
          title: songDoc.title || '',
          cover: songDoc.cover || null,
          likes,
          views,
        } as SongRankingItem;
      })
      .filter((item): item is SongRankingItem => item !== null);
  }
}

