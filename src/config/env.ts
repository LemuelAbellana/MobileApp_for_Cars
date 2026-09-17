const DEFAULT_API_URL = 'http://lemzy.duckdns.org/cars.php';
const TOKEN_PLACEHOLDER = 'replace_me_locally';

// Local demo only: EXPO_PUBLIC values are extractable from the client bundle.
// Production requires HTTPS and runtime user authentication or a server gateway.

export type ApiConfig = {
  url: string;
  token: string;
};

export function getApiConfig(): ApiConfig {
  const url = process.env.EXPO_PUBLIC_CARS_API_URL?.trim() || DEFAULT_API_URL;
  const token = process.env.EXPO_PUBLIC_DEV_CARS_BEARER_TOKEN?.trim();

  if (!token || token === TOKEN_PLACEHOLDER) {
    throw new Error(
      'Set EXPO_PUBLIC_DEV_CARS_BEARER_TOKEN in .env.local for local development.',
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error('EXPO_PUBLIC_CARS_API_URL must be a valid HTTP or HTTPS URL.');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol) || parsedUrl.username || parsedUrl.password) {
    throw new Error('EXPO_PUBLIC_CARS_API_URL must be a valid HTTP or HTTPS URL.');
  }

  return { url: parsedUrl.toString(), token };
}
