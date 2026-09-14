import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SongDocument = Song & Document;

@Schema({ timestamps: true, collection: 'songs' })
export class Song {
  @Prop({ type: String, enum: ['LOCAL', 'EXTERNAL'], default: 'LOCAL' })
  type!: 'LOCAL' | 'EXTERNAL';

  @Prop({ type: String })
  title?: string;

  @Prop({ type: String })
  externalUrl?: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  authorId!: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }], default: [] })
  categoryIds!: Types.ObjectId[];

  @Prop({ type: String, default: null })
  song!: string | null;

  @Prop({ type: String, default: null })
  cover!: string | null;
}

export const SongSchema = SchemaFactory.createForClass(Song);
