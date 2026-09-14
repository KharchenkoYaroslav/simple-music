export interface BaseSong {
  id: string;
  authorId: string;
  categoryIds: string[];
  likesCount: number;
  hasLiked: boolean;
  viewsCount: number;
}

export interface LocalSong extends BaseSong {
  type: 'LOCAL';
  title: string;
  description: string;
  song: string | null;
  cover: string | null;
}

export interface ExternalSong extends BaseSong {
  type: 'EXTERNAL';
  externalUrl: string;
}

export type SongFull = LocalSong | ExternalSong;

export interface BaseRankingItem {
  id: string;
  likes: number;
  views: number;
}

export interface LocalRankingItem extends BaseRankingItem {
  type: 'LOCAL';
  title: string;
  cover: string | null;
}

export interface ExternalRankingItem extends BaseRankingItem {
  type: 'EXTERNAL';
  externalUrl: string;
}

export type SongRankingItem = LocalRankingItem | ExternalRankingItem;

export type SongHistoryItem = SongRankingItem & {
  viewedAt: number;
};

export interface CreateLocalSong {
  title: string;
  description?: string;
  categoryIds?: string[];
}

export interface UpdateLocalSong {
  title?: string;
  description?: string;
  categoryIds?: string[];
}

export interface CreateExternalSong {
  externalUrl: string;
  categoryIds?: string[];
}

export interface UpdateExternalSong {
  externalUrl?: string;
  categoryIds?: string[];
}
