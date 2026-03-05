const getSupabaseConfig = () => {
  const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
  return { url, key };
};

export const getSupabaseAuthConfig = () => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    throw new Error("Missing PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  if (!key.startsWith("sb_secret_")) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must be sb_secret_...");
  }
  return { url, key };
};

export const supabaseAuthFetch = async (
  path: string,
  method: "GET" | "POST" | "PATCH",
  body?: unknown
) => {
  const { url, key } = getSupabaseAuthConfig();
  const response = await fetch(url + path, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Supabase request failed: ${method} ${path}`);
  }
  return response.status === 204 ? null : response.json();
};

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
