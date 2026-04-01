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

export interface XtreamVodDto {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string | null;
  rating: string | null;
  rating_5based: number | null;
  added: string | null;
  is_adult: string;
  category_id: string;
  container_extension: string;
  direct_source: string | null;
}

export interface XtreamSeriesDto {
  num: number;
  name: string;
  series_id: number;
  cover: string | null;
  plot: string | null;
  cast: string | null;
  director: string | null;
  genre: string | null;
  release_date: string | null;
  last_modified: string | null;
  rating: string | null;
  rating_5based: number | null;
  category_id: string;
}

export interface XtreamEpisodeDto {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info: {
    duration_secs?: number;
    duration?: string;
    plot?: string;
    movie_image?: string;
    rating?: number;
  };
}

export interface XtreamSeriesInfoDto {
  seasons: { season_number: number; name: string; episode_count: number }[];
  info: {
    name: string;
    cover: string | null;
    plot: string | null;
    cast: string | null;
    director: string | null;
    genre: string | null;
    release_date: string | null;
    rating: string | null;
  };
  episodes: Record<string, XtreamEpisodeDto[]>;
}

export interface XtreamEpgListingDto {
  id: string;
  epg_id: string;
  title: string;
  lang: string;
  start: string;
  end: string;
  description: string;
  channel_id: string;
  start_timestamp: string;
  stop_timestamp: string;
}

export interface XtreamShortEpgResponse {
  epg_listings: XtreamEpgListingDto[];
}
