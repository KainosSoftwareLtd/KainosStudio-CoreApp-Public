export interface FormSession {
  form_id: string;
  session_id: string;
  form_data: Record<string, string>;
  expires_at: number;
}
