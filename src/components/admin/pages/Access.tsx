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
}: {
	role: Role;
	onRoleChange: (r: Role) => void;
	overrides: Partial<PermissionMatrix>;
	onTogglePermission: (k: PermissionKey) => void;
}) {
	const base = defaultPermissionsByRole[role];
	const effective = useMemo(() => ({ ...base, ...overrides }), [base, overrides]);

	return (
		<div className="space-y-4">
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
