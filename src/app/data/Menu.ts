export interface MenuItem {
  id?: number;
  title: string;
  url: string;
  icon: string;
  parentId?: number | null;
  isActive: boolean;
  sortOrder: number;
  isSubMenu: boolean;
  isExternal: boolean;
  target: string;
  cssClass: string;
  assignedRoleIds: string[];
  assignedRoleNames: string[];
  menuRoles?: { menuId: number; roleId: string; permissions: number[] }[];
}



export interface MenuRoleDto {
  menuId: number;
  rolePermissions: {
    roleId: string;
    permissions: number[]; // Array of permission values
  }[];
}

export interface RemoveRolePermissionsDto {
  menuId: number;
  roleId: string;
  permissionsToRemove: number[];
}

export interface RolePermissionAssignment {
  roleId: string;
  permissions: number[];
}