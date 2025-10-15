export interface SamlUser {
  issuer: string;
  nameID: string;
  email?: string;
  [key: string]: unknown;
}