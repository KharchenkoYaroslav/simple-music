import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseRankingItem } from '@simple-music/interfaces';

export class SongHistoryItemDto implements BaseRankingItem {
  @ApiProperty({ description: 'ID пісні' })
  id!: string;

  @ApiProperty({ enum: ['LOCAL', 'EXTERNAL'], description: 'Тип пісні (LOCAL або EXTERNAL)' })
  type!: 'LOCAL' | 'EXTERNAL';

  @ApiPropertyOptional({ description: 'Назва пісні (обовʼязково для LOCAL)' })
  title?: string;

  @ApiPropertyOptional({ description: 'Імʼя файлу обкладинки (обовʼязково для LOCAL)' })
  cover?: string | null;

  @ApiPropertyOptional({ description: 'Зовнішнє посилання (обовʼязково для EXTERNAL)' })
  externalUrl?: string;

  @ApiProperty({ description: 'Кількість лайків' })
  likes!: number;

  @ApiProperty({ description: 'Кількість переглядів' })
  views!: number;

  @ApiProperty({ description: 'Таймстемп останнього перегляду користувачем' })
  viewedAt!: number;
}
