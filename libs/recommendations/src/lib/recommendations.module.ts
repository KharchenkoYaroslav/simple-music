import { Module } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { RedisModule } from '@simple-music/redis';
import { SongManagementModule } from '@simple-music/song-management';

@Module({
  imports: [RedisModule, SongManagementModule],
  controllers: [],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
