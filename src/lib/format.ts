export function formatCurrencyInr(amount: number) {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(amount);
}

export function formatKg(kg: number) {
	const rounded = Math.round(kg * 10) / 10;
	return `${rounded.toLocaleString("en-IN")} kg`;
}

export function formatDateTime(iso: string) {
	const d = new Date(iso);
	return new Intl.DateTimeFormat("en-IN", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(d);
}

export function clamp(n: number, min: number, max: number) {
	return Math.min(max, Math.max(min, n));
}
