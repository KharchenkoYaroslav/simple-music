import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { Playlist, PlaylistSchema } from './playlist.schema';
import { UserMetricsService } from './user-metrics.service';
import { UserPlaylistsService } from './user-playlists.service';
import { RedisModule } from '@simple-music/redis';
import { SongManagementModule } from '@simple-music/song-management';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Playlist.name, schema: PlaylistSchema }
    ]),
    RedisModule,
    SongManagementModule,
  ],
  providers: [UserService, UserMetricsService, UserPlaylistsService],
  exports: [
    UserService,
    UserMetricsService,
    UserPlaylistsService,
  ],
})
export class UsersModule {}

