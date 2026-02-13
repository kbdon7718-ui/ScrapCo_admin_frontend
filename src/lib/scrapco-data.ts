export type PickupStatus = "Pending" | "Assigned" | "Completed" | "Cancelled";

export type ScrapCategory = "Paper" | "Metal" | "Plastic" | "E-Waste" | "Glass";

export type City = "Pune" | "Mumbai" | "Navi Mumbai" | "Thane";

export type ScrapType = {
	id: string;
	name: string;
	category: ScrapCategory;
	isActive: boolean;
	defaultRateInrPerKg: number;
	createdAt: string;
};

export type ScrapRate = {
	id: string;
	scrapTypeId: string;
	city: City;
	rateInrPerKg: number;
	updatedAt: string;
};

export type Customer = {
	id: string;
	name: string;
	phone: string;
	city: City;
};

export type Vendor = {
	id: string;
	name: string;
	city: City;
	joinedAt: string;
	commissionPct: number;
	isSuspended: boolean;
	rating: number;
	bio: string;
};

export type Pickup = {
	id: string;
	createdAt: string;
	customerId: string;
	vendorId: string | null;
	scrapType: string;
	category: ScrapCategory;
	weightKg: number;
	amountInr: number;
	status: PickupStatus;
};

export type PayoutStatus = "Pending" | "Approved" | "Paid";

export type Payout = {
	id: string;
	createdAt: string;
	vendorId: string;
	periodLabel: string;
	amountInr: number;
	status: PayoutStatus;
};

export type InventorySnapshot = {
	asOf: string;
	totalWeightKg: number;
	estimatedValueInr: number;
	byCategory: Array<{ category: ScrapCategory; weightKg: number }>;
};

export type RevenuePoint = { day: string; revenueInr: number };
export type ActivityPoint = { day: string; pickups: number };

export type ActivityItem = {
	id: string;
	at: string;
	type: "pickup" | "vendor" | "payment";
	title: string;
	detail: string;
};

function daysAgo(n: number) {
	const d = new Date();
	d.setDate(d.getDate() - n);
	return d.toISOString();
}

function isoHoursAgo(n: number) {
	const d = new Date();
	d.setHours(d.getHours() - n);
	return d.toISOString();
}

export const mockCustomers: Customer[] = [
	{ id: "cus_01", name: "Aditi Sharma", phone: "+91 98xxxxxx12", city: "Pune" },
	{ id: "cus_02", name: "Rohit Verma", phone: "+91 97xxxxxx44", city: "Mumbai" },
	{ id: "cus_03", name: "Neha Kulkarni", phone: "+91 99xxxxxx70", city: "Pune" },
	{ id: "cus_04", name: "Imran Khan", phone: "+91 90xxxxxx18", city: "Navi Mumbai" },
	{ id: "cus_05", name: "Priya Nair", phone: "+91 96xxxxxx33", city: "Thane" },
];

export const mockScrapTypes: ScrapType[] = [
	{ id: "st_01", name: "Mixed Paper", category: "Paper", isActive: true, defaultRateInrPerKg: 14, createdAt: daysAgo(240) },
	{ id: "st_02", name: "Cardboard", category: "Paper", isActive: true, defaultRateInrPerKg: 16, createdAt: daysAgo(210) },
	{ id: "st_03", name: "Iron", category: "Metal", isActive: true, defaultRateInrPerKg: 80, createdAt: daysAgo(300) },
	{ id: "st_04", name: "Aluminium", category: "Metal", isActive: true, defaultRateInrPerKg: 175, createdAt: daysAgo(280) },
	{ id: "st_05", name: "Copper", category: "Metal", isActive: true, defaultRateInrPerKg: 620, createdAt: daysAgo(260) },
	{ id: "st_06", name: "PET Bottles", category: "Plastic", isActive: true, defaultRateInrPerKg: 12, createdAt: daysAgo(190) },
	{ id: "st_07", name: "E-Waste (Small)", category: "E-Waste", isActive: true, defaultRateInrPerKg: 150, createdAt: daysAgo(160) },
	{ id: "st_08", name: "Glass", category: "Glass", isActive: false, defaultRateInrPerKg: 3, createdAt: daysAgo(120) },
];

export const mockScrapRates: ScrapRate[] = [
	{ id: "sr_01", scrapTypeId: "st_01", city: "Pune", rateInrPerKg: 14, updatedAt: isoHoursAgo(14) },
	{ id: "sr_02", scrapTypeId: "st_04", city: "Pune", rateInrPerKg: 172, updatedAt: isoHoursAgo(18) },
	{ id: "sr_03", scrapTypeId: "st_04", city: "Mumbai", rateInrPerKg: 178, updatedAt: isoHoursAgo(8) },
	{ id: "sr_04", scrapTypeId: "st_06", city: "Mumbai", rateInrPerKg: 13, updatedAt: isoHoursAgo(20) },
	{ id: "sr_05", scrapTypeId: "st_03", city: "Thane", rateInrPerKg: 78, updatedAt: isoHoursAgo(22) },
];

export const mockVendors: Vendor[] = [
	{
		id: "ven_01",
		name: "GreenHaul Logistics",
		city: "Pune",
		joinedAt: daysAgo(120),
		commissionPct: 12,
		isSuspended: false,
		rating: 4.6,
		bio: "Focused on reliable pickups in Pune with transparent weighing and on-time settlements.",
	},
	{
		id: "ven_02",
		name: "BlueRoute Scrap",
		city: "Mumbai",
		joinedAt: daysAgo(240),
		commissionPct: 10,
		isSuspended: false,
		rating: 4.4,
		bio: "High-volume vendor network across Mumbai; strong metal sorting pipeline.",
	},
	{
		id: "ven_03",
		name: "EcoDrop Partners",
		city: "Navi Mumbai",
		joinedAt: daysAgo(60),
		commissionPct: 14,
		isSuspended: false,
		rating: 4.2,
		bio: "Specialist in e-waste handling and certified recycling routes.",
	},
	{
		id: "ven_04",
		name: "MetroReclaim",
		city: "Thane",
		joinedAt: daysAgo(420),
		commissionPct: 9,
		isSuspended: true,
		rating: 3.9,
		bio: "Legacy operator with mixed performance; currently under compliance review.",
	},
];

export const mockPickups: Pickup[] = [
	{
		id: "PKP-10241",
		createdAt: isoHoursAgo(1),
		customerId: "cus_01",
		vendorId: "ven_01",
		scrapType: "Mixed Paper",
		category: "Paper",
		weightKg: 24.5,
		amountInr: 980,
		status: "Assigned",
	},
	{
		id: "PKP-10240",
		createdAt: isoHoursAgo(3),
		customerId: "cus_02",
		vendorId: null,
		scrapType: "Aluminium",
		category: "Metal",
		weightKg: 6.2,
		amountInr: 1120,
		status: "Pending",
	},
	{
		id: "PKP-10239",
		createdAt: isoHoursAgo(5),
		customerId: "cus_03",
		vendorId: "ven_03",
		scrapType: "E-Waste (Small)",
		category: "E-Waste",
		weightKg: 4.8,
		amountInr: 720,
		status: "Completed",
	},
	{
		id: "PKP-10238",
		createdAt: isoHoursAgo(7),
		customerId: "cus_05",
		vendorId: "ven_02",
		scrapType: "PET Bottles",
		category: "Plastic",
		weightKg: 11.1,
		amountInr: 555,
		status: "Assigned",
	},
	{
		id: "PKP-10237",
		createdAt: isoHoursAgo(9),
		customerId: "cus_04",
		vendorId: "ven_04",
		scrapType: "Glass",
		category: "Glass",
		weightKg: 18.0,
		amountInr: 360,
		status: "Cancelled",
	},
	{
		id: "PKP-10236",
		createdAt: isoHoursAgo(12),
		customerId: "cus_01",
		vendorId: "ven_02",
		scrapType: "Iron",
		category: "Metal",
		weightKg: 35.0,
		amountInr: 2800,
		status: "Completed",
	},
];

export const mockPayouts: Payout[] = [
	{ id: "pay_01", createdAt: daysAgo(1), vendorId: "ven_02", periodLabel: "This Week", amountInr: 18450, status: "Pending" },
	{ id: "pay_02", createdAt: daysAgo(2), vendorId: "ven_01", periodLabel: "This Week", amountInr: 9200, status: "Approved" },
	{ id: "pay_03", createdAt: daysAgo(5), vendorId: "ven_03", periodLabel: "Last Week", amountInr: 6300, status: "Paid" },
];

export const mockInventory: InventorySnapshot = {
	asOf: new Date().toISOString(),
	totalWeightKg: 12480,
	estimatedValueInr: 1890000,
	byCategory: [
		{ category: "Paper", weightKg: 5200 },
		{ category: "Metal", weightKg: 3900 },
		{ category: "Plastic", weightKg: 2100 },
		{ category: "E-Waste", weightKg: 780 },
		{ category: "Glass", weightKg: 500 },
	],
};

export const mockRevenueTrend: RevenuePoint[] = Array.from({ length: 14 }).map((_, idx) => {
	const day = new Date();
	day.setDate(day.getDate() - (13 - idx));
	const label = day.toLocaleDateString("en-IN", { month: "short", day: "2-digit" });
	const revenueInr = 65000 + Math.round(Math.sin(idx / 2) * 12000) + idx * 1400;
	return { day: label, revenueInr };
});

export const mockPickupActivity: ActivityPoint[] = Array.from({ length: 14 }).map((_, idx) => {
	const day = new Date();
	day.setDate(day.getDate() - (13 - idx));
	const label = day.toLocaleDateString("en-IN", { month: "short", day: "2-digit" });
	const pickups = Math.max(6, Math.round(14 + Math.cos(idx / 2.2) * 6));
	return { day: label, pickups };
});

export const mockActivityFeed: ActivityItem[] = [
	{
		id: "act_01",
		at: isoHoursAgo(1),
		type: "pickup",
		title: "Pickup assigned",
		detail: "PKP-10241 assigned to GreenHaul Logistics",
	},
	{
		id: "act_02",
		at: isoHoursAgo(2),
		type: "vendor",
		title: "Vendor onboarded",
		detail: "EcoDrop Partners joined the network",
	},
	{
		id: "act_03",
		at: isoHoursAgo(3),
		type: "payment",
		title: "Payout pending",
		detail: "₹18,450 payout pending approval for BlueRoute Scrap",
	},
];
