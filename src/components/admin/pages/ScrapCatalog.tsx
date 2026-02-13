"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Edit3, Plus, RefreshCw, X } from "lucide-react";

import Button from "@/components/admin/ui/Button";
import Badge from "@/components/admin/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/Card";

import { can, type PermissionMatrix } from "@/lib/permissions";
import { formatCurrencyInr, formatDateTime } from "@/lib/format";

type AdminScrapType = {
	id: string;
	name: string;
	ratePerKg: number | null;
	effectiveFrom: string | null;
};

export default function ScrapCatalogPage({
	scrapTypes,
	status,
	error,
	permissions,
	onCreateScrapType,
	onRenameScrapType,
	onRefresh,
}: {
	scrapTypes: AdminScrapType[];
	status: "idle" | "loading" | "error";
	error: string;
	permissions: PermissionMatrix;
	onCreateScrapType: (name: string) => Promise<void>;
	onRenameScrapType: (id: string, name: string) => Promise<void>;
	onRefresh: () => Promise<void>;
}) {
	const [q, setQ] = useState<string>("");

	const [open, setOpen] = useState<boolean>(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	const editing = useMemo(
		() => (editingId ? scrapTypes.find((s) => s.id === editingId) ?? null : null),
		[editingId, scrapTypes],
	);

	const [nameDraft, setNameDraft] = useState<string>("");
	function openCreate() {
		if (!can(permissions, "edit_scrap_catalog")) return;
		setEditingId(null);
		setNameDraft("");
		setOpen(true);
	}

	function openEdit(id: string) {
		if (!can(permissions, "edit_scrap_catalog")) return;
		const s = scrapTypes.find((x) => x.id === id);
		if (!s) return;
		setEditingId(id);
		setNameDraft(s.name);
		setOpen(true);
	}

	async function submit() {
		if (!can(permissions, "edit_scrap_catalog")) return;
		const trimmed = nameDraft.trim();
		if (!trimmed) return;

		try {
			if (editing) {
				await onRenameScrapType(editing.id, trimmed);
			} else {
				await onCreateScrapType(trimmed);
			}
			setOpen(false);
		} catch {
			// errors shown via parent error state
		}
	}

	const rows = useMemo(() => {
		const query = q.trim().toLowerCase();
		return scrapTypes
			.filter((s) => (!query ? true : s.name.toLowerCase().includes(query) || s.id.toLowerCase().includes(query)))
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [scrapTypes, q]);

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Scrap Types</CardTitle>
					<CardDescription>Backed by admin backend: add and rename scrap types.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<div className="flex flex-1 items-center gap-2">
							<input
								value={q}
								onChange={(e) => setQ(e.target.value)}
								placeholder="Search scrap types…"
								className="h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 text-sm shadow-[var(--shadow-sm)] outline-none"
							/>
							<Button size="sm" variant="ghost" onClick={onRefresh} title="Refresh from backend">
								<RefreshCw size={14} />
								Refresh
							</Button>
						</div>

						<Button variant="primary" onClick={openCreate} disabled={!can(permissions, "edit_scrap_catalog")}>
							<Plus size={16} />
							Add Scrap Type
						</Button>
					</div>

					{status === "loading" ? (
						<div className="mt-3 text-sm text-[hsl(var(--muted))]">Loading scrap types…</div>
					) : null}
					{error ? (
						<div className="mt-3 rounded-xl border border-[hsl(var(--danger)/0.35)] bg-[hsl(var(--danger)/0.08)] p-3 text-sm text-[hsl(var(--danger))]">
							{error}
						</div>
					) : null}

					<div className="mt-4 overflow-hidden rounded-xl border border-[hsl(var(--border))]">
						<table className="min-w-full text-sm">
							<thead className="bg-[hsl(var(--surface))]">
								<tr className="border-b border-[hsl(var(--border))] text-left text-xs text-[hsl(var(--muted))]">
									<th className="px-4 py-3">Name</th>
									<th className="px-4 py-3">Current Rate</th>
									<th className="px-4 py-3">Effective From</th>
									<th className="px-4 py-3">Actions</th>
								</tr>
							</thead>
							<tbody>
								{rows.map((s, idx) => (
									<tr key={s.id} className={idx % 2 === 0 ? "bg-[hsl(var(--surface))]" : "bg-[hsl(var(--surface-2))]"}>
										<td className="px-4 py-3">
											<div className="font-medium">{s.name}</div>
											<div className="text-xs text-[hsl(var(--muted))]">{s.id}</div>
										</td>
										<td className="px-4 py-3">
											{s.ratePerKg === null ? <Badge tone="amber">Not set</Badge> : <span>{formatCurrencyInr(s.ratePerKg)}/kg</span>}
										</td>
										<td className="px-4 py-3">{s.effectiveFrom ? formatDateTime(s.effectiveFrom) : "—"}</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-2">
												<Button size="sm" onClick={() => openEdit(s.id)} disabled={!can(permissions, "edit_scrap_catalog")}>
													<Edit3 size={14} />
													Edit
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			<AnimatePresence>
				{open ? (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50">
						<div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
						<motion.div
							initial={{ y: 18, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: 18, opacity: 0 }}
							transition={{ duration: 0.16 }}
							className="absolute left-1/2 top-1/2 w-[92vw] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-[var(--shadow-xl)]"
						>
							<div className="flex items-start justify-between gap-3">
								<div>
									<div className="font-display text-sm font-semibold">{editing ? "Edit Scrap Type" : "Add Scrap Type"}</div>
									<div className="text-xs text-[hsl(var(--muted))]">Catalog editor (mock)</div>
								</div>
								<Button variant="ghost" onClick={() => setOpen(false)} aria-label="Close dialog">
									<X size={18} />
								</Button>
							</div>

							<div className="mt-4 space-y-3">
								<div>
									<label className="text-xs text-[hsl(var(--muted))]">Name</label>
									<input
										value={nameDraft}
										onChange={(e) => setNameDraft(e.target.value)}
										className="mt-2 h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 text-sm shadow-[var(--shadow-sm)] outline-none"
										placeholder="e.g. Aluminium"
									/>
								</div>

								<div className="flex items-center justify-end gap-2 pt-2">
									<Button variant="ghost" onClick={() => setOpen(false)}>
										Cancel
									</Button>
									<Button variant="primary" onClick={submit} disabled={!can(permissions, "edit_scrap_catalog")}>
										Save
									</Button>
								</div>
							</div>
						</motion.div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}
