import { mkdir, rm, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { getEnv } from '../env';

export interface SaveFileOptions {
  fileName: string;
  data: Buffer | Uint8Array;
  contentType?: string;
  prefix?: string;
}

export interface StoredFile {
  fileKey: string;
  absolutePath: string;
}

export interface StorageAdapter {
  save(options: SaveFileOptions): Promise<StoredFile>;
  remove(fileKey: string): Promise<void>;
  resolvePath(fileKey: string): string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ensureBuffer(data: Buffer | Uint8Array) {
  return Buffer.isBuffer(data) ? data : Buffer.from(data);
}

export class LocalStorageAdapter implements StorageAdapter {
  private root: string;

  constructor(rootDirectory?: string) {
    const env = getEnv();
    this.root = rootDirectory ?? path.resolve(env.STORAGE_ROOT ?? './storage');
  }

  async ensureRoot() {
    await mkdir(this.root, { recursive: true });
  }

  async save({ fileName, data, prefix }: SaveFileOptions): Promise<StoredFile> {
    await this.ensureRoot();
    const safePrefix = prefix?.replace(/[^a-zA-Z0-9/_-]/g, '') ?? '';
    const directory = path.join(this.root, safePrefix);
    await mkdir(directory, { recursive: true });
    const timestamp = Date.now();
    const fileKey = path.join(safePrefix, `${timestamp}-${fileName}`);
    const absolutePath = path.join(this.root, fileKey);
    await writeFile(absolutePath, ensureBuffer(data));
    return { fileKey: fileKey.replace(/\\/g, '/'), absolutePath };
  }

  async remove(fileKey: string): Promise<void> {
    const absolutePath = this.resolvePath(fileKey);
    await rm(absolutePath, { force: true });
  }

  resolvePath(fileKey: string) {
    return path.join(this.root, fileKey);
  }
}

let storageSingleton: StorageAdapter | null = null;

export function getStorageAdapter() {
  if (storageSingleton) return storageSingleton;
  storageSingleton = new LocalStorageAdapter();
  return storageSingleton;
}
