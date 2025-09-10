export interface IFileService {
  getPresignedPost(key: string, maxFileSize?: number): Promise<FileServiceResult<PresignedPost>>;
  getPresignedUrlForDownload(key: string): Promise<FileServiceResult<string>>;
  getStorageUrl(): string;
}

export type FileServiceResult<T> =
  | {
      isSuccesfull: true;
      value: T;
    }
  | { isSuccesfull: false; error: string };

export type PresignedPost = {
  cloudProvider: 'aws' | 'azure';
  url: string;
  fields: Record<string, string>;
};