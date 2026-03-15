export const SESSION_COOKIE = 'session_id';

export const config = {
	apiBaseUrl: import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:9300',
	tenantId: import.meta.env['VITE_TENANT_ID'] || 'apibuilder',
	appBaseUrl: import.meta.env['VITE_APP_BASE_URL'] || 'http://localhost:5173',
	githubClientId: import.meta.env['VITE_GITHUB_CLIENT_ID'] || '',
	environment: import.meta.env['VITE_ENVIRONMENT'] || 'development',
	isProduction: import.meta.env['VITE_ENVIRONMENT'] === 'production' || import.meta.env.PROD,
} as const;
