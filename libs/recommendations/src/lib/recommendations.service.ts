import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { SongRankingItem } from '@simple-music/interfaces';
import { SongService } from '@simple-music/song-management';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly songService: SongService,
  ) {}

  async getSongsCountByLikes(categoryId?: string, authorId?: string): Promise<number> {
    let rankingKey = `songs:likes_ranking`;
    if (authorId) {
      rankingKey = `author:${authorId}:likes_ranking`;
    } else if (categoryId) {
      rankingKey = `category:${categoryId}:likes_ranking`;
    }
    return this.redis.zcard(rankingKey);
  }

  async getSongsCountByViews(categoryId?: string, authorId?: string): Promise<number> {
    let rankingKey = `songs:views_ranking`;
    if (authorId) {
      rankingKey = `author:${authorId}:views_ranking`;
    } else if (categoryId) {
      rankingKey = `category:${categoryId}:views_ranking`;
    }
    return this.redis.zcard(rankingKey);
  }

  async getSongsSortedByLikes(
    from: number,
    to: number,
    categoryId?: string,
    authorId?: string,
  ): Promise<SongRankingItem[]> {
    let rankingKey = `songs:likes_ranking`;
    if (authorId) {
      rankingKey = `author:${authorId}:likes_ranking`;
    } else if (categoryId) {
      rankingKey = `category:${categoryId}:likes_ranking`;
    }

    const redisResult = await this.redis.zrevrange(rankingKey, from, to, 'WITHSCORES');
    if (redisResult.length === 0) return [];

    const songsStats: { id: string; likes: number }[] = [];
    for (let i = 0; i < redisResult.length; i += 2) {
      songsStats.push({
        id: redisResult[i],
        likes: parseInt(redisResult[i + 1], 10),
      });
    }

    const songIds = songsStats.map((stat) => stat.id);

    const viewsPipeline = this.redis.pipeline();
    songIds.forEach(id => viewsPipeline.zscore('songs:views_ranking', id));
    const viewsResults = await viewsPipeline.exec();

    const viewsMap = new Map<string, number>();
    if (viewsResults) {
      viewsResults.forEach((res, index) => {
        const val = res[1] as string | null;
        viewsMap.set(songIds[index], val ? parseInt(val, 10) : 0);
      });
    }

    const songsMap = await this.songService.fetchSongDocsAndMap(songIds);

    return songsStats
      .map((stat) => {
        const songDoc = songsMap.get(stat.id);
        if (!songDoc) return null;

        const views = viewsMap.get(stat.id) || 0;

        if (songDoc.type === 'EXTERNAL') {
          return {
            id: stat.id,
            type: 'EXTERNAL',
            externalUrl: songDoc.externalUrl || '',
            likes: stat.likes,
            views,
          } as SongRankingItem;
        }

        return {
          id: stat.id,
          type: 'LOCAL',
          title: songDoc.title || '',
          cover: songDoc.cover || null,
          likes: stat.likes,
          views,
        } as SongRankingItem;
      })
      .filter((item): item is SongRankingItem => item !== null);
  }

  async getSongsSortedByViews(
    from: number,
    to: number,
    categoryId?: string,
    authorId?: string,
  ): Promise<SongRankingItem[]> {
    let rankingKey = `songs:views_ranking`;
    if (authorId) {
      rankingKey = `author:${authorId}:views_ranking`;
    } else if (categoryId) {
      rankingKey = `category:${categoryId}:views_ranking`;
    }

    const redisResult = await this.redis.zrevrange(rankingKey, from, to, 'WITHSCORES');
    if (redisResult.length === 0) return [];

    const songsStats: { id: string; views: number }[] = [];
    for (let i = 0; i < redisResult.length; i += 2) {
      songsStats.push({
        id: redisResult[i],
        views: parseInt(redisResult[i + 1], 10),
      });
    }

    const songIds = songsStats.map((stat) => stat.id);

    const likesPipeline = this.redis.pipeline();
    songIds.forEach(id => likesPipeline.zscore('songs:likes_ranking', id));
    const likesResults = await likesPipeline.exec();

    const likesMap = new Map<string, number>();
    if (likesResults) {
      likesResults.forEach((res, index) => {
        const val = res[1] as string | null;
        likesMap.set(songIds[index], val ? parseInt(val, 10) : 0);
      });
    }

    const songsMap = await this.songService.fetchSongDocsAndMap(songIds);

    return songsStats
      .map((stat) => {
        const songDoc = songsMap.get(stat.id);
        if (!songDoc) return null;

        const likes = likesMap.get(stat.id) || 0;

        if (songDoc.type === 'EXTERNAL') {
          return {
            id: stat.id,
            type: 'EXTERNAL',
            externalUrl: songDoc.externalUrl || '',
            likes,
            views: stat.views,
          } as SongRankingItem;
        }

        return {
          id: stat.id,
          type: 'LOCAL',
          title: songDoc.title || '',
          cover: songDoc.cover || null,
          likes,
          views: stat.views,
        } as SongRankingItem;
      })
      .filter((item): item is SongRankingItem => item !== null);
  }
}

