"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, LogOut, ShieldCheck, User } from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";
import Button from "@/components/admin/ui/Button";
import Badge from "@/components/admin/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/Card";

import { getSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import {
	can,
	computePermissions,
	defaultPermissionsByRole,
	type PermissionKey,
	type PermissionMatrix,
	type Role,
} from "@/lib/permissions";
import {
	mockActivityFeed,
	mockCustomers,
	mockInventory,
	mockPickups,
	mockPayouts,
	mockPickupActivity,
	mockRevenueTrend,
	mockVendors,
	type Pickup,
	type Vendor,
	type Payout,
} from "@/lib/scrapco-data";
import { viewMeta, navGroups, type ViewId } from "@/components/admin/nav";

import DashboardPage from "@/components/admin/pages/Dashboard";
import PickupsPage from "@/components/admin/pages/Pickups";
import VendorsPage from "@/components/admin/pages/Vendors";
import InventoryPage from "@/components/admin/pages/Inventory";
import PaymentsPage from "@/components/admin/pages/Payments";
import ReportsPage from "@/components/admin/pages/Reports";
import AccessPage from "@/components/admin/pages/Access";
import ScrapCatalogPage from "@/components/admin/pages/ScrapCatalog";
import RatesPage from "@/components/admin/pages/Rates";

type ApiStatus = "idle" | "loading" | "error";

type AdminScrapType = {
	id: string;
	name: string;
	ratePerKg: number | null;
	effectiveFrom: string | null;
};

type Status = "idle" | "loading" | "error";

function getApiBaseUrlOrNull() {
	const url = process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_API_URL;
	if (!url) return null;
	return url.replace(/\/$/, "");
}

async function readJsonSafely(res: Response) {
	const text = await res.text();
	if (!text) return null;
	try {
		return JSON.parse(text) as unknown;
	} catch {
		return null;
	}
}

async function apiFetch(sessionToken: string, path: string, init?: RequestInit) {
	const base = getApiBaseUrlOrNull();
	if (!base) throw new Error("Missing NEXT_PUBLIC_API_BASE");
	const res = await fetch(`${base}${path}`, {
		...(init || {}),
		headers: {
			Authorization: `Bearer ${sessionToken}`,
			"Content-Type": "application/json",
			...(init?.headers || {}),
		},
	});
	const json = (await readJsonSafely(res)) as any;
	if (!res.ok) {
		throw new Error(json?.error || `Request failed (${res.status})`);
	}
	return json;
}

export default function AdminApp() {
	// Auth
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [authStatus, setAuthStatus] = useState<Status>("idle");
	const [authError, setAuthError] = useState<string>("");

	const [sessionToken, setSessionToken] = useState<string>("");
	const [sessionEmail, setSessionEmail] = useState<string>("");

	const [adminStatus, setAdminStatus] = useState<Status>("idle");
	const [isAdmin, setIsAdmin] = useState<boolean>(false);
	const [adminError, setAdminError] = useState<string>("");
	const [previewMode, setPreviewMode] = useState<boolean>(false);

	// UI shell
	const [activeView, setActiveView] = useState<ViewId>("dashboard");
	const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
	const [mobileOpen, setMobileOpen] = useState<boolean>(false);
	const [globalSearch, setGlobalSearch] = useState<string>("");

	// Role simulation
	const [role, setRole] = useState<Role>("super_admin");
	const [permissionOverrides, setPermissionOverrides] = useState<Partial<PermissionMatrix>>({});

	// Mock data state (mutable)
	const [pickups, setPickups] = useState<Pickup[]>(() => mockPickups);
	const [vendors, setVendors] = useState<Vendor[]>(() => mockVendors);
	const [payouts, setPayouts] = useState<Payout[]>(() => mockPayouts);

	const [scrapTypes, setScrapTypes] = useState<AdminScrapType[]>([]);
	const [scrapStatus, setScrapStatus] = useState<ApiStatus>("idle");
	const [scrapError, setScrapError] = useState<string>("");

	const permissions = useMemo(() => computePermissions(role, permissionOverrides), [role, permissionOverrides]);

	const canView = useCallback(
		(view: ViewId) => {
			const map: Record<ViewId, PermissionKey> = {
				dashboard: "view_dashboard",
				pickups: "view_pickups",
				vendors: "view_vendors",
				scrap: "view_scrap_catalog",
				rates: "view_rates",
				inventory: "view_inventory",
				payments: "view_payments",
				reports: "view_reports",
				access: "admin_access",
			};
			return can(permissions, map[view]);
		},
		[permissions],
	);

	useEffect(() => {
		try {
			const stored = window.localStorage.getItem("scrapco_admin_view");
			if (
				stored &&
				["dashboard", "pickups", "vendors", "scrap", "rates", "inventory", "payments", "reports", "access"].includes(stored)
			) {
				setActiveView(stored as ViewId);
			}
		} catch {
			// ignore
		}
	}, []);

	useEffect(() => {
		try {
			window.localStorage.setItem("scrapco_admin_view", activeView);
		} catch {
			// ignore
		}
	}, [activeView]);

	// Ensure active view is allowed
	useEffect(() => {
		if (canView(activeView)) return;
		const fallback = (navGroups.flatMap((g) => g.items).map((i) => i.id) as ViewId[]).find((v) => canView(v));
		if (fallback) setActiveView(fallback);
	}, [activeView, canView]);

	useEffect(() => {
		let unsub: { data: { subscription: { unsubscribe: () => void } } } | null = null;
		let cancelled = false;

		async function init() {
			try {
				const supabase = getSupabaseBrowserClient();
				const { data } = await supabase.auth.getSession();
				if (!cancelled) {
					setSessionToken(data.session?.access_token ?? "");
					setSessionEmail(data.session?.user?.email ?? "");
				}
				unsub = supabase.auth.onAuthStateChange((_event, session) => {
					setSessionToken(session?.access_token ?? "");
					setSessionEmail(session?.user?.email ?? "");
				});
			} catch (e) {
				setAuthError(e instanceof Error ? e.message : "Supabase is not configured");
			}
		}

		init();
		return () => {
			cancelled = true;
			try {
				unsub?.data?.subscription?.unsubscribe();
			} catch {
				// ignore
			}
		};
	}, []);

	useEffect(() => {
		let cancelled = false;
		async function verify() {
			setAdminError("");
			setIsAdmin(false);
			setPreviewMode(false);
			if (!sessionToken) return;

			const base = getApiBaseUrlOrNull();
			if (!base) {
				setAdminError("Missing NEXT_PUBLIC_API_BASE. Set it to your admin backend URL (e.g. http://localhost:3007). You can still Preview UI.");
				return;
			}

			setAdminStatus("loading");
			try {
				const res = await fetch(`${base}/api/admin/me`, {
					headers: { Authorization: `Bearer ${sessionToken}` },
				});
				const json = (await readJsonSafely(res)) as any;
				if (!res.ok) {
					throw new Error(json?.error || `Admin check failed (${res.status})`);
				}
				if (!cancelled) {
					setIsAdmin(Boolean(json?.isAdmin));
					setAdminStatus("idle");
					if (!json?.isAdmin) setAdminError("Admin access required. Set profiles.role = 'admin' for this user in Supabase.");
				}
			} catch (e) {
				if (!cancelled) {
					setAdminStatus("error");
					setAdminError(e instanceof Error ? e.message : "Admin check failed");
				}
			}
		}
		verify();
		return () => {
			cancelled = true;
		};
	}, [sessionToken]);

	const refreshScrapTypes = useCallback(async () => {
		setScrapError("");
		setScrapStatus("loading");
		try {
			const json = await apiFetch(sessionToken, "/api/admin/scrap-types");
			const rows = (json?.scrapTypes || []) as AdminScrapType[];
			setScrapTypes(rows);
			setScrapStatus("idle");
		} catch (e) {
			setScrapStatus("error");
			setScrapError(e instanceof Error ? e.message : "Failed to load scrap types");
		}
	}, [sessionToken]);

	useEffect(() => {
		if (!sessionToken) return;
		if (!isAdmin) return;
		if (!getApiBaseUrlOrNull()) return;
		refreshScrapTypes();
	}, [sessionToken, isAdmin, refreshScrapTypes]);

	const notificationCount = useMemo(() => {
		const pending = pickups.filter((p) => p.status === "Pending").length;
		const payoutPending = payouts.filter((p) => p.status === "Pending").length;
		return pending + payoutPending;
	}, [pickups, payouts]);

	const isUnlocked = Boolean(previewMode || isAdmin);

	async function signIn() {
		setAuthError("");
		setAuthStatus("loading");
		try {
			const supabase = getSupabaseBrowserClient();
			const { error } = await supabase.auth.signInWithPassword({ email, password });
			if (error) throw error;
			setAuthStatus("idle");
		} catch (e) {
			setAuthStatus("error");
			setAuthError(e instanceof Error ? e.message : "Sign-in failed");
		}
	}

	async function signOut() {
		try {
			const supabase = getSupabaseBrowserClient();
			await supabase.auth.signOut();
		} catch {
			// ignore
		}
	}

	const header = useMemo(() => {
		const meta = viewMeta[activeView];
		const Icon = meta.icon;
		return (
			<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-sm)]">
							<Icon size={18} />
						</div>
						<div className="min-w-0">
							<div className="font-display text-xl font-semibold tracking-tight">{meta.title}</div>
							<div className="truncate text-sm text-[hsl(var(--muted))]">{meta.subtitle}</div>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{sessionEmail ? (
						<div className="hidden items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm text-[hsl(var(--muted))] shadow-[var(--shadow-sm)] md:flex">
							<User size={16} />
							<span className="max-w-[240px] truncate">{sessionEmail}</span>
							{isAdmin ? <Badge tone="green"><ShieldCheck className="mr-1" size={14} />Admin</Badge> : null}
							{previewMode ? <Badge tone="amber">Preview</Badge> : null}
						</div>
					) : null}
					{sessionEmail ? (
						<Button variant="ghost" onClick={signOut}>
							<LogOut size={16} />
							Sign out
						</Button>
					) : null}
				</div>
			</div>
		);
	}, [activeView, sessionEmail, isAdmin, previewMode]);

	const onSearchSubmit = useCallback(() => {
		const q = globalSearch.trim();
		if (!q) return;
		const pickup = pickups.find((p) => p.id.toLowerCase() === q.toLowerCase());
		if (pickup) {
			setActiveView("pickups");
			// quick view handled by Pickups page action (we keep it minimal here)
			return;
		}
		const vendor = vendors.find((v) => v.name.toLowerCase().includes(q.toLowerCase()));
		if (vendor) {
			setActiveView("vendors");
		}
	}, [globalSearch, pickups, vendors]);

	const onTogglePermission = useCallback((key: PermissionKey) => {
		setPermissionOverrides((prev) => {
			const next = { ...prev };
			const current = next[key];
			if (current === undefined) next[key] = !defaultPermissionsByRole[role][key];
			else next[key] = !current;
			return next;
		});
	}, [role]);

	const onUpdatePickup = useCallback((pickupId: string, patch: Partial<Pickup>) => {
		setPickups((prev) => prev.map((p) => (p.id === pickupId ? { ...p, ...patch } : p)));
	}, []);

	const onUpdateVendor = useCallback((vendorId: string, patch: Partial<Vendor>) => {
		setVendors((prev) => prev.map((v) => (v.id === vendorId ? { ...v, ...patch } : v)));
	}, []);

	const onUpdatePayout = useCallback((payoutId: string, patch: Partial<Payout>) => {
		setPayouts((prev) => prev.map((p) => (p.id === payoutId ? { ...p, ...patch } : p)));
	}, []);

	const onCreateScrapType = useCallback(
		async (name: string) => {
			await apiFetch(sessionToken, "/api/admin/scrap-types", {
				method: "POST",
				body: JSON.stringify({ name }),
			});
			await refreshScrapTypes();
		},
		[sessionToken, refreshScrapTypes],
	);

	const onRenameScrapType = useCallback(
		async (id: string, name: string) => {
			await apiFetch(sessionToken, `/api/admin/scrap-types/${encodeURIComponent(id)}`, {
				method: "PATCH",
				body: JSON.stringify({ name }),
			});
			await refreshScrapTypes();
		},
		[sessionToken, refreshScrapTypes],
	);

	const onSetRate = useCallback(
		async (scrapTypeId: string, ratePerKg: number) => {
			await apiFetch(sessionToken, "/api/admin/scrap-rates", {
				method: "POST",
				body: JSON.stringify({ scrapTypeId, ratePerKg }),
			});
			await refreshScrapTypes();
		},
		[sessionToken, refreshScrapTypes],
	);

	const [openPickupId, setOpenPickupId] = useState<string | null>(null);
	const openPickup = useMemo(() => (openPickupId ? pickups.find((p) => p.id === openPickupId) || null : null), [openPickupId, pickups]);
	const byCustomer = useMemo(() => new Map(mockCustomers.map((c) => [c.id, c] as const)), []);
	const byVendor = useMemo(() => new Map(vendors.map((v) => [v.id, v] as const)), [vendors]);

	if (!sessionToken) {
		return (
			<div className="mx-auto max-w-lg px-4 py-10">
				<Card className="shadow-[var(--shadow-md)]">
					<CardHeader>
						<CardTitle className="text-lg">ScrapCo Staff Admin</CardTitle>
						<CardDescription>Sign in with your staff account.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="text-xs text-[hsl(var(--muted))]">Email</label>
							<input
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="mt-2 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm shadow-[var(--shadow-sm)] outline-none"
								autoComplete="email"
							/>
						</div>
						<div>
							<label className="text-xs text-[hsl(var(--muted))]">Password</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="mt-2 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm shadow-[var(--shadow-sm)] outline-none"
								autoComplete="current-password"
							/>
						</div>
						{authError ? (
							<div className="rounded-xl border border-[hsl(var(--danger)/0.35)] bg-[hsl(var(--danger)/0.08)] p-3 text-sm text-[hsl(var(--danger))]">
								{authError}
							</div>
						) : null}
						<Button variant="primary" onClick={signIn} disabled={authStatus === "loading"}>
							Sign in
						</Button>
						<div className="text-xs text-[hsl(var(--muted))]">This UI uses mock data after login.</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!isUnlocked) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-10">
				<Card className="shadow-[var(--shadow-md)]">
					<CardHeader>
						<CardTitle className="text-lg">Access Gate</CardTitle>
						<CardDescription>We verify staff access using the admin backend.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{adminStatus === "loading" ? (
							<div className="text-sm text-[hsl(var(--muted))]">Checking admin role…</div>
						) : null}
						{adminError ? (
							<div className="flex items-start gap-3 rounded-xl border border-[hsl(var(--warn)/0.35)] bg-[hsl(var(--warn)/0.10)] p-3 text-sm text-[hsl(var(--text))]">
								<AlertTriangle size={18} className="mt-0.5 text-[hsl(var(--warn))]" />
								<div>
									<div className="font-medium">{adminError}</div>
									<div className="mt-1 text-xs text-[hsl(var(--muted))]">For a design demo, you can preview the full panel without backend checks.</div>
								</div>
							</div>
						) : null}
						<div className="flex flex-wrap items-center gap-2">
							<Button variant="primary" onClick={() => setPreviewMode(true)}>
								Preview UI (mock)
							</Button>
							<Button variant="ghost" onClick={signOut}>
								Sign out
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<>
			<AdminShell
				brand="ScrapCo Admin"
				groups={navGroups}
				activeView={activeView}
				onNavigate={setActiveView}
				sidebarCollapsed={sidebarCollapsed}
				onToggleSidebar={() => setSidebarCollapsed((s) => !s)}
				mobileOpen={mobileOpen}
				onSetMobileOpen={setMobileOpen}
				notificationCount={notificationCount}
				searchValue={globalSearch}
				onSearchChange={setGlobalSearch}
				onSearchSubmit={onSearchSubmit}
				header={header}
				canView={canView}
			>
				{activeView === "dashboard" ? (
					<DashboardPage
						pickups={pickups}
						vendors={vendors}
						payouts={payouts}
						inventory={mockInventory}
						revenueTrend={mockRevenueTrend}
						pickupActivity={mockPickupActivity}
						activityFeed={mockActivityFeed}
					/>
				) : null}

				{activeView === "pickups" ? (
					<PickupsPage
						pickups={pickups}
						customers={mockCustomers}
						vendors={vendors}
						permissions={permissions}
						onUpdatePickup={onUpdatePickup}
						onOpenPickup={(id) => setOpenPickupId(id)}
					/>
				) : null}

				{activeView === "vendors" ? (
					<VendorsPage vendors={vendors} pickups={pickups} permissions={permissions} onUpdateVendor={onUpdateVendor} />
				) : null}

				{activeView === "scrap" ? (
					<ScrapCatalogPage
						scrapTypes={scrapTypes}
						status={scrapStatus}
						error={scrapError}
						permissions={permissions}
						onCreateScrapType={onCreateScrapType}
						onRenameScrapType={onRenameScrapType}
						onRefresh={refreshScrapTypes}
					/>
				) : null}

				{activeView === "rates" ? (
					<RatesPage
						scrapTypes={scrapTypes}
						status={scrapStatus}
						error={scrapError}
						permissions={permissions}
						onSetRate={onSetRate}
						onRefresh={refreshScrapTypes}
					/>
				) : null}

				{activeView === "inventory" ? <InventoryPage inventory={mockInventory} /> : null}

				{activeView === "payments" ? (
					<PaymentsPage
						payouts={payouts}
						vendors={vendors}
						pickups={pickups}
						permissions={permissions}
						onUpdatePayout={onUpdatePayout}
					/>
				) : null}

				{activeView === "reports" ? (
					<ReportsPage revenueTrend={mockRevenueTrend} inventory={mockInventory} vendors={vendors} pickups={pickups} />
				) : null}

				{activeView === "access" ? (
					<AccessPage
						role={role}
						onRoleChange={setRole}
						overrides={permissionOverrides}
						onTogglePermission={onTogglePermission}
					/>
				) : null}
			</AdminShell>

			<AnimatePresence>
				{openPickup ? (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50">
						<div className="absolute inset-0 bg-black/40" onClick={() => setOpenPickupId(null)} />
						<motion.div
							initial={{ y: 18, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: 18, opacity: 0 }}
							transition={{ duration: 0.16 }}
							className="absolute left-1/2 top-1/2 w-[92vw] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-[var(--shadow-xl)]"
						>
							<div className="flex items-start justify-between gap-3">
								<div>
									<div className="font-display text-sm font-semibold">{openPickup.id}</div>
									<div className="text-xs text-[hsl(var(--muted))]">Quick-view drawer (mock)</div>
								</div>
								<Button variant="ghost" onClick={() => setOpenPickupId(null)} aria-label="Close quick view">
									Close
								</Button>
							</div>

							<div className="mt-4 grid grid-cols-2 gap-3 text-sm">
								<div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-3">
									<div className="text-xs text-[hsl(var(--muted))]">Customer</div>
									<div className="mt-1 font-medium">{byCustomer.get(openPickup.customerId)?.name || "—"}</div>
								</div>
								<div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-3">
									<div className="text-xs text-[hsl(var(--muted))]">Vendor</div>
									<div className="mt-1 font-medium">{openPickup.vendorId ? byVendor.get(openPickup.vendorId)?.name || "—" : "Unassigned"}</div>
								</div>
								<div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-3">
									<div className="text-xs text-[hsl(var(--muted))]">Status</div>
									<div className="mt-1">
										<Badge tone={openPickup.status === "Completed" ? "green" : openPickup.status === "Pending" ? "amber" : openPickup.status === "Assigned" ? "blue" : "red"}>
											{openPickup.status}
										</Badge>
									</div>
								</div>
								<div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-3">
									<div className="text-xs text-[hsl(var(--muted))]">Scrap</div>
									<div className="mt-1 font-medium">{openPickup.scrapType}</div>
								</div>
							</div>
						</motion.div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</>
	);
}
