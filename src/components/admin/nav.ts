import {
	BarChart3,
	ClipboardList,
	CreditCard,
	Gauge,
	HardHat,
	IndianRupee,
	Package,
	Shield,
	Tags,
	Truck,
	Users,
} from "lucide-react";

export type ViewId =
	| "dashboard"
	| "pickups"
	| "vendors"
	| "scrap"
	| "rates"
	| "inventory"
	| "payments"
	| "reports"
	| "access";

export type NavGroup = {
	id: string;
	label: string;
	items: Array<{ id: ViewId; label: string; icon: React.ComponentType<{ size?: number }> }>;
};

export const navGroups: NavGroup[] = [
	{
		id: "overview",
		label: "Overview",
		items: [{ id: "dashboard", label: "Dashboard", icon: Gauge }],
	},
	{
		id: "operations",
		label: "Operations",
		items: [
			{ id: "pickups", label: "Live Pickups", icon: Truck },
			{ id: "vendors", label: "Vendors", icon: Users },
		],
	},
	{
		id: "inventory",
		label: "Inventory",
		items: [
			{ id: "scrap", label: "Scrap Catalog", icon: Tags },
			{ id: "rates", label: "Rates", icon: IndianRupee },
			{ id: "inventory", label: "Godown & Inventory", icon: Package },
		],
	},
	{
		id: "finance",
		label: "Finance",
		items: [
			{ id: "payments", label: "Payments", icon: CreditCard },
			{ id: "reports", label: "Reports", icon: BarChart3 },
		],
	},
	{
		id: "admin",
		label: "Admin",
		items: [{ id: "access", label: "Role & Access", icon: Shield }],
	},
];

export const viewMeta: Record<ViewId, { title: string; subtitle: string; icon: React.ComponentType<{ size?: number }> }> = {
	dashboard: {
		title: "Command Center",
		subtitle: "KPIs, trends, and live operations — at a glance.",
		icon: Gauge,
	},
	pickups: {
		title: "Live Pickups",
		subtitle: "Track, triage, and (re)assign pickups in real-time.",
		icon: ClipboardList,
	},
	vendors: {
		title: "Vendor Management",
		subtitle: "Performance, commissions, and operational controls.",
		icon: HardHat,
	},
	scrap: {
		title: "Scrap Catalog",
		subtitle: "Manage scrap types, categories, and availability.",
		icon: Tags,
	},
	rates: {
		title: "Rate Management",
		subtitle: "Control per-material purchase rates (mock).",
		icon: IndianRupee,
	},
	inventory: {
		title: "Godown & Inventory",
		subtitle: "Stock levels, category breakdown, and movement signals.",
		icon: Package,
	},
	payments: {
		title: "Payments & Commission",
		subtitle: "Payout approvals and platform commission visibility.",
		icon: CreditCard,
	},
	reports: {
		title: "Reports & Analytics",
		subtitle: "Growth, rankings, and category trends.",
		icon: BarChart3,
	},
	access: {
		title: "Role & Access Control",
		subtitle: "Simulate permissions and validate UI access paths.",
		icon: Shield,
	},
};
