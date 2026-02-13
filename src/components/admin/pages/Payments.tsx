"use client";

import React, { useMemo, useState } from "react";

import Button from "@/components/admin/ui/Button";
import Badge from "@/components/admin/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/Card";
import { formatCurrencyInr, formatDateTime } from "@/lib/format";
import type { Payout, Vendor, Pickup } from "@/lib/scrapco-data";
import type { PermissionMatrix } from "@/lib/permissions";
import { can } from "@/lib/permissions";

type Range = "7d" | "30d" | "90d";

function inRange(iso: string, range: Range) {
	const d = new Date(iso).getTime();
	const now = Date.now();
	const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
	return d >= now - days * 24 * 60 * 60 * 1000;
}

export default function PaymentsPage({
	payouts,
	vendors,
	pickups,
	permissions,
	onUpdatePayout,
}: {
	payouts: Payout[];
	vendors: Vendor[];
	pickups: Pickup[];
	permissions: PermissionMatrix;
	onUpdatePayout: (payoutId: string, patch: Partial<Payout>) => void;
}) {
	const [range, setRange] = useState<Range>("30d");

	const byVendor = useMemo(() => new Map(vendors.map((v) => [v.id, v] as const)), [vendors]);

	const visible = useMemo(() => payouts.filter((p) => inRange(p.createdAt, range)), [payouts, range]);

	const totalCommission = useMemo(() => {
		const vById = new Map(vendors.map((v) => [v.id, v] as const));
		return pickups
			.filter((p) => p.status === "Completed" && p.vendorId)
			.reduce((acc, p) => {
				const v = p.vendorId ? vById.get(p.vendorId) : null;
				const pct = v ? v.commissionPct : 10;
				return acc + (p.amountInr * pct) / 100;
			}, 0);
	}, [pickups, vendors]);

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
				<Card className="xl:col-span-2">
					<CardHeader>
						<CardTitle>Payout Approval</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between gap-3">
							<div className="text-sm text-[hsl(var(--muted))]">Filter</div>
							<select
								value={range}
								onChange={(e) => setRange(e.target.value as Range)}
								className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm shadow-[var(--shadow-sm)]"
							>
								<option value="7d">Last 7 days</option>
								<option value="30d">Last 30 days</option>
								<option value="90d">Last 90 days</option>
							</select>
						</div>

						<div className="mt-4 overflow-hidden rounded-xl border border-[hsl(var(--border))]">
							<table className="min-w-full text-sm">
								<thead className="bg-[hsl(var(--surface))]">
									<tr className="border-b border-[hsl(var(--border))] text-left text-xs text-[hsl(var(--muted))]">
										<th className="px-4 py-3">Vendor</th>
										<th className="px-4 py-3">Period</th>
										<th className="px-4 py-3">Amount</th>
										<th className="px-4 py-3">Status</th>
										<th className="px-4 py-3">Actions</th>
									</tr>
								</thead>
								<tbody>
									{visible.map((p, idx) => {
										const v = byVendor.get(p.vendorId);
										return (
											<tr key={p.id} className={idx % 2 === 0 ? "bg-[hsl(var(--surface))]" : "bg-[hsl(var(--surface-2))]"}>
												<td className="px-4 py-3">
													<div className="font-medium">{v?.name || "—"}</div>
													<div className="text-xs text-[hsl(var(--muted))]">{formatDateTime(p.createdAt)}</div>
												</td>
												<td className="px-4 py-3">{p.periodLabel}</td>
												<td className="px-4 py-3">{formatCurrencyInr(p.amountInr)}</td>
												<td className="px-4 py-3">
													{p.status === "Pending" ? (
														<Badge tone="amber">Pending</Badge>
													) : p.status === "Approved" ? (
														<Badge tone="blue">Approved</Badge>
													) : (
														<Badge tone="green">Paid</Badge>
													)}
												</td>
												<td className="px-4 py-3">
													<div className="flex items-center gap-2">
														<Button
															size="sm"
															variant="ghost"
															disabled={!can(permissions, "approve_payouts") || p.status !== "Pending"}
															onClick={() => onUpdatePayout(p.id, { status: "Approved" })}
														>
															Approve
														</Button>
														<Button
															size="sm"
															variant="primary"
															disabled={!can(permissions, "mark_paid") || p.status === "Paid"}
															onClick={() => onUpdatePayout(p.id, { status: "Paid" })}
														>
															Mark Paid
														</Button>
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Commission Tracker</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-xs text-[hsl(var(--muted))]">Platform earnings (mock)</div>
						<div className="mt-2 font-display text-3xl font-semibold tracking-tight">{formatCurrencyInr(Math.round(totalCommission))}</div>
						<div className="mt-4 text-sm text-[hsl(var(--muted))]">Use Access Control to simulate role-based visibility.</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
