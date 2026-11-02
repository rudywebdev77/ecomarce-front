const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function fetchFromApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
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

export { API_BASE };
