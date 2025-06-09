import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { authGuard } from './guards/auth.guard';
import { UserListComponent } from './users/user-list/user-list.component';
import { EditUserComponent } from './users/edit-user/edit-user.component';
import { AddUserComponent } from './users/add-user/add-user.component';
import { RoleListComponent } from './Role/role-list.component';
import { PermissionComponent } from './Permission/permission.component';
import { LogoutComponent } from './auth/logout/logout.component';
import { PermissionEnum } from './data/permission.enum';
import { UnauthoriseComponent } from './auth/Unauthorise/unauthorise.component';
 import { MenuManagementComponent } from './Menu/menu-management/menu-management.component';
 import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
 import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { MimicUserComponent } from './auth/mimic-user/mimic-user.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'home',
    component: HomeComponent,
  },

  {
    path: 'users',
    component: UserListComponent,
    canActivate: [authGuard],
   //data: { permission: PermissionEnum.View },
  },
  {
    path: 'edit-user/:id',
    component: EditUserComponent,
    canActivate: [authGuard],
  // data: { permission: PermissionEnum.Edit },
  },
  {
    path: 'add-user',
    component: AddUserComponent,
    canActivate: [authGuard],
     //data: { permission: PermissionEnum.Edit },
  },

  {
    path: 'roles',
    component: RoleListComponent,
    canActivate: [authGuard],
    // data: { permission: PermissionEnum.AccessPermission },
  },

  {
    path: 'permissions',
    component: PermissionComponent,
    canActivate: [authGuard],
     //data: { permission: PermissionEnum.AccessPermission },
  },

  {
    path: 'logout',
    component: LogoutComponent,
  },

 // { path: '**', redirectTo: '' },
  {
    path: 'MenuManagement',
    component: MenuManagementComponent,
     canActivate: [authGuard],
    data: {
     //  permission: PermissionEnum.AccessPermission,
      // Role: ['Admin']
    },
  },

  {
    path: 'unauthorized',
    component: UnauthoriseComponent,
  },

   { 
    path: 'forgot-password', 
    component: ForgotPasswordComponent,
  },

  { 
    path: 'reset-password', 
    component: ResetPasswordComponent,

  },
  { 
    path: 'Mimic-User', 
    component: MimicUserComponent,
     canActivate: [authGuard],
     data: { permission: PermissionEnum.AccessPermission},
  },
 
];
