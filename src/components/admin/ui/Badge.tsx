"use client";

import React from "react";

type Tone = "neutral" | "green" | "blue" | "amber" | "red";

type Props = React.HTMLAttributes<HTMLSpanElement> & {
	tone?: Tone;
};

export default function Badge({ className, tone = "neutral", ...props }: Props) {
	const base = "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium";
	const tones: Record<Tone, string> = {
		neutral: "border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] text-[hsl(var(--text))]",
		green: "border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))]",
		blue: "border-[hsl(var(--secondary)/0.25)] bg-[hsl(var(--secondary)/0.10)] text-[hsl(var(--secondary))]",
		amber: "border-[hsl(var(--warn)/0.35)] bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]",
		red: "border-[hsl(var(--danger)/0.35)] bg-[hsl(var(--danger)/0.12)] text-[hsl(var(--danger))]",
	};

	return <span className={[base, tones[tone], className].filter(Boolean).join(" ")} {...props} />;
}
