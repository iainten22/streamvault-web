import { ServerStatus } from "./content";

export interface ServerAccount {
  id: number;
  name: string;
  serverUrl: string;
  username: string;
  password: string;
  status: ServerStatus;
  expiresAt: string | null;
  isTrial: boolean;
  maxConnections: number;
  activeConnections: number;
  createdAt: number;
  lastUsedAt: number;
}

export interface ServerAccountCreate {
  name: string;
  serverUrl: string;
  username: string;
  password: string;
}
