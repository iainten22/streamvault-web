export interface StremioManifest {
  id: string;
  version: string;
  name: string;
  description: string;
  types: string[];
  catalogs: StremioCatalogDef[];
  resources: string[];
  logo?: string;
}

export interface StremioCatalogDef {
  type: string;
  id: string;
  name: string;
  extra?: { name: string; isRequired?: boolean; options?: string[] }[];
}

export interface StremioMetaItem {
  id: string;
  type: string;
  name: string;
  poster?: string;
  posterShape?: string;
  description?: string;
  releaseInfo?: string;
  imdbRating?: string;
  genres?: string[];
}

export interface StremioStream {
  name?: string;
  title?: string;
  url?: string;
  infoHash?: string;
  fileIdx?: number;
  behaviorHints?: {
    bingeGroup?: string;
    notWebReady?: boolean;
  };
}

export interface StremioAddon {
  id: number;
  userId: number;
  addonUrl: string;
  config: Record<string, unknown>;
  enabled: boolean;
  installedAt: string;
  manifest?: StremioManifest;
}
