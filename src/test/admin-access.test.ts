import { describe, it, expect, beforeAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

/**
 * Test credentials are optional. Set these env vars to also exercise the
 * authenticated paths against real users in the project:
 *   TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD  -> a user that exists in admin_users
 *   TEST_USER_EMAIL  / TEST_USER_PASSWORD   -> a regular (non-admin) user
 */
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;
const USER_EMAIL = process.env.TEST_USER_EMAIL;
const USER_PASSWORD = process.env.TEST_USER_PASSWORD;

const hasAdmin = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD);
const hasUser = Boolean(USER_EMAIL && USER_PASSWORD);

function makeClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

describe("admin authorization (anon)", () => {
  const anon = makeClient();

  it("is_admin RPC is not callable by anonymous users", async () => {
    const { data, error } = await anon.rpc("is_admin", {
      _user_id: "00000000-0000-0000-0000-000000000000",
    });
    // Either denied (preferred) or returns false. It must never return true.
    expect(data === true).toBe(false);
    if (!error) expect(data).toBe(false);
  });

  it("anon cannot read supplement_audit_log", async () => {
    const { data, error } = await anon.from("supplement_audit_log").select("id").limit(1);
    // RLS policies are TO authenticated only -> anon yields no rows (or error).
    if (error) {
      expect(error).toBeTruthy();
    } else {
      expect(data ?? []).toEqual([]);
    }
  });

  it("anon cannot insert into supplement_audit_log", async () => {
    const { error } = await anon.from("supplement_audit_log").insert({
      supplement_name: "anon-attack",
      operation: "insert",
    } as any);
    expect(error).toBeTruthy();
  });

  it("anon cannot update supplement_audit_log", async () => {
    const { error, data } = await anon
      .from("supplement_audit_log")
      .update({ supplement_name: "tampered" })
      .neq("id", "00000000-0000-0000-0000-000000000000")
      .select();
    // Either an explicit error or zero rows affected.
    if (!error) expect(data ?? []).toEqual([]);
  });

  it("anon cannot delete from supplement_audit_log", async () => {
    const { error, data } = await anon
      .from("supplement_audit_log")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000")
      .select();
    if (!error) expect(data ?? []).toEqual([]);
  });

  it("anon cannot read admin_users", async () => {
    const { data, error } = await anon.from("admin_users").select("id").limit(1);
    if (error) {
      expect(error).toBeTruthy();
    } else {
      expect(data ?? []).toEqual([]);
    }
  });

  it("anon cannot insert into admin_users", async () => {
    const { error } = await anon
      .from("admin_users")
      .insert({ email: "evil@example.com" } as any);
    expect(error).toBeTruthy();
  });
});

describe.skipIf(!hasUser)("admin authorization (non-admin user)", () => {
  const client = makeClient();

  beforeAll(async () => {
    const { error } = await client.auth.signInWithPassword({
      email: USER_EMAIL!,
      password: USER_PASSWORD!,
    });
    if (error) throw error;
  });

  it("is_admin returns false for a non-admin user's own id", async () => {
    const { data: userRes } = await client.auth.getUser();
    const uid = userRes.user?.id;
    expect(uid).toBeTruthy();
    const { data, error } = await client.rpc("is_admin", { _user_id: uid! });
    expect(error).toBeNull();
    expect(data).toBe(false);
  });

  it("non-admin cannot read supplement_audit_log", async () => {
    const { data, error } = await client.from("supplement_audit_log").select("id").limit(1);
    if (error) expect(error).toBeTruthy();
    else expect(data ?? []).toEqual([]);
  });

  it("non-admin cannot insert supplement_audit_log rows", async () => {
    const { error } = await client.from("supplement_audit_log").insert({
      supplement_name: "non-admin-attack",
      operation: "insert",
    } as any);
    expect(error).toBeTruthy();
  });

  it("non-admin cannot read other admin_users rows", async () => {
    const { data } = await client.from("admin_users").select("id");
    // Policy allows only their own row; a non-admin should see zero rows.
    expect(data ?? []).toEqual([]);
  });
});

describe.skipIf(!hasAdmin)("admin authorization (admin user)", () => {
  const client = makeClient();

  beforeAll(async () => {
    const { error } = await client.auth.signInWithPassword({
      email: ADMIN_EMAIL!,
      password: ADMIN_PASSWORD!,
    });
    if (error) throw error;
  });

  it("is_admin returns true for the admin user's own id", async () => {
    const { data: userRes } = await client.auth.getUser();
    const uid = userRes.user?.id;
    expect(uid).toBeTruthy();
    const { data, error } = await client.rpc("is_admin", { _user_id: uid! });
    expect(error).toBeNull();
    expect(data).toBe(true);
  });

  it("admin can read supplement_audit_log", async () => {
    const { error } = await client.from("supplement_audit_log").select("id").limit(1);
    expect(error).toBeNull();
  });

  it("admin can read their own admin_users record", async () => {
    const { data: userRes } = await client.auth.getUser();
    const uid = userRes.user?.id;
    const { data, error } = await client
      .from("admin_users")
      .select("id, user_id")
      .eq("user_id", uid!);
    expect(error).toBeNull();
    expect((data ?? []).length).toBeGreaterThan(0);
  });
});