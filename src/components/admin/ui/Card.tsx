"use client";

import React from "react";

type Props = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: Props) {
	return (
		<div
			className={[
				"rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-sm)]",
				className,
			]
				.filter(Boolean)
				.join(" ")}
			{...props}
		/>
	);
}

export function CardHeader({ className, ...props }: Props) {
	return <div className={["px-5 pt-5", className].filter(Boolean).join(" ")} {...props} />;
}

export function CardTitle({ className, ...props }: Props) {
	return (
		<div
			className={["font-display text-base font-semibold tracking-tight text-[hsl(var(--text))]", className]
				.filter(Boolean)
				.join(" ")}
			{...props}
		/>
	);
}

export function CardDescription({ className, ...props }: Props) {
	return (
		<div className={["mt-1 text-sm text-[hsl(var(--muted))]", className].filter(Boolean).join(" ")} {...props} />
	);
}

export function CardContent({ className, ...props }: Props) {
	return <div className={["px-5 pb-5", className].filter(Boolean).join(" ")} {...props} />;
}
