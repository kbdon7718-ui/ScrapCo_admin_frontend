"use client";

import React, { useMemo } from "react";

import Button from "@/components/admin/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/Card";
import Badge from "@/components/admin/ui/Badge";
import type { PermissionKey, PermissionMatrix, Role } from "@/lib/permissions";
import { defaultPermissionsByRole, roleLabels } from "@/lib/permissions";

const permissionLabels: Record<PermissionKey, string> = {
	view_dashboard: "View Dashboard",
	view_pickups: "View Pickups",
	reassign_pickups: "Reassign Pickups",
	view_vendors: "View Vendors",
	edit_vendors: "Edit Vendors",
	suspend_vendors: "Suspend Vendors",
	view_scrap_catalog: "View Scrap Catalog",
	edit_scrap_catalog: "Edit Scrap Catalog",
	view_rates: "View Rates",
	edit_rates: "Edit Rates",
	view_inventory: "View Inventory",
	view_payments: "View Payments",
	approve_payouts: "Approve Payouts",
	mark_paid: "Mark Paid",
	view_reports: "View Reports",
	admin_access: "Admin Access",
};

const keys: PermissionKey[] = Object.keys(permissionLabels) as PermissionKey[];

export default function AccessPage({
	role,
	onRoleChange,
	overrides,
	onTogglePermission,
	users,
	status,
	error,
	onRefresh,
	onUpdateUserRole,
}: {
	role: Role;
	onRoleChange: (r: Role) => void;
	overrides: Partial<PermissionMatrix>;
	onTogglePermission: (k: PermissionKey) => void;
	users: Array<{ id: string; email: string | null; phone: string | null; createdAt: string | null; role: string | null }>;
	status: "idle" | "loading" | "error";
	error: string;
	onRefresh: () => Promise<void>;
	onUpdateUserRole: (userId: string, nextRole: string) => Promise<void>;
}) {
	const base = defaultPermissionsByRole[role];
	const effective = useMemo(() => ({ ...base, ...overrides }), [base, overrides]);

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
					<div>
						<CardTitle>Users & Roles</CardTitle>
						<CardDescription>Real access control comes from `profiles.role` in Supabase (admin backend enforced).</CardDescription>
					</div>
					<Button onClick={() => void onRefresh()} disabled={status === "loading"}>
						Refresh
					</Button>
				</CardHeader>
				<CardContent>
					{error ? (
						<div className="mb-3 rounded-xl border border-[hsl(var(--warn)/0.35)] bg-[hsl(var(--warn)/0.10)] p-3 text-sm text-[hsl(var(--text))]">
							{error}
						</div>
					) : null}
					<div className="overflow-hidden rounded-xl border border-[hsl(var(--border))]">
						<div className="max-h-[420px] overflow-auto">
							<table className="min-w-full text-sm">
								<thead className="sticky top-0 bg-[hsl(var(--surface))]">
									<tr className="border-b border-[hsl(var(--border))] text-left text-xs text-[hsl(var(--muted))]">
										<th className="px-4 py-3">User</th>
										<th className="px-4 py-3">Role</th>
										<th className="px-4 py-3">Action</th>
									</tr>
								</thead>
								<tbody>
									{users.map((u, idx) => (
										<tr key={u.id} className={idx % 2 === 0 ? "bg-[hsl(var(--surface))]" : "bg-[hsl(var(--surface-2))]"}>
											<td className="px-4 py-3">
												<div className="font-medium">{u.email || u.phone || u.id}</div>
												<div className="text-xs text-[hsl(var(--muted))]">{u.id}</div>
											</td>
											<td className="px-4 py-3">
												<Badge tone={String(u.role || "").toLowerCase() === "admin" ? "green" : "amber"}>
													{u.role || "(none)"}
												</Badge>
											</td>
											<td className="px-4 py-3">
												<div className="flex items-center gap-2">
													<select
														defaultValue={u.role || ""}
														className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm shadow-[var(--shadow-sm)] outline-none"
														onChange={(e) => void onUpdateUserRole(u.id, e.target.value)}
													>
														<option value="">(none)</option>
														<option value="admin">admin</option>
														<option value="viewer">viewer</option>
														<option value="customer">customer</option>
													</select>
												</div>
											</td>
									</tr>
									))}
									{users.length === 0 ? (
										<tr>
											<td colSpan={3} className="px-4 py-10 text-center text-sm text-[hsl(var(--muted))]">
												No users returned.
											</td>
										</tr>
									) : null}
								</tbody>
							</table>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Role Selection</CardTitle>
					<CardDescription>Simulate permissions for different internal teams</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-2">
						{(Object.keys(roleLabels) as Role[]).map((r) => (
							<Button key={r} variant={role === r ? "primary" : "secondary"} onClick={() => onRoleChange(r)}>
								{roleLabels[r]}
							</Button>
						))}
					</div>
					<div className="mt-3 text-sm text-[hsl(var(--muted))]">
						Use the matrix below to toggle UI permissions on/off.
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Permission Matrix</CardTitle>
					<CardDescription>Mock UI permissions — no backend enforcement here</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="overflow-hidden rounded-xl border border-[hsl(var(--border))]">
						<table className="min-w-full text-sm">
							<thead className="bg-[hsl(var(--surface))]">
								<tr className="border-b border-[hsl(var(--border))] text-left text-xs text-[hsl(var(--muted))]">
									<th className="px-4 py-3">Permission</th>
									<th className="px-4 py-3">Base</th>
									<th className="px-4 py-3">Effective</th>
									<th className="px-4 py-3">Toggle</th>
								</tr>
							</thead>
							<tbody>
								{keys.map((k, idx) => (
									<tr key={k} className={idx % 2 === 0 ? "bg-[hsl(var(--surface))]" : "bg-[hsl(var(--surface-2))]"}>
										<td className="px-4 py-3 font-medium">{permissionLabels[k]}</td>
										<td className="px-4 py-3">{base[k] ? <Badge tone="green">Allowed</Badge> : <Badge tone="red">Denied</Badge>}</td>
										<td className="px-4 py-3">{effective[k] ? <Badge tone="green">Allowed</Badge> : <Badge tone="red">Denied</Badge>}</td>
										<td className="px-4 py-3">
											<Button size="sm" variant="ghost" onClick={() => onTogglePermission(k)}>
												Toggle
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
