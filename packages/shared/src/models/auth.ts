export interface UserInfo {
  username: string;
  password: string;
  message: string | null;
  auth: number;
  status: string;
  expDate: string | null;
  isTrial: string;
  activeCons: string;
  createdAt: string;
  maxConnections: string;
  allowedOutputFormats: string[];
}

export interface ServerInfo {
  url: string;
  port: string;
  httpsPort: string;
  serverProtocol: string;
  rtmpPort: string;
  timezone: string;
  timestampNow: number;
  timeNow: string;
}

export interface XtreamAuthResponse {
  user_info: UserInfo | null;
  server_info: ServerInfo | null;
}
