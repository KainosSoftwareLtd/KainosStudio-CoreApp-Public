export interface IStorageService {
  putObject(key: string, content: string, contentType?: string): Promise<void>;
  deleteObject(key: string): Promise<void>;
  deleteObjects(prefix: string): Promise<void>;
  listObjects(prefix: string): Promise<string[]>;
}
