import { readFileSync } from 'node:fs';
import { loadEnv } from 'vite';
import { describe, expect, it } from 'vitest';
import { configFrom } from './config-values.ts';

describe('configFrom', () => {
  it('falls back to the development defaults outside a production build', () => {
    const config = configFrom({ PROD: false });

    expect(config.apiBaseUrl).toBe('http://localhost:9300');
    expect(config.appBaseUrl).toBe('http://localhost:5173');
    expect(config.isProduction).toBe(false);
  });

  it('reads the variables a production build sets', () => {
    const config = configFrom({ PROD: true, VITE_API_BASE_URL: 'https://api.example.test', VITE_APP_BASE_URL: 'https://app.example.test' });

    expect(config.apiBaseUrl).toBe('https://api.example.test');
    expect(config.isProduction).toBe(true);
  });

  it('refuses a production build missing VITE_API_BASE_URL, rather than falling back to localhost', () => {
    expect(() => configFrom({ PROD: true, VITE_APP_BASE_URL: 'https://app.example.test' })).toThrow(/VITE_API_BASE_URL/);
    expect(() => configFrom({ PROD: true, VITE_APP_BASE_URL: 'https://app.example.test', VITE_API_BASE_URL: '' })).toThrow(
      /VITE_API_BASE_URL/
    );
  });

  it('refuses a production build missing VITE_APP_BASE_URL, rather than falling back to localhost', () => {
    expect(() => configFrom({ PROD: true, VITE_API_BASE_URL: 'https://api.example.test' })).toThrow(/VITE_APP_BASE_URL/);
    expect(() => configFrom({ PROD: true, VITE_API_BASE_URL: 'https://api.example.test', VITE_APP_BASE_URL: '' })).toThrow(
      /VITE_APP_BASE_URL/
    );
  });

  it('reads the committed .env.production as a complete production configuration', () => {
    expect(() => configFrom({ ...loadEnv('production', process.cwd(), 'VITE_'), PROD: true })).not.toThrow();
  });

  it('keeps every localhost value out of the committed .env, which a production build also reads', () => {
    expect(readFileSync('.env', 'utf8')).not.toMatch(/^VITE_\w+=.*localhost/m);
  });
});
