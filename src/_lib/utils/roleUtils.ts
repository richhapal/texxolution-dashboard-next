/**
 * Role-based access control utilities
 */

export type UserRole = "superadmin" | "admin" | "user";

/**
 * Check if user has super admin privileges
 */
export const isSuperAdmin = (userType?: string): boolean => {
  if (!userType) return false;
  return userType.toLowerCase() === "superadmin";
};

/**
 * Check if user has admin privileges (admin or superadmin)
 */
export const isAdmin = (userType?: string): boolean => {
  if (!userType) return false;
  const type = userType.toLowerCase();
  return type === "admin" || type === "superadmin";
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (
  permissions: string[] | undefined,
  requiredPermission: string
): boolean => {
  if (!permissions || !Array.isArray(permissions)) return false;
  return permissions.includes(requiredPermission);
};

/**
 * Check if user can delete images (super admin only)
 */
export const canDeleteImages = (userType?: string): boolean => {
  return isSuperAdmin(userType);
};

/**
 * Check if user can upload images (admin and above)
 */
export const canUploadImages = (userType?: string): boolean => {
  return isAdmin(userType);
};

/**
 * Check if user can view images (all authenticated users)
 */
export const canViewImages = (userType?: string): boolean => {
  return !!userType; // Any authenticated user can view
};
