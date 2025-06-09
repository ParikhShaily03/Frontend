import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RoleService } from '../../services/role.service';
import { catchError, finalize, forkJoin, Observable, of } from 'rxjs';
import { PermissionService } from '../../services/permissions.service';
import { PermissionEnum } from '../../data/permission.enum';
import { MenuItem } from '../../data/Menu';
import { AuthService } from '../../services/auth.service';


interface RolePermissionAssignment {
  roleId: string;
  permissions: number[]; // Changed to array to match backend
}
@Component({
  selector: 'app-menu-management',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './menu-management.component.html',
  styleUrl: './menu-management.component.css',
})
export class MenuManagementComponent implements OnInit {
  menus: any[] = [];
  menuForm: FormGroup;
  showForm = false;
  isEditing = false;
  currentMenuId: number | null = null;
  roles: any[] = [];
  errorMessage = '';
 selectedMenuId: number | null = null;
selectedRoleId: string | null = null;
selectedPermissions: number[] = [];
showRolePermissionForm = false;
filteredPermissions: { key: string, value: number }[] = [];
PermissionEnum=PermissionEnum




constructor(
    private menuService: MenuService,
    private fb: FormBuilder,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private authService:AuthService
  ) {
    this.menuForm = this.fb.group({
      title: [''],
      url: [''],
      icon: [''],
      parentId: [null],
      isActive: [true],
      isSubMenu: [false],
      isExternal: [false],  
      target: [''],
      cssClass: [''],
    });
  }

  ngOnInit(): void {
    this.loadMenus();
    this.loadRoles();
    this.filterPermissions(); 
this.checkPermissions();
    
    
  }

  checkPermissions() {
  console.log('Global permissions:', this.authService.getPermissions());
  console.log('Menu permissions:', this.authService.getMenuPermissions());
  console.log('Can create:', this.canCreateMenu());
  console.log('Can edit menu 1:', this.canEditMenu(5));
}
   private filterPermissions(): void {
    this.filteredPermissions = Object.keys(PermissionEnum)
      .filter(key => isNaN(Number(key))) // Filter out numeric keys
      .map(key => ({
        key: key,
        value: PermissionEnum[key as keyof typeof PermissionEnum] as number
      }));
  }

  loadRoles(): void {
    this.roleService.getAllRoles().subscribe({
      next: (roles) => (this.roles = roles),
      error: (err) => console.error(err),
    });
  }

  loadMenus(): void {
    this.menuService.getAllMenus().subscribe({
      next: (data) => {
        this.menus = data.map((menu) => ({
          ...menu,
          id: menu.id,
          assignedRoles: (menu.assignedRoleIds || []).map(
            (id: string, index: number) => ({
              id,
              name: menu.assignedRoleNames?.[index] || '',
            })
          ),
          menuRoles: menu.menuRoles || [],
        }));

      },
      error: (err) => console.error(err),
    });
  }


  onSubmit(): void {
    if (this.menuForm.invalid) {
      console.error('Form is invalid');
      return;
    }

    const formValue = this.menuForm.value;
    const operation = this.isEditing && this.currentMenuId !== null
      ? this.menuService.updateMenu(this.currentMenuId, formValue)
      : this.menuService.createMenu(formValue);

    operation.pipe(
      catchError(err => {
        console.error('Operation failed:', err);
        this.errorMessage = 'Failed to save menu';
        return of(null);
      })
    ).subscribe(result => {
      if (result) {
        this.loadMenus();
        this.resetForm();
      }
    });
  }

  showCreateForm() {
    this.isEditing = false;
    this.menuForm.reset(); // clear form
    this.showForm = true;
  }

  editMenu(menu: any): void {
    this.isEditing = true;
    this.showForm = true;
    this.currentMenuId = menu.id;
    this.menuForm.patchValue(menu);
  }

  deleteMenu(id: number): void {
    if (confirm('Are you sure you want to delete this menu?')) {
      this.menuService.deleteMenu(id).subscribe(() => this.loadMenus());
    }
  }

  resetForm(): void {
    this.menuForm.reset({
      isActive: true,
      isSubMenu: false,
      isExternal: false,
    });
    this.isEditing = false;
    this.currentMenuId = null;
    this.showForm = false;
  }



// Load or reset these when editing or selecting a menu
openRolePermissionEditor(menuId: number) {
  this.selectedMenuId = menuId;
  this.selectedRoleId = null;
  this.selectedPermissions = [];
  this.showRolePermissionForm = true; // you'll create a form or popup in template
}
// Change assignRolePermissions to send array of permissions
assignRolePermissions() {
  if (!this.selectedMenuId || !this.selectedRoleId || this.selectedPermissions.length === 0) {
    alert('Select a role and at least one permission.');
    return;
  }

  this.menuService.assignRolePermissionsToMenu(this.selectedMenuId, [
    { 
      roleId: this.selectedRoleId, 
      permissions: this.selectedPermissions // Send as array
    }
  ]).subscribe({
    next: () => {
      alert('Role permissions assigned successfully');
      this.loadMenus();
      this.closeRolePermissionEditor();
    },
    error: (err) => {
      console.error(err);
      alert('Failed to assign role permissions');
    }
  });
}

private decodePermissions(permissionFlags: number[]): number[] {
  // Backend now sends array of permissions directly
  return permissionFlags;
}

removeRolePermissions(menuId: number, roleId: string, permissionsToRemove: number[]) {
  this.menuService.removeRolePermissionsFromMenu(menuId, roleId, permissionsToRemove).subscribe({
    next: () => {
      alert('Role permissions removed successfully');
      this.loadMenus();
    },
    error: (err) => {
      console.error(err);
      alert('Failed to remove role permissions');
    }
  });
}



closeRolePermissionEditor() {
  this.showRolePermissionForm = false;
  this.selectedMenuId = null;
  this.selectedRoleId = null;
  this.selectedPermissions = [];
}

onPermissionChange(event: Event, permissionValue: number) {
  const target = event.target as HTMLInputElement;
  if (target.checked) {
    if (!this.selectedPermissions.includes(permissionValue)) {
      this.selectedPermissions.push(permissionValue);
    }
  } else {
    const index = this.selectedPermissions.indexOf(permissionValue);
    if (index > -1) {
      this.selectedPermissions.splice(index, 1);
    }
  }
}


getCurrentRolePermissions(menuId: number, roleId: string): void {
  this.menuService.getRolePermissions(menuId, roleId).subscribe({
    next: (permissions: RolePermissionAssignment[]) => {
      if (permissions && permissions.length > 0) {
        // Backend now only returns permissions for the specific role
        const permissionFlags = permissions[0].permissions;
        this.selectedPermissions = this.decodePermissions(permissionFlags);
      } else {
        this.selectedPermissions = [];
      }
    },
    error: (err) => {
      console.error('Error fetching permissions:', err);
      this.selectedPermissions = [];
    }
  });
}



  
onRoleSelect(roleId: any): void {
  this.selectedRoleId = roleId;
  this.selectedPermissions = []; // reset immediately to avoid stale display
  if (this.selectedMenuId && roleId) {
    this.getCurrentRolePermissions(this.selectedMenuId, roleId);
  }
}

getPermissionName(permissionValue: number): string {
  const perm = this.filteredPermissions.find(p => p.value === permissionValue);
  return perm ? perm.key : '';
}

removePermission(permissionValue: number): void {
  if (!this.selectedMenuId || !this.selectedRoleId) return;

  const permission = this.filteredPermissions.find(p => p.value === permissionValue);
  if (permission) {
    this.removeRolePermissions(
      this.selectedMenuId,
      this.selectedRoleId,
      [permission.value]
    );
  }
}


// Remove all permissions
removeAllPermissions(): void {
  if (!this.selectedMenuId || !this.selectedRoleId) return;
  
  if (confirm('Are you sure you want to remove all permissions for this role?')) {
    const permissionsToRemove = [...this.selectedPermissions];
    this.removeRolePermissions(
      this.selectedMenuId, 
      this.selectedRoleId, 
      permissionsToRemove
    );
  }
}

canCreateMenu(): boolean {
  const menuManagementId = 5; // Or get it dynamically from your loaded menu list
  return this.authService.canPerformAction(menuManagementId, PermissionEnum.Create);
} 

canEditMenu(menuId: number): boolean {
  return this.authService.canPerformAction(menuId, PermissionEnum.Edit);
}

canDeleteMenu(menuId: number): boolean {
  return this.authService.canPerformAction(menuId, PermissionEnum.Delete);
}

canManagePermissions(menuId: number): boolean {
  return this.authService.canPerformAction(menuId, PermissionEnum.AccessPermission);
}

 

}