export type Role = "super_admin" | "ops_manager" | "accounts";

export type PermissionKey =
	| "view_dashboard"
	| "view_pickups"
	| "reassign_pickups"
	| "view_vendors"
	| "edit_vendors"
	| "suspend_vendors"
	| "view_scrap_catalog"
	| "edit_scrap_catalog"
	| "view_rates"
	| "edit_rates"
	| "view_inventory"
	| "view_payments"
	| "approve_payouts"
	| "mark_paid"
	| "view_reports"
	| "admin_access";

export type PermissionMatrix = Record<PermissionKey, boolean>;

export const roleLabels: Record<Role, string> = {
	super_admin: "Super Admin",
	ops_manager: "Ops Manager",
	accounts: "Accounts Team",
};

export const defaultPermissionsByRole: Record<Role, PermissionMatrix> = {
	super_admin: {
		view_dashboard: true,
		view_pickups: true,
		reassign_pickups: true,
		view_vendors: true,
		edit_vendors: true,
		suspend_vendors: true,
		view_scrap_catalog: true,
		edit_scrap_catalog: true,
		view_rates: true,
		edit_rates: true,
		view_inventory: true,
		view_payments: true,
		approve_payouts: true,
		mark_paid: true,
		view_reports: true,
		admin_access: true,
	},
	ops_manager: {
		view_dashboard: true,
		view_pickups: true,
		reassign_pickups: true,
		view_vendors: true,
		edit_vendors: true,
		suspend_vendors: true,
		view_scrap_catalog: true,
		edit_scrap_catalog: true,
		view_rates: true,
		edit_rates: true,
		view_inventory: true,
		view_payments: false,
		approve_payouts: false,
		mark_paid: false,
		view_reports: true,
		admin_access: false,
	},
	accounts: {
		view_dashboard: true,
		view_pickups: false,
		reassign_pickups: false,
		view_vendors: true,
		edit_vendors: false,
		suspend_vendors: false,
		view_scrap_catalog: true,
		edit_scrap_catalog: false,
		view_rates: true,
		edit_rates: false,
		view_inventory: false,
		view_payments: true,
		approve_payouts: true,
		mark_paid: true,
		view_reports: true,
		admin_access: false,
	},
};

export function computePermissions(role: Role, overrides?: Partial<PermissionMatrix>): PermissionMatrix {
	return { ...defaultPermissionsByRole[role], ...(overrides || {}) };
}

export function can(permissions: PermissionMatrix, key: PermissionKey) {
	return Boolean(permissions[key]);
}
