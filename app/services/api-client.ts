function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const BASE_URL = getEnvVar("OPENACTIVE_API_BASE_URL");
const TOKEN = getEnvVar("OPENACTIVE_API_TOKEN");

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Fetch JSON from the OpenActive Monitor API.
 * Handles auth token injection and standard error responses.
 */
export async function apiFetch<T>(
  path: string,
  options?: { revalidate?: number | false }
): Promise<T> {
  const url = new URL(path, BASE_URL);
  url.searchParams.set("token", TOKEN);

  const res = await fetch(url.toString(), {
    next: { revalidate: options?.revalidate ?? 300 },
  });

  if (!res.ok) {
    throw new ApiError(
      res.status,
      `API request failed: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<T>;
}
