"use client";

import React, { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search } from "lucide-react";

import ThemeToggle from "@/components/theme/ThemeToggle";
import Button from "@/components/admin/ui/Button";

import type { NavGroup, ViewId } from "./nav";

type Props = {
	brand: string;
	groups: NavGroup[];
	activeView: ViewId;
	onNavigate: (v: ViewId) => void;
	sidebarCollapsed: boolean;
	onToggleSidebar: () => void;
	mobileOpen: boolean;
	onSetMobileOpen: (open: boolean) => void;
	notificationCount: number;
	searchValue: string;
	onSearchChange: (v: string) => void;
	onSearchSubmit: () => void;
	header: React.ReactNode;
	children: React.ReactNode;
	canView: (view: ViewId) => boolean;
};

function SidebarContent({
	brand,
	groups,
	activeView,
	onNavigate,
	sidebarCollapsed,
	canView,
}: {
	brand: string;
	groups: NavGroup[];
	activeView: ViewId;
	onNavigate: (v: ViewId) => void;
	sidebarCollapsed: boolean;
	canView: (view: ViewId) => boolean;
}) {
	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center gap-3 px-4 py-4">
				<div className="h-9 w-9 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-sm)]" />
				<div className={sidebarCollapsed ? "hidden" : "block"}>
					<div className="font-display text-sm font-semibold tracking-tight">{brand}</div>
					<div className="text-xs text-[hsl(var(--muted))]">Staff-only</div>
				</div>
			</div>

			<nav className="flex-1 space-y-5 px-3 pb-4">
				{groups.map((g) => {
					const visibleItems = g.items.filter((it) => canView(it.id));
					if (visibleItems.length === 0) return null;
					return (
						<div key={g.id}>
							<div className={sidebarCollapsed ? "px-2 pb-2 text-[10px] text-[hsl(var(--muted))]" : "px-2 pb-2 text-xs text-[hsl(var(--muted))]"}>
								{sidebarCollapsed ? g.label.slice(0, 1).toUpperCase() : g.label}
							</div>
							<div className="space-y-1">
								{visibleItems.map((it) => {
									const active = it.id === activeView;
									const Icon = it.icon;
									return (
										<button
											key={it.id}
											onClick={() => onNavigate(it.id)}
											className={[
												"group flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition",
												active
													? "border-[hsl(var(--secondary)/0.25)] bg-[hsl(var(--secondary)/0.10)] text-[hsl(var(--secondary))]"
													: "border-transparent text-[hsl(var(--text))] hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-2))]",
											]
												.filter(Boolean)
												.join(" ")}
										>
											<Icon size={16} />
											<span className={sidebarCollapsed ? "hidden" : "block"}>{it.label}</span>
										</button>
									);
								})}
							</div>
						</div>
					);
				})}
			</nav>

			<div className={sidebarCollapsed ? "hidden" : "block"}>
				<div className="px-4 pb-4 text-xs text-[hsl(var(--muted))]">Ctrl+B to collapse</div>
			</div>
		</div>
	);
}

export default function AdminShell(props: Props) {
	const {
		brand,
		groups,
		activeView,
		onNavigate,
		sidebarCollapsed,
		onToggleSidebar,
		mobileOpen,
		onSetMobileOpen,
		notificationCount,
		searchValue,
		onSearchChange,
		onSearchSubmit,
		header,
		children,
		canView,
	} = props;

	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B")) {
				e.preventDefault();
				onToggleSidebar();
			}
		}
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [onToggleSidebar]);

	const sidebarWidth = useMemo(() => (sidebarCollapsed ? "w-[74px]" : "w-[280px]"), [sidebarCollapsed]);

	return (
		<div className="bg-grid relative min-h-screen">
			<div className="relative z-10 flex min-h-screen">
				{/* Desktop sidebar */}
				<div
					className={[
						"hidden shrink-0 border-r border-[hsl(var(--border))] bg-[hsl(var(--surface))]/80 backdrop-blur xl:block",
						sidebarWidth,
					].join(" ")}
				>
					<SidebarContent
						brand={brand}
						groups={groups}
						activeView={activeView}
						onNavigate={onNavigate}
						sidebarCollapsed={sidebarCollapsed}
						canView={canView}
					/>
				</div>

				{/* Mobile drawer */}
				<AnimatePresence>
					{mobileOpen ? (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 z-40 xl:hidden"
						>
							<div
								className="absolute inset-0 bg-black/40"
								onClick={() => onSetMobileOpen(false)}
							/>
							<motion.div
								initial={{ x: -320 }}
								animate={{ x: 0 }}
								exit={{ x: -320 }}
								transition={{ type: "spring", damping: 28, stiffness: 260 }}
								className="absolute inset-y-0 left-0 w-[300px] border-r border-[hsl(var(--border))] bg-[hsl(var(--surface))]"
							>
								<SidebarContent
									brand={brand}
									groups={groups}
									activeView={activeView}
									onNavigate={(v) => {
										onNavigate(v);
										onSetMobileOpen(false);
									}}
									sidebarCollapsed={false}
									canView={canView}
								/>
							</motion.div>
						</motion.div>
					) : null}
				</AnimatePresence>

				<div className="flex min-w-0 flex-1 flex-col">
					{/* Topbar */}
					<div className="sticky top-0 z-30 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))]/70 backdrop-blur">
						<div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3">
							<Button
								variant="ghost"
								className="xl:hidden"
								onClick={() => onSetMobileOpen(true)}
								aria-label="Open navigation"
								title="Open navigation"
							>
								<Menu size={18} />
							</Button>

							<div className="relative min-w-0 flex-1">
								<div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted))]">
									<Search size={16} />
								</div>
								<input
									value={searchValue}
									onChange={(e) => onSearchChange(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") onSearchSubmit();
									}}
									placeholder="Search pickup ID or vendor…"
									className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 pl-9 pr-3 text-sm shadow-[var(--shadow-sm)] outline-none placeholder:text-[hsl(var(--muted))] focus:border-[hsl(var(--secondary)/0.45)]"
								/>
							</div>

							<div className="flex items-center gap-2">
								{notificationCount > 0 ? (
									<div className="hidden items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm text-[hsl(var(--muted))] shadow-[var(--shadow-sm)] sm:flex">
										<span className="h-2 w-2 rounded-full bg-[hsl(var(--warn))]" />
										<span>Alerts</span>
										<span className="rounded-full bg-[hsl(var(--surface-2))] px-2 py-0.5 text-xs text-[hsl(var(--text))]">
											{notificationCount}
										</span>
									</div>
								) : null}
								<ThemeToggle />
							</div>
						</div>
					</div>

					{/* Page header */}
					<div className="mx-auto w-full max-w-[1400px] px-4 pt-6">{header}</div>

					{/* Page content */}
					<div className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-10 pt-4">
						<AnimatePresence mode="wait">
							<motion.div
								key={activeView}
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 8 }}
								transition={{ duration: 0.18 }}
							>
								{children}
							</motion.div>
						</AnimatePresence>
					</div>
				</div>
			</div>
		</div>
	);
}
