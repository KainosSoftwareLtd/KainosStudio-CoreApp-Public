import { dataCookieAgeInMilliseconds, sessionIdKey } from '../consts.js';

import { FormSession } from './FormSession.js';
import { IDataStore } from './DataStore.js';

export class FormSessionService {
  private store: IDataStore<FormSession>;
  private tableName: string;

  constructor(store: IDataStore<FormSession>) {
    this.store = store;
    const tableName = process.env.FORM_SESSION_TABLE_NAME;
    if (!tableName) throw new Error('FORM_SESSION_TABLE_NAME environment variable is not set');
    this.tableName = tableName;
  }

  async saveSession(form: string, data: Record<string, string>): Promise<void> {
    const expireDate = new Date(new Date().getTime() + dataCookieAgeInMilliseconds);

    const session: FormSession = {
      form_id: form,
      session_id: data[sessionIdKey],
      form_data: data,
      expires_at: Math.floor(expireDate.getTime() / 1000),
    };

    await this.store.saveItem(this.tableName, session);
  }

  async getSession(form: string, sessionId: string): Promise<Record<string, string> | null> {
    const formSession = await this.store.getItem(this.tableName, { form_id: form, session_id: sessionId });
    return formSession?.form_data ?? null;
  }

  async removeSession(form: string, sessionId: string) {
    await this.store.removeItem(this.tableName, { form_id: form, session_id: sessionId });
  }
}
