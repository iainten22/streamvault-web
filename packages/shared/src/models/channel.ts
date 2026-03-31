export interface LiveChannel {
  streamId: number;
  name: string;
  streamIcon: string | null;
  epgChannelId: string | null;
  categoryId: string;
  num: number;
  isAdult: boolean;
  serverId: number;
  containerExtension: string;
  tvArchive: boolean;
  tvArchiveDuration: number;
}

export interface Category {
  categoryId: string;
  categoryName: string;
  parentId: number;
}
