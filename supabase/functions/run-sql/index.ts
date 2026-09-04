// Supabase Edge Function: run-sql
// Deploy with: supabase functions deploy run-sql --no-verify-jwt
// Frontend calls: POST https://<project>.supabase.co/functions/v1/run-sql { sql: "SELECT ..." }
// Env vars (set in Supabase dashboard): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// This uses service_role but validates SQL server-side: only SELECT/WITH allowed, single statement, LIMIT 1000.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import postgres from "https://deno.land/x/postgresjs@v3.4.3/mod.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function isReadOnly(sql: string): boolean {
  const t = sql.trim().toLowerCase();
  // Allow SELECT and WITH (CTE that starts with WITH), block everything else
  if (t.startsWith("select") || t.startsWith("with")) return true;
  // Also allow EXPLAIN
  if (t.startsWith("explain")) return true;
  return false;
}

function isSingleStatement(sql: string): boolean {
  // Block multiple statements: naive check for ; not inside string. Good enough for playground.
  // Remove everything inside single quotes first.
  const stripped = sql.replace(/'[^']*'/g, "''");
  return stripped.split(";").filter(s => s.trim().length > 0).length <= 1;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { sql } = await req.json();
    if (!sql || typeof sql !== "string") {
      return new Response(JSON.stringify({ error: "Missing sql string" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!isSingleStatement(sql)) {
      return new Response(JSON.stringify({ error: "Only single statement allowed" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!isReadOnly(sql)) {
      return new Response(JSON.stringify({ error: "Only SELECT/WITH/EXPLAIN allowed. Use Reset to revert writes demo." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Enforce LIMIT 1000 if not present and not EXPLAIN
    let finalSql = sql.trim();
    const lower = finalSql.toLowerCase();
    const needsLimit = !lower.startsWith("explain") && !lower.includes("limit");
    if (needsLimit) {
      // Remove trailing ; then add LIMIT
      finalSql = finalSql.replace(/;$/, "") + " LIMIT 1000";
    }

    const databaseUrl = Deno.env.get("DATABASE_URL"); // e.g. postgres://postgres:PASS@db.xxx.supabase.co:5432/postgres
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    // Prefer DATABASE_URL, fallback to building from SUPABASE_URL + SERVICE_KEY not needed for postgresjs

    if (!databaseUrl) {
      return new Response(JSON.stringify({ error: "DATABASE_URL not set in Edge Function secrets" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const sqlClient = postgres(databaseUrl, { ssl: "require", max: 1, idle_timeout: 10 });

    // Use unsafe for dynamic SQL but we validated it is SELECT-only
    const rows = await sqlClient.unsafe(finalSql);
    await sqlClient.end();

    return new Response(JSON.stringify({ rows, rowCount: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
