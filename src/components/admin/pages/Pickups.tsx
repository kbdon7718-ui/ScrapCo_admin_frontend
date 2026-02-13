"use client";

import React, { useMemo, useState } from "react";
import { ChevronRight, Eye, RefreshCw } from "lucide-react";

import Badge from "@/components/admin/ui/Badge";
import Button from "@/components/admin/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/Card";
import { formatCurrencyInr, formatDateTime, formatKg } from "@/lib/format";
import type { Customer, Pickup, PickupStatus, Vendor } from "@/lib/scrapco-data";
import type { PermissionMatrix } from "@/lib/permissions";
import { can } from "@/lib/permissions";

function toneForStatus(s: PickupStatus) {
	if (s === "Completed") return "green" as const;
	if (s === "Assigned") return "blue" as const;
	if (s === "Pending") return "amber" as const;
	return "red" as const;
}

export default function PickupsPage({
	pickups,
	customers,
	vendors,
	onUpdatePickup,
	permissions,
	onOpenPickup,
}: {
	pickups: Pickup[];
	customers: Customer[];
	vendors: Vendor[];
	onUpdatePickup: (pickupId: string, patch: Partial<Pickup>) => void;
	permissions: PermissionMatrix;
	onOpenPickup: (pickupId: string) => void;
}) {
	const [statusFilter, setStatusFilter] = useState<PickupStatus | "All">("All");
	const [search, setSearch] = useState<string>("");

	const byCustomer = useMemo(() => new Map(customers.map((c) => [c.id, c] as const)), [customers]);
	const byVendor = useMemo(() => new Map(vendors.map((v) => [v.id, v] as const)), [vendors]);

	const rows = useMemo(() => {
		const q = search.trim().toLowerCase();
		return pickups
			.filter((p) => (statusFilter === "All" ? true : p.status === statusFilter))
			.filter((p) => {
				if (!q) return true;
				const c = byCustomer.get(p.customerId);
				const v = p.vendorId ? byVendor.get(p.vendorId) : null;
				return (
					p.id.toLowerCase().includes(q) ||
					p.scrapType.toLowerCase().includes(q) ||
					(c?.name || "").toLowerCase().includes(q) ||
					(v?.name || "").toLowerCase().includes(q)
				);
			})
			.slice()
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	}, [pickups, statusFilter, search, byCustomer, byVendor]);

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Real-time Table</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-3 md:flex-row md:items-center">
						<input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search pickup, customer, vendor…"
							className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm shadow-[var(--shadow-sm)] outline-none focus:border-[hsl(var(--secondary)/0.45)]"
						/>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value as any)}
							className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm shadow-[var(--shadow-sm)] outline-none md:w-[220px]"
						>
							<option value="All">All statuses</option>
							<option value="Pending">Pending</option>
							<option value="Assigned">Assigned</option>
							<option value="Completed">Completed</option>
							<option value="Cancelled">Cancelled</option>
						</select>
					</div>

					<div className="mt-4 overflow-hidden rounded-xl border border-[hsl(var(--border))]">
						<div className="max-h-[520px] overflow-auto">
							<table className="min-w-full text-sm">
								<thead className="sticky top-0 bg-[hsl(var(--surface))]">
									<tr className="border-b border-[hsl(var(--border))] text-left text-xs text-[hsl(var(--muted))]">
										<th className="px-4 py-3">Pickup</th>
										<th className="px-4 py-3">Customer</th>
										<th className="px-4 py-3">Vendor</th>
										<th className="px-4 py-3">Scrap</th>
										<th className="px-4 py-3">Weight</th>
										<th className="px-4 py-3">Amount</th>
										<th className="px-4 py-3">Status</th>
										<th className="px-4 py-3">Actions</th>
									</tr>
								</thead>
								<tbody>
									{rows.map((p, idx) => {
										const c = byCustomer.get(p.customerId);
										const v = p.vendorId ? byVendor.get(p.vendorId) : null;
										return (
											<tr
												key={p.id}
												className={idx % 2 === 0 ? "bg-[hsl(var(--surface))]" : "bg-[hsl(var(--surface-2))]"}
											>
												<td className="px-4 py-3">
													<div className="font-medium">{p.id}</div>
													<div className="text-xs text-[hsl(var(--muted))]">{formatDateTime(p.createdAt)}</div>
												</td>
												<td className="px-4 py-3">
													<div className="font-medium">{c?.name || "—"}</div>
													<div className="text-xs text-[hsl(var(--muted))]">{c?.city || ""}</div>
												</td>
												<td className="px-4 py-3">
													<div className="font-medium">{v?.name || "Unassigned"}</div>
													<div className="text-xs text-[hsl(var(--muted))]">{v?.city || ""}</div>
												</td>
												<td className="px-4 py-3">
													<div className="font-medium">{p.scrapType}</div>
													<div className="text-xs text-[hsl(var(--muted))]">{p.category}</div>
												</td>
												<td className="px-4 py-3">{formatKg(p.weightKg)}</td>
												<td className="px-4 py-3">{formatCurrencyInr(p.amountInr)}</td>
												<td className="px-4 py-3">
													<Badge tone={toneForStatus(p.status)}>{p.status}</Badge>
												</td>
												<td className="px-4 py-3">
													<div className="flex items-center gap-2">
														<Button size="sm" onClick={() => onOpenPickup(p.id)}>
															<Eye size={14} />
															Quick view
														</Button>

														<Button
															size="sm"
															variant="ghost"
															disabled={!can(permissions, "reassign_pickups")}
															onClick={() => {
																if (!can(permissions, "reassign_pickups")) return;
																const next = vendors.find((x) => !x.isSuspended && x.id !== p.vendorId) || null;
																onUpdatePickup(p.id, { vendorId: next?.id ?? null, status: next ? "Assigned" : "Pending" });
															}}
															aria-label="Reassign pickup (mock)"
															title={can(permissions, "reassign_pickups") ? "Reassign (mock)" : "No permission"}
														>
															<RefreshCw size={14} />
															Reassign
														</Button>

														<Button size="sm" variant="ghost" onClick={() => onNavigateToDetails(p.id)} className="hidden">
															<ChevronRight size={14} />
															Details
														</Button>
													</div>
												</td>
											</tr>
										);
									})}
									{rows.length === 0 ? (
										<tr>
											<td colSpan={8} className="px-4 py-10 text-center text-sm text-[hsl(var(--muted))]">
												No pickups match your filters.
											</td>
										</tr>
									) : null}
								</tbody>
							</table>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);

	function onNavigateToDetails(_pickupId: string) {
		// placeholder for future deep-link routing
	}
}
