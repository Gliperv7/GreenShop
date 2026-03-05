import type { APIRoute } from "astro";
import { clearSessionUser } from "../../../lib/auth";
import { json } from "./_utils";

export const POST: APIRoute = async ({ cookies }) => {
  clearSessionUser(cookies);
  return json({ ok: true });
};
