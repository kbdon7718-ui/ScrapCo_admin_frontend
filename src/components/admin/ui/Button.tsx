"use client";

import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: Variant;
	size?: "sm" | "md";
};

export default function Button({
	className,
	variant = "secondary",
	size = "md",
	...props
}: Props) {
	const base =
		"inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition active:scale-95 disabled:pointer-events-none disabled:opacity-50";
	const sizes = size === "sm" ? "px-2.5 py-1.5 text-xs" : "";
	const styles: Record<Variant, string> = {
		primary:
			"border-transparent bg-[hsl(var(--primary))] text-white shadow-[var(--shadow-sm)] hover:opacity-95",
		secondary:
			"border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text))] shadow-[var(--shadow-sm)] hover:bg-[hsl(var(--surface-2))]",
		ghost:
			"border-transparent bg-transparent text-[hsl(var(--text))] hover:bg-[hsl(var(--surface-2))]",
		danger:
			"border-transparent bg-[hsl(var(--danger))] text-white shadow-[var(--shadow-sm)] hover:opacity-95",
	};

	return <button className={[base, sizes, styles[variant], className].filter(Boolean).join(" ")} {...props} />;
}
