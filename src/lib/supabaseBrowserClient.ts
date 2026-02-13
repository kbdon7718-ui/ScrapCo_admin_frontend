import { createClient } from "@supabase/supabase-js";

export function getSupabaseBrowserClient() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!url) {
		throw new Error(
			"Missing NEXT_PUBLIC_SUPABASE_URL. Set it in .env (or .env.local) and restart the dev server.",
		);
	}
	if (!anonKey) {
		throw new Error(
			"Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Set it in .env (or .env.local) and restart the dev server.",
		);
	}

	return createClient(url, anonKey, {
		auth: {
			persistSession: true,
			autoRefreshToken: true,
			detectSessionInUrl: true,
		},
	});
}

