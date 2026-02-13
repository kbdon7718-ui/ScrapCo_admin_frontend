"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/Card";
import Badge from "@/components/admin/ui/Badge";
import { formatCurrencyInr, formatKg, formatDateTime } from "@/lib/format";
import type { InventorySnapshot } from "@/lib/scrapco-data";

export default function InventoryPage({ inventory }: { inventory: InventorySnapshot }) {
	const incoming = 860;
	const outgoing = 640;
	const net = incoming - outgoing;

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>Total Stock Weight</CardTitle>
						<CardDescription>As of {formatDateTime(inventory.asOf)}</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="font-display text-2xl font-semibold tracking-tight">{formatKg(inventory.totalWeightKg)}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Estimated Stock Value</CardTitle>
						<CardDescription>Mock valuation model</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="font-display text-2xl font-semibold tracking-tight">{formatCurrencyInr(inventory.estimatedValueInr)}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Net Change</CardTitle>
						<CardDescription>Incoming vs outgoing (mock)</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<div>
								<div className="text-xs text-[hsl(var(--muted))]">Incoming</div>
								<div className="font-display text-lg font-semibold">{formatKg(incoming)}</div>
							</div>
							<div>
								<div className="text-xs text-[hsl(var(--muted))]">Outgoing</div>
								<div className="font-display text-lg font-semibold">{formatKg(outgoing)}</div>
							</div>
							<div>
								<div className="text-xs text-[hsl(var(--muted))]">Net</div>
								<div className="mt-1">{net >= 0 ? <Badge tone="green">+{formatKg(net)}</Badge> : <Badge tone="red">{formatKg(net)}</Badge>}</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Movement Chart</CardTitle>
					<CardDescription>Breakdown by category</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="h-[320px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={inventory.byCategory.map((x) => ({ category: x.category, weightKg: x.weightKg }))} margin={{ left: 10, right: 12, top: 10, bottom: 0 }}>
								<CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
								<XAxis dataKey="category" tick={{ fill: "hsl(var(--muted))", fontSize: 12 }} axisLine={false} tickLine={false} />
								<YAxis tick={{ fill: "hsl(var(--muted))", fontSize: 12 }} axisLine={false} tickLine={false} />
								<Tooltip
									contentStyle={{
										background: "hsl(var(--surface))",
										border: "1px solid hsl(var(--border))",
										borderRadius: 12,
										boxShadow: "var(--shadow-md)",
									}}
									formatter={(v) => `${v} kg`}
								/>
								<Bar dataKey="weightKg" fill="hsl(var(--secondary))" radius={[10, 10, 4, 4]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
