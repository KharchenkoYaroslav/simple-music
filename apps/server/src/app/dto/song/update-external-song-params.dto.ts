import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsUrl } from 'class-validator';
import { UpdateExternalSong } from '@simple-music/interfaces';

export class UpdateExternalSongParamsDto implements UpdateExternalSong {
  @ApiPropertyOptional({ description: 'URL зовнішньої пісні' })
  @IsOptional()
  @IsString()
  @IsUrl()
  externalUrl?: string;

  @ApiPropertyOptional({ description: 'Категорії пісні' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];
}

