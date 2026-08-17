export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  EDITOR: "EDITOR",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const CONTENT_ROLES: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR];
export const ADMIN_ROLES: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN];
export const SUPER_ROLES: UserRole[] = [UserRole.SUPER_ADMIN];

export function roleLabel(role: UserRole) {
  if (role === UserRole.SUPER_ADMIN) return "Super Admin";
  if (role === UserRole.ADMIN) return "Admin";
  return "Editor";
}

export function canPublish(role: UserRole) {
  return ADMIN_ROLES.includes(role);
}

export function isUserRole(value: string): value is UserRole {
  return value === UserRole.SUPER_ADMIN || value === UserRole.ADMIN || value === UserRole.EDITOR;
}
