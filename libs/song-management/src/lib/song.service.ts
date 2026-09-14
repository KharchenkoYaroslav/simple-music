import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Song, SongDocument } from './song.schema';
import { SongFull } from '@simple-music/interfaces';
import { SongMetricsService } from './song-metrics.service';

@Injectable()
export class SongService {
  constructor(
    @InjectModel(Song.name) private songBuilder: Model<SongDocument>,
    private readonly songMetricsService: SongMetricsService,
  ) {}

  async getSongById(id: string, userId: string): Promise<SongFull | null> {
    const song = await this.songBuilder.findById(id).lean().exec();

    if (!song) {
      return null;
    }

    const metrics = await this.songMetricsService.getSongMetrics(id, userId);

    if (song.type === 'EXTERNAL') {
      return {
        id: song._id.toString(),
        type: 'EXTERNAL',
        externalUrl: song.externalUrl || '',
        authorId: song.authorId.toString(),
        categoryIds: song.categoryIds?.map((catId) => catId.toString()) || [],
        likesCount: metrics.likesCount,
        hasLiked: metrics.hasLiked,
        viewsCount: metrics.viewsCount,
      };
    }

    return {
      id: song._id.toString(),
      type: 'LOCAL',
      title: song.title || '',
      description: song.description || '',
      authorId: song.authorId.toString(),
      categoryIds: song.categoryIds?.map((catId) => catId.toString()) || [],
      song: song.song || null,
      cover: song.cover || null,
      likesCount: metrics.likesCount,
      hasLiked: metrics.hasLiked,
      viewsCount: metrics.viewsCount,
    };
  }

  async fetchSongDocsAndMap(songIds: string[]) {
    const filter = { _id: { $in: songIds } };
    const songsFromDb = await this.songBuilder
      .find(filter)
      .select('title cover type externalUrl')
      .lean()
      .exec();
    return new Map(songsFromDb.map((song) => [song._id.toString(), song]));
  }

  async isSongValid(songId: string): Promise<boolean> {
    return (await this.songBuilder.exists({ _id: songId })) !== null;
  }
}
