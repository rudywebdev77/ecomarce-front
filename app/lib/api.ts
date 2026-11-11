const getApiBase = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    return "/api";
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api`;
  }
  return "http://localhost:3000/api";
};

export const API_BASE = getApiBase();

export async function fetchFromApi(endpoint: string, options: RequestInit = {}) {
  const base =
    typeof window !== "undefined"
      ? "/api"
      : process.env.NEXT_PUBLIC_API_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api` : "http://localhost:3000/api");

  const cleanEndpoint = endpoint.startsWith("/api") ? endpoint.replace(/^\/api/, "") : endpoint;
  const url = `${base.replace(/\/+$/, "")}${cleanEndpoint.startsWith("/") ? cleanEndpoint : `/${cleanEndpoint}`}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err.message);
    throw err;
  }
}
