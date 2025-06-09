import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environment/environment.prod';
import { PermissionEnum } from '../data/permission.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //private apiUrl = environment.apiUrl;
  private baseUrl = `${environment.apiUrl}/Auth`;

  private permissionsSubject = new BehaviorSubject<string[]>([]);
  permissions$ = this.permissionsSubject.asObservable();

  private mimicSubject = new BehaviorSubject<void>(undefined);
  mimic$ = this.mimicSubject.asObservable();

   private menuPermissionsSubject = new BehaviorSubject<{[menuId: number]: string[]}>({});
  menuPermissions$ = this.menuPermissionsSubject.asObservable();

  private refreshTokenSubject = new BehaviorSubject<string | null>(null);



getRefreshToken(): string {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token found');
  }
  return refreshToken;
}
setRefreshToken(token: string): void {
  localStorage.setItem('refreshToken', token);
}

  constructor(private http: HttpClient) {}
  register(payload: any) {
    return this.http.post(`${this.baseUrl}/register`, payload);
  }

  login(payload: any) {
    return this.http.post(`${this.baseUrl}/login`, payload).pipe(
    tap((response: any) => {
      this.setToken(response.token);
      this.setRefreshToken(response.refreshToken);
      // ... other existing code
    })
  );
  }

  forgotPassword(email: string) {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email });
  }

  resetPassword(email: string, otp: string, newPassword: string) {
    return this.http.post(`${this.baseUrl}/reset-password`, {
      email,
      otp,
      newPassword,
    });
  }

  mimicUser(targetUserName: string) {
    const token = this.getToken();
    return this.http.post<any>(
      `${this.baseUrl}/mimic`,
      { targetUserName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  triggerMimicChange() {
    this.mimicSubject.next();
  }

  // getToken() {
  //   return localStorage.getItem('token');
  // }

 getToken(): string | null {
  return localStorage.getItem('token'); // Do not throw, just return null
}
  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  setRoles(roles: string[]) {
    localStorage.setItem('roles', JSON.stringify(roles));
  }

  getRoles(): string[] {
    const rolesJson = localStorage.getItem('roles');
    return rolesJson ? JSON.parse(rolesJson) : [];
  }

  isLoggedIn(): boolean {
  return !!this.getToken(); // returns false if null or empty string
}

  revokeToken() {
    const token = this.getToken();
    return this.http.post(
      `${this.baseUrl}/logout`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

 refreshToken(): Observable<any> {
  debugger
  const token = this.getToken();
  const refreshToken = this.getRefreshToken();
  
  if (!token || !refreshToken) {
    // Don't recursively call refreshToken - just throw error
    return throwError(() => new Error('No token or refresh token available'));
  }

  return this.http.post(`${this.baseUrl}/refresh-token`, { 
    token, 
    refreshToken 
  }).pipe(
    tap((response: any) => {
      this.setToken(response.token);
      if (response.refreshToken) {
        this.setRefreshToken(response.refreshToken);
      }
    }),
    catchError(error => {
      // Clear tokens on any refresh error
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return throwError(() => error);
    })
  );
}
  setPermissions(permissions: string[]) {
    localStorage.setItem('permissions', JSON.stringify(permissions));
    console.log('Permissions set:', permissions); // Add this line to debug
    this.permissionsSubject.next(permissions); // notify subscribers
  }

  getPermissions(): string[] {
    const token = localStorage.getItem('token');

    if (!token) return [];
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.permission || [];
  }


  setRoleIds(roleIds: string[]) {
    localStorage.setItem('roleIds', JSON.stringify(roleIds));
  }

  getRoleIds(): string[] {
    const roleIdsJson = localStorage.getItem('roleIds');
    return roleIdsJson ? JSON.parse(roleIdsJson) : [];
  }

  setMenuPermissions(menuPermissions: {[menuId: number]: string[]}) {
    localStorage.setItem('menuPermissions', JSON.stringify(menuPermissions));
    this.menuPermissionsSubject.next(menuPermissions);
  }

  getMenuPermissions(): {[menuId: number]: string[]} {
  const token = localStorage.getItem('token');
  if (!token) return {};
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.menu_permissions ? JSON.parse(payload.menu_permissions) : {};
  } catch (e) {
    console.error('Error decoding menu permissions:', e);
    return {};
  }
}

 // auth.service.ts

// Add this helper method to convert permission names to enum values
private getPermissionValue(permissionName: string): number {
  return PermissionEnum[permissionName as keyof typeof PermissionEnum] || PermissionEnum.None;
}

hasPermission(permissionValue: number): boolean {
  const permissions = this.getPermissions();
  // Convert all permission names to their numeric values
  const numericPermissions = permissions.map(p => this.getPermissionValue(p));
  return numericPermissions.includes(permissionValue);
}

hasMenuPermission(menuId: number, permissionValue: number): boolean {
  const menuPermissions = this.getMenuPermissions();
  if (menuPermissions[menuId]) {
    // Convert menu permission names to numeric values
    const numericMenuPermissions = menuPermissions[menuId].map(p => 
      this.getPermissionValue(p)
    );
    return numericMenuPermissions.includes(permissionValue);
  }
  return false;
}

 canPerformAction(menuId: number | null, permissionValue: number): boolean {
  if (menuId !== null) {
    // Check menu-specific permission first
    if (this.hasMenuPermission(menuId, permissionValue)) {
      return true;
    } else {
      // If no menu-specific permission, deny even if global exists
      return false;
    }
  }
  // No menuId means global context, so check global permission
  return this.hasPermission(permissionValue);
}
isTokenExpired(): boolean {
  const token = this.getToken();
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    return payload.exp < (Date.now() / 1000)-60;
    
  } catch {
    return true;
  }
  
}


}
