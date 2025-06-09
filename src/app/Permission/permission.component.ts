import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../services/role.service';
import { PermissionService } from '../services/permissions.service';
import { Router } from '@angular/router';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-permission',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './permission.component.html',
  styleUrl: './permission.component.css'

})
export class PermissionComponent implements OnInit {
  selectedRoleId: string = '';
  roles: any[] = [];
  currentPermissions: any[] = [];
  allPermissions: any[] = [];
  selectedPermissionIds: Set<string> = new Set();

  constructor(
    private roleService: RoleService,
    private permissionService: PermissionService,
    private router: Router,
    private toastr: AlertService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadAllPermissions();
  }

  loadRoles() {
    this.roleService.getAllRoles().subscribe({
      next: (res) => {
        this.roles = res;
      },
      error: (err) => {
        console.error('Error loading roles:', err);
        this.toastr.error('Failed to load roles');
      }
    });
  }

  loadAllPermissions() {
    this.permissionService.getAllPermissions().subscribe({
      next: (res) => {
        this.allPermissions = res;
      },
      error: () => {
      
        this.toastr.error('Failed to load permissions', );
      }
    });
  }

  onRoleSelect() {
    if (!this.selectedRoleId) return;

    this.permissionService.getPermissionsByRole(this.selectedRoleId).subscribe((res: any[]) => {
      this.currentPermissions = res;
      this.selectedPermissionIds.clear();
      this.currentPermissions.forEach((permission) =>
        this.selectedPermissionIds.add(permission.id)
      );
    });
  }

  isPermissionSelected(permissionId: string): boolean {
    return this.selectedPermissionIds.has(permissionId);
  }

  onPermissionToggle(permission: any, isChecked: boolean) {
    if (isChecked) {
      this.selectedPermissionIds.add(permission.id);
    } else {
      this.selectedPermissionIds.delete(permission.id);
    }
  }
  

  assignPermissions() {
    const payload = {
      roleId: this.selectedRoleId,
      permissions: Array.from(this.selectedPermissionIds),
    };

    this.permissionService.assignMultiplePermissionsToRole(payload).subscribe({
      next: () => {
        this.toastr.success('Permissions assigned successfully', );
        this.onRoleSelect();
      },
      error: (err) => {
        console.error('Error assigning permissions:', err);
        this.toastr.error('Failed to assign permissions', );
      }
    });
  }

  removePermission(permission: any) {
    const payload = {
      roleIds: [this.selectedRoleId],
      permissionId: permission.id,
    };

    this.permissionService.removePermissionFromRole(payload).subscribe({
      next: () => {
        this.toastr.success('Permission removed successfully', );
        this.onRoleSelect();
      },
      error: (err) => {
        console.error('Error removing permission:', err);
        this.toastr.error('Failed to remove permission', );
      }
    });
  }
   
    cancel() {
      this.selectedRoleId = '';
      this.currentPermissions = [];
      this.selectedPermissionIds.clear();
    }
  
 
}
