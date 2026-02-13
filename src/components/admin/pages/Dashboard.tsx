"use client";

import React, { useMemo } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/Card";
import Badge from "@/components/admin/ui/Badge";
import { formatCurrencyInr, formatKg, formatDateTime } from "@/lib/format";
import type { ActivityItem, ActivityPoint, Pickup, RevenuePoint, Vendor, Payout, InventorySnapshot } from "@/lib/scrapco-data";

function kpiTone(label: string) {
	if (/revenue|commission/i.test(label)) return "green" as const;
	if (/payout/i.test(label)) return "amber" as const;
	if (/vendor/i.test(label)) return "blue" as const;
	return "neutral" as const;
}

export default function DashboardPage({
	pickups,
	vendors,
	payouts,
	inventory,
	revenueTrend,
	pickupActivity,
	activityFeed,
}: {
	pickups: Pickup[];
	vendors: Vendor[];
	payouts: Payout[];
	inventory: InventorySnapshot;
	revenueTrend: RevenuePoint[];
	pickupActivity: ActivityPoint[];
	activityFeed: ActivityItem[];
}) {
	const now = Date.now();
	const last24h = useMemo(() => now - 24 * 60 * 60 * 1000, [now]);

	const pickupsToday = useMemo(() => pickups.filter((p) => new Date(p.createdAt).getTime() >= last24h).length, [pickups, last24h]);
	const activeVendors = useMemo(() => vendors.filter((v) => !v.isSuspended).length, [vendors]);
	const grossRevenue = useMemo(
		() => pickups.filter((p) => p.status === "Completed").reduce((acc, p) => acc + p.amountInr, 0),
		[pickups],
	);
	const pendingPayouts = useMemo(
		() => payouts.filter((p) => p.status === "Pending").reduce((acc, p) => acc + p.amountInr, 0),
		[payouts],
	);
	const inventoryWeight = inventory.totalWeightKg;
	const totalCommission = useMemo(() => {
		const byId = new Map(vendors.map((v) => [v.id, v] as const));
		return pickups
			.filter((p) => p.status === "Completed" && p.vendorId)
			.reduce((acc, p) => {
				const v = p.vendorId ? byId.get(p.vendorId) : null;
				const pct = v ? v.commissionPct : 10;
				return acc + (p.amountInr * pct) / 100;
			}, 0);
	}, [pickups, vendors]);

	const kpis = [
		{ label: "Pickups Today", value: pickupsToday.toLocaleString("en-IN"), hint: "Last 24 hours" },
		{ label: "Active Vendors", value: activeVendors.toLocaleString("en-IN"), hint: "Not suspended" },
		{ label: "Gross Revenue", value: formatCurrencyInr(grossRevenue), hint: "Completed pickups" },
		{ label: "Pending Payouts", value: formatCurrencyInr(pendingPayouts), hint: "Awaiting approval" },
		{ label: "Inventory Weight", value: formatKg(inventoryWeight), hint: "Godown total" },
		{ label: "Total Commission", value: formatCurrencyInr(Math.round(totalCommission)), hint: "Platform take" },
	];

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
				{kpis.map((k) => (
					<Card key={k.label} className="relative overflow-hidden">
						<div
							className="pointer-events-none absolute inset-0 opacity-60"
							style={{
								background:
									kpiTone(k.label) === "green"
										? "radial-gradient(600px 240px at 0% 0%, hsl(var(--primary)/0.18), transparent 65%)"
										: kpiTone(k.label) === "blue"
											? "radial-gradient(600px 240px at 0% 0%, hsl(var(--secondary)/0.18), transparent 65%)"
											: kpiTone(k.label) === "amber"
												? "radial-gradient(600px 240px at 0% 0%, hsl(var(--warn)/0.18), transparent 65%)"
												: "radial-gradient(600px 240px at 0% 0%, hsl(var(--border)/0.40), transparent 65%)",
							}}
						/>
						<CardHeader>
							<CardTitle className="text-sm">{k.label}</CardTitle>
							<CardDescription>{k.hint}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="font-display text-2xl font-semibold tracking-tight">{k.value}</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Revenue Trend</CardTitle>
						<CardDescription>Daily revenue (mock)</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-[280px]">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={revenueTrend} margin={{ left: 8, right: 12, top: 10, bottom: 0 }}>
									<defs>
										<linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
											<stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
										</linearGradient>
									</defs>
									<CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
									<XAxis dataKey="day" tick={{ fill: "hsl(var(--muted))", fontSize: 12 }} axisLine={false} tickLine={false} />
									<YAxis tick={{ fill: "hsl(var(--muted))", fontSize: 12 }} axisLine={false} tickLine={false} />
									<Tooltip
										contentStyle={{
											background: "hsl(var(--surface))",
											border: "1px solid hsl(var(--border))",
											borderRadius: 12,
											boxShadow: "var(--shadow-md)",
										}}
										formatter={(v) => formatCurrencyInr(Number(v))}
									/>
									<Area type="monotone" dataKey="revenueInr" stroke="hsl(var(--primary))" fill="url(#rev)" strokeWidth={2} />
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Pickup Activity</CardTitle>
						<CardDescription>Daily pickup volume (mock)</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-[280px]">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={pickupActivity} margin={{ left: 8, right: 12, top: 10, bottom: 0 }}>
									<CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
									<XAxis dataKey="day" tick={{ fill: "hsl(var(--muted))", fontSize: 12 }} axisLine={false} tickLine={false} />
									<YAxis tick={{ fill: "hsl(var(--muted))", fontSize: 12 }} axisLine={false} tickLine={false} />
									<Tooltip
										contentStyle={{
											background: "hsl(var(--surface))",
											border: "1px solid hsl(var(--border))",
											borderRadius: 12,
											boxShadow: "var(--shadow-md)",
										}}
									/>
									<Bar dataKey="pickups" fill="hsl(var(--secondary))" radius={[10, 10, 4, 4]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Live Feed</CardTitle>
					<CardDescription>Latest pickups, new vendors, and payments</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
							<div className="mb-3 font-display text-sm font-semibold">Latest Pickups</div>
							<div className="space-y-2">
								{pickups
									.slice()
									.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
									.slice(0, 4)
									.map((p) => (
										<div key={p.id} className="flex items-center justify-between gap-3 text-sm">
											<div className="min-w-0">
												<div className="truncate font-medium">{p.id}</div>
												<div className="truncate text-xs text-[hsl(var(--muted))]">{p.scrapType}</div>
											</div>
											<Badge tone={p.status === "Completed" ? "green" : p.status === "Pending" ? "amber" : p.status === "Assigned" ? "blue" : "red"}>
												{p.status}
											</Badge>
										</div>
									))}
							</div>
						</div>

						<div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
							<div className="mb-3 font-display text-sm font-semibold">New Vendors</div>
							<div className="space-y-2">
								{vendors
									.slice()
									.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
									.slice(0, 4)
									.map((v) => (
										<div key={v.id} className="text-sm">
											<div className="font-medium">{v.name}</div>
											<div className="text-xs text-[hsl(var(--muted))]">Joined {formatDateTime(v.joinedAt)}</div>
										</div>
									))}
							</div>
						</div>

						<div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
							<div className="mb-3 font-display text-sm font-semibold">Payment Status</div>
							<div className="space-y-2">
								{activityFeed
									.filter((a) => a.type === "payment")
									.slice(0, 4)
									.map((a) => (
										<div key={a.id} className="text-sm">
											<div className="font-medium">{a.title}</div>
											<div className="text-xs text-[hsl(var(--muted))]">{a.detail}</div>
										</div>
									))}
								{activityFeed.filter((a) => a.type === "payment").length === 0 ? (
									<div className="text-sm text-[hsl(var(--muted))]">No payment alerts</div>
								) : null}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
