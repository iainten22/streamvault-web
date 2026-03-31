export interface XtreamCredentials {
  serverUrl: string;
  username: string;
  password: string;
}

export interface XtreamCategoryDto {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface XtreamLiveStreamDto {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string | null;
  epg_channel_id: string | null;
  added: string | null;
  is_adult: string;
  category_id: string;
  custom_sid: string | null;
  tv_archive: number;
  direct_source: string | null;
  tv_archive_duration: number;
}
