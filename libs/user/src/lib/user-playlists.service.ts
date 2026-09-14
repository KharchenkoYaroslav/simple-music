import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Playlist, PlaylistDocument } from './playlist.schema';
import { SongService } from '@simple-music/song-management';
import { PlaylistResponse, SongRankingItem } from '@simple-music/interfaces';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UserPlaylistsService {
  constructor(
    @InjectModel(Playlist.name) private playlistModel: Model<PlaylistDocument>,
    private readonly songService: SongService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  @OnEvent('song.deleted')
  async handleSongDeleted(payload: { songId: string }) {
    await this.playlistModel.updateMany({ songIds: payload.songId }, { $pull: { songIds: payload.songId } }).exec();
  }

  @OnEvent('user.deleted')
  async handleUserDeleted(payload: { userId: string }): Promise<void> {
    const userPlaylists = await this.playlistModel.find({ userId: payload.userId }).lean().exec();
    for (const playlist of userPlaylists) {
      await this.deletePlaylist(playlist._id.toString(), payload.userId);
    }
  }

  async createPlaylist(userId: string, name: string): Promise<string> {
    const newPlaylist = new this.playlistModel({
      name,
      userId,
      songIds: [],
    });
    const saved = await newPlaylist.save();
    return saved._id.toString();
  }

  async deletePlaylist(playlistId: string, userId: string): Promise<void> {
    const playlist = await this.playlistModel.findById(playlistId).exec();
    if (!playlist) throw new NotFoundException('Плейліст не знайдено');
    if (playlist.userId.toString() !== userId) throw new ForbiddenException('Немає доступу до плейлісту');
    await this.playlistModel.deleteOne({ _id: playlistId }).exec();
  }

  async addSongToPlaylist(playlistId: string, songId: string, userId: string): Promise<void> {
    const playlist = await this.playlistModel.findById(playlistId).exec();
    if (!playlist) throw new NotFoundException('Плейліст не знайдено');
    if (playlist.userId.toString() !== userId) throw new ForbiddenException('Немає доступу до плейлісту');

    const isValid = await this.songService.isSongValid(songId);
    if (!isValid) throw new BadRequestException('Пісня не знайдена або недійсна');

    if (!playlist.songIds.includes(songId)) {
      playlist.songIds.push(songId);
      await playlist.save();
    }
  }

  async removeSongFromPlaylist(playlistId: string, songId: string, userId: string): Promise<void> {
    const playlist = await this.playlistModel.findById(playlistId).exec();
    if (!playlist) throw new NotFoundException('Плейліст не знайдено');
    if (playlist.userId.toString() !== userId) throw new ForbiddenException('Немає доступу до плейлісту');

    if (playlist.songIds.includes(songId)) {
      playlist.songIds = playlist.songIds.filter(id => id !== songId);
      await playlist.save();
    }
  }

  async getPlaylist(playlistId: string, userId: string): Promise<PlaylistResponse> {
    const playlist = await this.playlistModel.findById(playlistId).lean().exec();
    if (!playlist) throw new NotFoundException('Плейліст не знайдено');

    if (playlist.userId.toString() !== userId) throw new ForbiddenException('Немає доступу до плейлісту');

    const songIds = playlist.songIds || [];

    if (songIds.length === 0) {
      return {
        id: playlist._id.toString(),
        name: playlist.name,
        userId: playlist.userId.toString(),
        songs: [],
      };
    }

    const likesPipeline = this.redis.pipeline();
    const viewsPipeline = this.redis.pipeline();

    songIds.forEach(id => {
      likesPipeline.zscore('songs:likes_ranking', id);
      viewsPipeline.zscore('songs:views_ranking', id);
    });

    const [likesResults, viewsResults] = await Promise.all([
      likesPipeline.exec(),
      viewsPipeline.exec(),
    ]);

    const likesMap = new Map<string, number>();
    const viewsMap = new Map<string, number>();

    if (likesResults) {
      likesResults.forEach((res, index) => {
        const val = res[1] as string | null;
        likesMap.set(songIds[index], val ? parseInt(val, 10) : 0);
      });
    }

    if (viewsResults) {
      viewsResults.forEach((res, index) => {
        const val = res[1] as string | null;
        viewsMap.set(songIds[index], val ? parseInt(val, 10) : 0);
      });
    }

    const songsMap = await this.songService.fetchSongDocsAndMap(songIds);

    const songs: SongRankingItem[] = songIds.map(statId => {
      const songDoc = songsMap.get(statId);
      if (!songDoc) return null;

      const likes = likesMap.get(statId) || 0;
      const views = viewsMap.get(statId) || 0;

      if (songDoc.type === 'EXTERNAL') {
        return {
          id: statId,
          type: 'EXTERNAL',
          externalUrl: songDoc.externalUrl || '',
          likes,
          views,
        } as SongRankingItem;
      }

      return {
        id: statId,
        type: 'LOCAL',
        title: songDoc.title || '',
        cover: songDoc.cover || null,
        likes,
        views,
      } as SongRankingItem;
    }).filter((item): item is SongRankingItem => item !== null);

    return {
      id: playlist._id.toString(),
      name: playlist.name,
      userId: playlist.userId.toString(),
      songs,
    };
  }

  async getUserPlaylists(userId: string): Promise<{ id: string; name: string }[]> {
    const playlists = await this.playlistModel.find({ userId }).select('_id name').lean().exec();
    return playlists.map(p => ({
      id: p._id.toString(),
      name: p.name,
    }));
  }
}

