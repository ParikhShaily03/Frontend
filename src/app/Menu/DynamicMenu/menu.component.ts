import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent implements OnInit {
  parentMenus: any[] = [];

  constructor(
    private menuService: MenuService,
    private roleService: RoleService,
    private alert: AlertService,
    private authService: AuthService,
    private router: Router 
  ) {}

 ngOnInit(): void {
  this.authService.permissions$.subscribe(() => {
    if (this.authService.isLoggedIn()) {
      this.loadMenu();
    } else {
      this.parentMenus = [];
      this.router.navigate(['/home']);
    } 
  });

  this.authService.mimic$.subscribe(() => {
    if (this.authService.isLoggedIn()) {
      this.loadMenu(); // 👈 reload the menu when mimic happens
    }
  });
}

loadMenu() {
  this.parentMenus = [];

  if (!this.authService.isLoggedIn()) {
    this.router.navigate(['/home']);
    return;
  }
  const role=this.authService.getRoles()
  const roleIds = this.authService.getRoleIds();
if (!roleIds || roleIds.length === 0) {
  this.alert.error('No role IDs found for user.');
  return;
}
const roleId = roleIds[0];  // Use role ID GUID here
  this.menuService.getMenusByRole(roleId).subscribe((menus) => {
    const activeMenus = menus.filter((m) => m.isActive);
    console.log(activeMenus)
    this.parentMenus = this.buildMenuTree(activeMenus, 0);
    this.alert.success(`✅ Menu loaded for role ${role}`);
  });
}


  buildMenuTree(menuList: any[], parentId: number): any[] {
    return menuList
      .filter((menu) => menu.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((menu) => ({
        ...menu,
        children: this.buildMenuTree(menuList, menu.id),
      }));
  }
}
