import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsUrl } from 'class-validator';
import { CreateExternalSong } from '@simple-music/interfaces';

export class CreateExternalSongDto implements CreateExternalSong {
  @ApiProperty({ description: 'URL зовнішньої пісні' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  externalUrl!: string;

  @ApiPropertyOptional({ description: 'Категорії пісні' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];
}

