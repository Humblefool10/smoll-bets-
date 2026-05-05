import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// deletes the caller's auth user. cascades through profiles.id → cascades
// through logs / circle_members / reactions (all FK CASCADE on profiles.id
// delete). service role key is needed because users cannot delete themselves
// from the auth tables via the public API.
//
// security: the access token verifies the caller's identity and we only
// delete THAT id. there is no path to delete someone else.

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "missing auth" }, { status: 401 });
  }
  const accessToken = authHeader.slice(7);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json(
      { error: "server misconfigured (missing SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 500 },
    );
  }

  // verify the caller using their token
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const {
    data: { user },
    error: authErr,
  } = await userClient.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "invalid session" }, { status: 401 });
  }

  // perform the delete with service role (bypasses RLS, can touch auth tables)
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: delErr } = await adminClient.auth.admin.deleteUser(user.id);
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
