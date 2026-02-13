"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Edit3, PauseCircle, PlayCircle, Percent, X } from "lucide-react";

import Button from "@/components/admin/ui/Button";
import Badge from "@/components/admin/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/Card";
import { formatCurrencyInr, formatDateTime } from "@/lib/format";
import type { Pickup, Vendor } from "@/lib/scrapco-data";
import type { PermissionMatrix } from "@/lib/permissions";
import { can } from "@/lib/permissions";

function calcEarnings(pickups: Pickup[], vendorId: string) {
	return pickups.filter((p) => p.vendorId === vendorId && p.status === "Completed").reduce((acc, p) => acc + p.amountInr, 0);
}

export default function VendorsPage({
	vendors,
	pickups,
	permissions,
	onUpdateVendor,
}: {
	vendors: Vendor[];
	pickups: Pickup[];
	permissions: PermissionMatrix;
	onUpdateVendor: (vendorId: string, patch: Partial<Vendor>) => void;
}) {
	const [search, setSearch] = useState<string>("");
	const [openVendorId, setOpenVendorId] = useState<string | null>(null);
	const [commissionDraft, setCommissionDraft] = useState<string>("");
	const [showCommissionDialog, setShowCommissionDialog] = useState<boolean>(false);

	const byId = useMemo(() => new Map(vendors.map((v) => [v.id, v] as const)), [vendors]);
	const openVendor = openVendorId ? byId.get(openVendorId) || null : null;

	const rows = useMemo(() => {
		const q = search.trim().toLowerCase();
		return vendors
			.filter((v) => (!q ? true : v.name.toLowerCase().includes(q) || v.city.toLowerCase().includes(q)))
			.slice()
			.sort((a, b) => Number(a.isSuspended) - Number(b.isSuspended) || b.rating - a.rating);
	}, [vendors, search]);

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Performance Matrix</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-3 md:flex-row md:items-center">
						<input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search vendor name or city…"
							className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm shadow-[var(--shadow-sm)] outline-none focus:border-[hsl(var(--secondary)/0.45)]"
						/>
					</div>

					<div className="mt-4 overflow-hidden rounded-xl border border-[hsl(var(--border))]">
						<div className="max-h-[560px] overflow-auto">
							<table className="min-w-full text-sm">
								<thead className="sticky top-0 bg-[hsl(var(--surface))]">
									<tr className="border-b border-[hsl(var(--border))] text-left text-xs text-[hsl(var(--muted))]">
										<th className="px-4 py-3">Vendor</th>
										<th className="px-4 py-3">City</th>
										<th className="px-4 py-3">Earnings</th>
										<th className="px-4 py-3">Commission</th>
										<th className="px-4 py-3">Rating</th>
										<th className="px-4 py-3">Status</th>
										<th className="px-4 py-3">Actions</th>
									</tr>
								</thead>
								<tbody>
									{rows.map((v, idx) => {
										const earnings = calcEarnings(pickups, v.id);
										return (
											<tr key={v.id} className={idx % 2 === 0 ? "bg-[hsl(var(--surface))]" : "bg-[hsl(var(--surface-2))]"}>
												<td className="px-4 py-3">
													<div className="font-medium">{v.name}</div>
													<div className="text-xs text-[hsl(var(--muted))]">Joined {formatDateTime(v.joinedAt)}</div>
												</td>
												<td className="px-4 py-3">{v.city}</td>
												<td className="px-4 py-3">{formatCurrencyInr(earnings)}</td>
												<td className="px-4 py-3">{v.commissionPct}%</td>
												<td className="px-4 py-3">{v.rating.toFixed(1)}</td>
												<td className="px-4 py-3">
													{v.isSuspended ? <Badge tone="red">Suspended</Badge> : <Badge tone="green">Active</Badge>}
												</td>
												<td className="px-4 py-3">
													<div className="flex items-center gap-2">
														<Button size="sm" onClick={() => setOpenVendorId(v.id)}>
															<Edit3 size={14} />
															Open
														</Button>
														<Button
															size="sm"
															variant="ghost"
															disabled={!can(permissions, "edit_vendors")}
															onClick={() => {
																if (!can(permissions, "edit_vendors")) return;
																setOpenVendorId(v.id);
																setCommissionDraft(String(v.commissionPct));
																setShowCommissionDialog(true);
															}}
															title={can(permissions, "edit_vendors") ? "Change commission" : "No permission"}
														>
															<Percent size={14} />
															Commission
														</Button>

														<Button
															size="sm"
															variant={v.isSuspended ? "secondary" : "ghost"}
															disabled={!can(permissions, "suspend_vendors")}
															onClick={() => {
																if (!can(permissions, "suspend_vendors")) return;
																onUpdateVendor(v.id, { isSuspended: !v.isSuspended });
															}}
															title={can(permissions, "suspend_vendors") ? "Toggle suspend" : "No permission"}
														>
															{v.isSuspended ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
															{v.isSuspended ? "Re-enable" : "Suspend"}
														</Button>
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>
				</CardContent>
			</Card>

			<AnimatePresence>
				{openVendor ? (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40">
						<div className="absolute inset-0 bg-black/40" onClick={() => setOpenVendorId(null)} />
						<motion.div
							initial={{ x: 420 }}
							animate={{ x: 0 }}
							exit={{ x: 420 }}
							transition={{ type: "spring", damping: 28, stiffness: 260 }}
							className="absolute inset-y-0 right-0 w-full max-w-[420px] border-l border-[hsl(var(--border))] bg-[hsl(var(--surface))]"
						>
							<div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-4">
								<div>
									<div className="font-display text-sm font-semibold">{openVendor.name}</div>
									<div className="text-xs text-[hsl(var(--muted))]">{openVendor.city}</div>
								</div>
								<Button variant="ghost" onClick={() => setOpenVendorId(null)} aria-label="Close vendor drawer">
									<X size={18} />
								</Button>
							</div>

							<div className="space-y-4 p-5">
								<div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
									<div className="text-xs text-[hsl(var(--muted))]">Bio</div>
									<div className="mt-2 text-sm">{openVendor.bio}</div>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
										<div className="text-xs text-[hsl(var(--muted))]">Commission</div>
										<div className="mt-1 font-display text-lg font-semibold">{openVendor.commissionPct}%</div>
									</div>
									<div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
										<div className="text-xs text-[hsl(var(--muted))]">Rating</div>
										<div className="mt-1 font-display text-lg font-semibold">{openVendor.rating.toFixed(1)}</div>
									</div>
								</div>

								<div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
									<div className="text-xs text-[hsl(var(--muted))]">Joined</div>
									<div className="mt-1 text-sm">{formatDateTime(openVendor.joinedAt)}</div>
								</div>
							</div>
						</motion.div>
					</motion.div>
				) : null}
			</AnimatePresence>

			<AnimatePresence>
				{showCommissionDialog && openVendor ? (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50">
						<div className="absolute inset-0 bg-black/40" onClick={() => setShowCommissionDialog(false)} />
						<motion.div
							initial={{ opacity: 0, y: 14 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 14 }}
							transition={{ duration: 0.16 }}
							className="absolute left-1/2 top-1/2 w-[92vw] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-[var(--shadow-xl)]"
						>
							<div className="font-display text-sm font-semibold">Change Commission</div>
							<div className="mt-1 text-xs text-[hsl(var(--muted))]">Mock UI — updates local state only.</div>

							<div className="mt-4">
								<label className="text-xs text-[hsl(var(--muted))]">Commission %</label>
								<input
									value={commissionDraft}
									onChange={(e) => setCommissionDraft(e.target.value)}
									className="mt-2 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm shadow-[var(--shadow-sm)] outline-none"
									inputMode="decimal"
								/>
							</div>

							<div className="mt-5 flex items-center justify-end gap-2">
								<Button variant="ghost" onClick={() => setShowCommissionDialog(false)}>
									Cancel
								</Button>
								<Button
									variant="primary"
									onClick={() => {
										const pct = Number(commissionDraft);
										if (!Number.isFinite(pct) || pct <= 0 || pct > 50) return;
										onUpdateVendor(openVendor.id, { commissionPct: Math.round(pct * 10) / 10 });
										setShowCommissionDialog(false);
									}}
								>
									Save
								</Button>
							</div>
						</motion.div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}
