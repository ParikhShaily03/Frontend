import { Component,HostListener,OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { User } from '../../data/user';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { PaginationComponent } from '../../pagination/pagination.component';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { RoleService,Role } from '../../services/role.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { MimicUserComponent } from '../../auth/mimic-user/mimic-user.component';
import { ColumnFilter } from '../../data/user';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule,RouterModule,PaginationComponent,FormsModule,MimicUserComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  totalCount = 0;
  currentPage = 1;
  pageSize = 5;
  searchTerm = '';
  sortField = '';
  sortOrder: 'asc' | 'desc' = 'asc';
  private searchSubject = new Subject<string>();
  roles: Role[] = [];
  selectedUser: User | null = null;
  selectedRole: string = '';
userRoles: {id: string, name: string}[] = []; 
selectedUserToMimic: string | null = null;
showOptionsMap = new Set<string>();
  showFilters = false;
  shouldGlow = true;


filters: {
  name: { value: string; operator: string };
  email: { value: string; operator: string };
  userName: { value: string; operator: string };
  department: { value: string; operator: string };
} = {
  name: { value: '', operator: 'contains' },
  email: { value: '', operator: 'contains' },
  userName: { value: '', operator: 'contains' },
  department: { value: '', operator: 'contains' }
};

tempFilters = JSON.parse(JSON.stringify(this.filters));
  showColumnFilter: string | null = null;

  constructor(private userService: UserService,private roleService:RoleService,private router: Router,private authService:AuthService, private toastr: AlertService) {}

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(1000),           // Wait 500ms after the last keystroke
        distinctUntilChanged()       // Ignore if next search term is same as previous
      )
      .subscribe((term) => {
        this.searchTerm = term;
        this.currentPage = 1;       // Reset to first page
        this.fetchUsers();
      });
    this.fetchUsers();
  }


  fetchUsers(): void {
    const filterParams = this.buildFilterParams();
    this.userService.getUsers(
      this.currentPage,
      this.pageSize,
      this.searchTerm,
      this.sortField,
      this.sortOrder,
      filterParams
    ).subscribe({
      next: (res) => {
        this.users = res.users;
        this.totalCount = res.totalCount;
      },
      error: () => {
        this.toastr.error('Failed to load users');
      }
    });
  }

  @HostListener('document:click', ['$event'])
handleDocumentClick(event: MouseEvent) {
  // Check if click was outside any filter container
  const filterContainers = document.querySelectorAll('.filter-container');
  let clickedInsideFilter = false;
  
  
  filterContainers.forEach(container => {
    if (container.contains(event.target as Node)) {
      clickedInsideFilter = true;
    }
  });

  if (!clickedInsideFilter) {
    this.showColumnFilter = null;
  }
}

   buildFilterParams(): ColumnFilter[] {
  const columnFilters: ColumnFilter[] = [];
  
  if (this.filters.name.value) {
    columnFilters.push({
      ColumnName: 'Name',
      FilterValue: this.filters.name.value,
      Operator: this.filters.name.operator
    });
  }
  
  if (this.filters.email.value) {
    columnFilters.push({
      ColumnName: 'Email',
      FilterValue: this.filters.email.value,
      Operator: this.filters.email.operator
    });
  }
  
  if (this.filters.userName.value) {
    columnFilters.push({
      ColumnName: 'UserName',
      FilterValue: this.filters.userName.value,
      Operator: this.filters.userName.operator
    });
  }
  
  if (this.filters.department.value) {
    columnFilters.push({
      ColumnName: 'Department',
      FilterValue: this.filters.department.value,
      Operator: this.filters.department.operator
    });
  }
  
  return columnFilters;
}
// Update clearFilters method
clearFilters(): void {
  this.filters = {
    name: { value: '', operator: 'contains' },
    email: { value: '', operator: 'contains' },
    userName: { value: '', operator: 'contains' },
    department: { value: '', operator: 'contains' }
  };
  this.applyFilters();
}

 applyFilters(): void {
    // Copy tempFilters to filters
    this.filters = JSON.parse(JSON.stringify(this.tempFilters));
    this.currentPage = 1;
    this.showColumnFilter = null;
    this.fetchUsers();
  }

   clearFilter(column: string): void {
    if (column in this.tempFilters) {
      this.tempFilters[column] = { value: '', operator: 'contains' };
    }
  }

    cancelFilter(): void {
    this.showColumnFilter = null;
    // No changes applied, so tempFilters remains intact for next time
  }

// Add this method to your component
setFilterPosition(column: string, event: MouseEvent) {
  setTimeout(() => {
    const filterButton = event.target as HTMLElement;
    const filterPopup = document.querySelector(`.column-filter[data-column="${column}"]`) as HTMLElement;

if (filterButton && filterPopup) {
  const buttonRect = filterButton.getBoundingClientRect();
  const popupHeight = filterPopup.clientHeight;
  const popupWidth = filterPopup.clientWidth;
  const spaceBelow = window.innerHeight - buttonRect.bottom;
  const spaceRight = window.innerWidth - buttonRect.left;

  // Position horizontally
  if (spaceRight < popupWidth + 20) {
    filterPopup.style.left = 'auto';
    filterPopup.style.right = '20px';
  } else {
    filterPopup.style.left = `${buttonRect.left}px`;
    filterPopup.style.right = 'auto';
  }

  // Position vertically
  if (spaceBelow < popupHeight + 20) {
    filterPopup.style.top = 'auto';
    filterPopup.style.bottom = `${window.innerHeight - buttonRect.top + 5}px`;
  } else {
    filterPopup.style.top = `${buttonRect.bottom + 5}px`;
    filterPopup.style.bottom = 'auto';
  }
}

  });
}

// Update your toggleColumnFilter method
toggleColumnFilter(column: string, event: MouseEvent): void {
  if (this.showColumnFilter === column) {
    this.showColumnFilter = null;
  } else {
    this.showColumnFilter = column;
    this.setFilterPosition(column, event);
    
    // Copy current filter for that column to tempFilters
    if (column in this.filters) {
      this.tempFilters[column as keyof typeof this.filters] = { 
        ...this.filters[column as keyof typeof this.filters] 
      };
    }
  }
}

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    if (!this.showFilters) {
      this.clearFilters();
    }
  }

  

  onSearchChange(term: string): void {
    //this.searchTerm = term;
    this.searchSubject.next(term);
    this.currentPage = 1; // Reset to first page
   // this.fetchUsers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.fetchUsers();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1; // reset to first page
    this.fetchUsers();
  }
  
  onSort(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.fetchUsers();
  }
  
  softDelete(userId: string): void {
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        // ✅ Refresh list after deletion
        this.fetchUsers();
      },
      error: () => {
        this.toastr.error('Error deleting user:');
      }
    });
  }

  editUser(userId: string): void {
    this.router.navigate(['/edit-user', userId]);
  }

  openRoleModal(user: User): void {
    this.selectedUser = user;
    this.selectedRole = '';
    this.roleService.getAllRoles().subscribe({
      next: roles => this.roles = roles,
      error: () => {
        this.toastr.error('Failed to load Roles');
      }
    });

    this.roleService.getRolesByUser(user.id!).subscribe({
      next: roles => this.userRoles = roles,
      error: () => {
        this.toastr.error('Failed to load User Roles');
      }
    });
  }
  
  closeRoleModal(): void {
    this.selectedUser = null;
  }
  
  assignRole(): void {
  if (!this.selectedUser || !this.selectedRole) return;
  
  // Find the full role object to get its name
  const role = this.roles.find(r => r.id === this.selectedRole);
  if (!role) {
    this.toastr.error('Role not found');
    return;
  }

  this.roleService.assignRoleToUser(this.selectedUser.id!, role.name).subscribe({
    next: () => {
      this.toastr.success(`Role '${role.name}' assigned to ${this.selectedUser!.name}`);
      this.closeRoleModal();
      // Refresh the user's roles
      this.roleService.getRolesByUser(this.selectedUser!.id!).subscribe({
        next: (roles) => (this.userRoles = roles),
        error: (err) => {
          console.error('Error refreshing roles:', err);
          this.toastr.error('Failed to refresh roles');
        },
      });
    },
    error: (err) => {
      console.error('Assign role error:', err);
      this.toastr.error(`Failed to assign role: ${err.error?.message || err.message}`);
    },
  });
} 



removeRole(role: { id: string, name: string }): void {
  if (!this.selectedUser) return;

  const confirmed = window.confirm(`Are you sure you want to remove role '${role.name}'?`);
  if (!confirmed) return;

  this.roleService.removeRoleFromUser(this.selectedUser.id!, role.name).subscribe({
    next: (res) => {
      this.toastr.success(`Role '${role.name}' removed successfully`);
      // Refresh the roles list
      this.roleService.getRolesByUser(this.selectedUser!.id!).subscribe({
        next: (roles) => (this.userRoles = roles),
        error: (err) => {
          console.error('Error refreshing roles:', err);
          this.toastr.error('Failed to refresh roles');
        },
      });
    },
    error: (err) => {
      console.error('Remove role error:', err);
      this.toastr.error(`Failed to remove role: ${err.error?.message || err.message}`);
    },
  });
}


openMimicModal(username: string) {
  this.selectedUserToMimic = username;
}

closeMimicModal() {
  this.selectedUserToMimic = null;
}



toggleOptions(userId: string): void {
  if (this.showOptionsMap.has(userId)) {
    this.showOptionsMap.delete(userId);
  } else {
    this.showOptionsMap.add(userId);
  }
}

isOptionsVisible(userId: string): boolean {
  return this.showOptionsMap.has(userId);
}

  
  

 hasPermission(permission: string): boolean {
  const permissions = this.authService.getPermissions();
  
  return permissions.includes(permission);
}

}



