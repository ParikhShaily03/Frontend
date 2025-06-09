import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoleService,Role } from '../services/role.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule,FormsModule],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.css'
})
export class RoleListComponent implements OnInit {
  roles: Role[] = [];
  roleForm: FormGroup;
  editMode = false;
  editingRoleId: string | null = null;
  showForm = false;

  // 🔍 Search and Sort
  searchTerm: string = '';
  sortBy: string = 'name';
  descending: boolean = false;

 

  constructor(private roleService: RoleService, private fb: FormBuilder,  private alert: AlertService // 👈 Add this
  ) {
    this.roleForm = this.fb.group({
      roleName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  showAddForm(): void {
    this.resetForm();
    this.showForm = true;
  }

  loadRoles(): void {
    this.roleService.getAllRoles(this.searchTerm, this.sortBy, this.descending).subscribe({
      next: (res) => this.roles = res,
      error: (err) => console.error('Error loading roles:', err)
    });
  }

  
  onSearch(): void {
    this.loadRoles();
  }

  toggleSort(): void {
    this.descending = !this.descending;
    this.loadRoles();
  }

  
  submit(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }
  
   
  const roleName = this.roleForm.value.roleName.trim();

  if (!this.editMode) {
    // CREATE: Prevent duplicate roles
    const exists = this.roles.some(role => role.name.toLowerCase() === roleName.toLowerCase());
    if (exists) {
      this.alert.warning('⚠️ Role already exists');
      return;
    }

    this.roleService.createRole(roleName).subscribe({
      next: () => {
        this.alert.success('✅ Role created successfully.');
        this.resetForm();
        this.loadRoles();
      },
      error: (err) => {
        console.error('Error creating role:', err);
        this.alert.error(err.error?.message || '❌ Failed to create role');
      }
    });

  } else {
    // UPDATE
    if (!this.editingRoleId) return;

    const roleToUpdate: Role = {
      id: this.editingRoleId,
      name: roleName
    };

    this.roleService.updateRole(roleToUpdate).subscribe({
      next: () => {
        this.alert.success('✅ Role updated successfully.');
        this.resetForm();
        this.loadRoles();
      },
      error: (err) => {
        console.error('Error updating role:', err);
        this.alert.error(err.error?.message || '❌ Failed to update role');

      }
    });
  }
}
  deleteRole(id: string): void {
    if (!confirm('Are you sure you want to delete this role?')) return;
    this.roleService.deleteRole(id).subscribe({
      next: () => {
        this.alert.success('🗑️ Role deleted successfully.');

        this.loadRoles(); // reloads from server
      },
      error: (err) => {
        this.alert.error(err.error?.message || '❌ Failed to delete role');
         this.loadRoles(); // Reload list to restore if deletion failed
      }
    });
  }
  

  editRole(role: Role): void {
    this.roleForm.patchValue({ roleName: role.name });
    this.editMode = true;
    this.editingRoleId = role.id;
    this.showForm = true; // 👈 Add this line to show the form when editing
  }

  resetForm(): void {
    this.roleForm.reset();
    this.editMode = false;
    this.editingRoleId = null;
    this.showForm = false; // hide form when done
  }
}
