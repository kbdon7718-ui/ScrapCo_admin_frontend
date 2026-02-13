"use client";

import React, { useMemo } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/Card";
import Badge from "@/components/admin/ui/Badge";
import { formatCurrencyInr, formatKg } from "@/lib/format";
import type { InventorySnapshot, Pickup, RevenuePoint, Vendor } from "@/lib/scrapco-data";

export default function ReportsPage({
	revenueTrend,
	inventory,
	vendors,
	pickups,
}: {
	revenueTrend: RevenuePoint[];
	inventory: InventorySnapshot;
	vendors: Vendor[];
	pickups: Pickup[];
}) {
	const vendorRanking = useMemo(() => {
		const byVendor = new Map<string, { vendor: Vendor; volumeKg: number }>();
		for (const v of vendors) byVendor.set(v.id, { vendor: v, volumeKg: 0 });
		for (const p of pickups) {
			if (!p.vendorId || p.status !== "Completed") continue;
			const row = byVendor.get(p.vendorId);
			if (row) row.volumeKg += p.weightKg;
		}
		return Array.from(byVendor.values())
			.sort((a, b) => b.volumeKg - a.volumeKg)
			.slice(0, 5);
	}, [vendors, pickups]);

	const categoryShare = useMemo(
		() => inventory.byCategory.map((x) => ({ name: x.category, value: x.weightKg })),
		[inventory.byCategory],
	);

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Growth Metrics</CardTitle>
						<CardDescription>Revenue growth over time (mock)</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-[300px]">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={revenueTrend} margin={{ left: 8, right: 12, top: 10, bottom: 0 }}>
									<defs>
										<linearGradient id="growth" x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.35} />
											<stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0.06} />
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
									<Area type="monotone" dataKey="revenueInr" stroke="hsl(var(--secondary))" fill="url(#growth)" strokeWidth={2} />
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Category Trends</CardTitle>
						<CardDescription>Share by scrap material (mock)</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-[300px]">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Tooltip
										contentStyle={{
											background: "hsl(var(--surface))",
											border: "1px solid hsl(var(--border))",
											borderRadius: 12,
											boxShadow: "var(--shadow-md)",
										}}
										formatter={(v) => formatKg(Number(v))}
									/>
									<Pie
										data={categoryShare}
										dataKey="value"
										nameKey="name"
										innerRadius={70}
										outerRadius={110}
										stroke="hsl(var(--surface))"
										fill="hsl(var(--primary))"
									/>
								</PieChart>
							</ResponsiveContainer>
						</div>

						<div className="mt-4 grid grid-cols-2 gap-2 text-sm">
							{categoryShare.map((c) => (
								<div key={c.name} className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2">
									<span className="text-[hsl(var(--muted))]">{c.name}</span>
									<span className="font-medium">{formatKg(c.value)}</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Vendor Ranking</CardTitle>
					<CardDescription>Top vendors by completed volume</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
						{vendorRanking.map((r, idx) => (
							<div key={r.vendor.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
								<div className="flex items-center justify-between">
									<div>
										<div className="font-display text-sm font-semibold">#{idx + 1} {r.vendor.name}</div>
										<div className="text-xs text-[hsl(var(--muted))]">{r.vendor.city}</div>
									</div>
									<Badge tone={idx === 0 ? "green" : idx === 1 ? "blue" : "neutral"}>{formatKg(r.volumeKg)}</Badge>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
