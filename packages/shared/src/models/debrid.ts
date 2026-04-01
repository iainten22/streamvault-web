export interface DebridConfig {
  provider: "realdebrid" | "premiumize" | "alldebrid" | "torbox";
  apiKey: string;
}

export interface RealDebridUser {
  id: number;
  username: string;
  email: string;
  points: number;
  type: string;
  premium: number;
  expiration: string;
}

export interface RealDebridTorrent {
  id: string;
  filename: string;
  hash: string;
  bytes: number;
  host: string;
  status: string;
  progress: number;
  links: string[];
}

export interface RealDebridUnrestrict {
  id: string;
  filename: string;
  filesize: number;
  link: string;
  host: string;
  download: string;
  streamable: number;
}

export interface DebridResolvedStream {
  name: string;
  url: string;
  size?: number;
  quality?: string;
  source: string;
}
