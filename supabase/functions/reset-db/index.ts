// Supabase Edge Function: reset-db
// POST https://<project>.supabase.co/functions/v1/reset-db {}
// Resets to seed.sql - drops and recreates users/orders
// Protect with a simple shared secret: set RESET_SECRET in Edge Function secrets, frontend sends x-reset-secret header

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import postgres from "https://deno.land/x/postgresjs@v3.4.3/mod.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-reset-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const secret = req.headers.get("x-reset-secret");
  const expected = Deno.env.get("RESET_SECRET");
  if (expected && secret !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized reset secret" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const databaseUrl = Deno.env.get("DATABASE_URL");
    if (!databaseUrl) throw new Error("DATABASE_URL not set");

    const sql = postgres(databaseUrl, { ssl: "require", max: 1 });

    await sql.unsafe(`
      drop table if exists employees cascade;
      drop table if exists orders cascade;
      drop table if exists users cascade;
      create table users (id int primary key, name text not null, country text not null, bio text);
      create table orders (id int primary key, user_id int not null references users(id), amount numeric not null, status text not null check (status in ('paid','pending','cancelled')), created_at timestamp default now());
      create table employees (id int primary key, name text not null, role text not null, manager_id int references employees(id));
      insert into users values (1,'Alice','USA','Senior engineer with 10 years experience'), (2,'Bob','USA','Product manager focused on growth'), (3,'Sai','India','Full stack developer and open source contributor');
      insert into orders values (1,1,100,'paid'), (2,1,50,'paid'), (3,1,20,'pending'), (4,2,200,'paid'), (5,2,30,'cancelled'), (6,3,300,'paid'), (7,3,10,'paid');
      insert into employees values (1,'Diana','CEO',NULL), (2,'Eve','VP Engineering',1), (3,'Frank','Eng Manager',2), (4,'Grace','Senior Dev',3), (5,'Heidi','Junior Dev',3), (6,'Ivan','DevOps',2);
    `);

    await sql.end();

    return new Response(JSON.stringify({ ok: true, message: "Reset to seed: 3 users, 7 orders, 6 employees" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
