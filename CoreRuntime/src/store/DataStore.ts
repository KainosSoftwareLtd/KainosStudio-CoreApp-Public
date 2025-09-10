export interface IDataStore<T extends object> {
  saveItem(tableName: string, item: T): Promise<void>;
  getItem(tableName: string, key: Partial<T>): Promise<T | null>;
  removeItem(tableName: string, key: Partial<T>): Promise<void>
}