import { configFrom } from './config-values.ts';

export const SESSION_COOKIE = 'session_id';

export const config = configFrom(import.meta.env);
