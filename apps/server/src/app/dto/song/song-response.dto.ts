import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseSong } from '@simple-music/interfaces';

export class SongResponseDto implements BaseSong {
  @ApiProperty({ description: 'ID пісні' })
  id!: string;

  @ApiProperty({ description: 'ID автора' })
  authorId!: string;

  @ApiProperty({ description: 'Категорії' })
  categoryIds!: string[];

  @ApiProperty({ description: 'Кількість лайків' })
  likesCount!: number;

  @ApiProperty({ description: 'Чи лайкнув поточний користувач' })
  hasLiked!: boolean;

  @ApiProperty({ description: 'Кількість переглядів' })
  viewsCount!: number;

  @ApiProperty({ enum: ['LOCAL', 'EXTERNAL'], description: 'Тип пісні' })
  type!: 'LOCAL' | 'EXTERNAL';

  @ApiPropertyOptional({ description: 'Назва пісні (LOCAL)' })
  title?: string;

  @ApiPropertyOptional({ description: 'Опис пісні (LOCAL)' })
  description?: string;

  @ApiPropertyOptional({ description: 'Файл пісні (LOCAL)' })
  song?: string | null;

  @ApiPropertyOptional({ description: 'Обкладинка (LOCAL)' })
  cover?: string | null;

  @ApiPropertyOptional({ description: 'Зовнішнє посилання (EXTERNAL)' })
  externalUrl?: string;
}

