import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Song, SongDocument } from './song.schema';
import {
  CreateExternalSong,
  UpdateExternalSong,
} from '@simple-music/interfaces';
import { SongMetricsService } from './song-metrics.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ExternalSongService {
  constructor(
    @InjectModel(Song.name) private songBuilder: Model<SongDocument>,
    private readonly songMetricsService: SongMetricsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createExternalSong(
    userId: string,
    params: CreateExternalSong,
  ): Promise<{ id: string }> {
    const newSong = new this.songBuilder({
      type: 'EXTERNAL',
      authorId: userId,
      externalUrl: params.externalUrl,
      categoryIds: params.categoryIds
        ? params.categoryIds.map((id) => new Types.ObjectId(id))
        : [],
    });

    const savedSong = await newSong.save();
    const songId = savedSong._id.toString();

    await this.songMetricsService.initSongMetrics(songId, userId);
    await this.songMetricsService.initSongMetrics(songId, userId, params.categoryIds || []);
    return { id: songId };
  }

  async updateExternalSong(
    songId: string,
    userId: string,
    params: UpdateExternalSong,
  ): Promise<void> {
    const song = await this.checkAccessAndGetSong(songId, userId);
    const updateData: Partial<Song> = {};

    if (params.externalUrl !== undefined)
      updateData.externalUrl = params.externalUrl;

    if (params.categoryIds !== undefined) {
      const oldCategoryIds =
        song.categoryIds?.map((cat) => cat.toString()) || [];
      const newCategoryIds = params.categoryIds;

      const isCategoriesChanged = !(
        newCategoryIds.length === oldCategoryIds.length &&
        newCategoryIds.every((id) => oldCategoryIds.includes(id))
      );

      if (isCategoriesChanged) {
        updateData.categoryIds = newCategoryIds.map(
          (id) => new Types.ObjectId(id),
        );
        await this.songMetricsService.updateCategoryRankings(
          songId,
          newCategoryIds,
          oldCategoryIds,
        );
      }
    }

    if (Object.keys(updateData).length > 0) {
      await this.songBuilder
        .updateOne({ _id: songId }, { $set: updateData })
        .exec();
    }
  }

  async deleteExternalSong(songId: string, userId: string): Promise<void> {
    const song = await this.checkAccessAndGetSong(songId, userId);

    await this.songBuilder.deleteOne({ _id: songId }).exec();

    const categoryIds = song.categoryIds?.map((id) => id.toString()) || [];
    await this.songMetricsService.cleanupSongMetrics(
      songId,
      userId,
      categoryIds,
    );
    this.eventEmitter.emit('song.deleted', { songId });
  }

  @OnEvent('user.deleted')
  async handleUserDeleted(payload: { userId: string }): Promise<void> {
    await this.deleteAllUserExternalSongs(payload.userId);
  }

  async deleteAllUserExternalSongs(userId: string): Promise<void> {
    const userSongs = await this.songBuilder
      .find({ authorId: userId })
      .lean()
      .exec();

    for (const song of userSongs) {
      await this.deleteExternalSong(song._id.toString(), userId);
    }
  }

  private async checkAccessAndGetSong(songId: string, userId: string) {
    const song = await this.songBuilder.findById(songId).lean().exec();
    if (!song) {
      throw new NotFoundException(`Song with ID ${songId} not found`);
    }
    if (song.authorId.toString() !== userId) {
      throw new ForbiddenException('You are not the author of this song');
    }
    if (song.type !== 'EXTERNAL') {
      throw new ForbiddenException('This is a local song, not an external one');
    }
    return song;
  }
}
