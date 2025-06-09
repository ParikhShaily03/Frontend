  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { catchError, Observable, of, tap } from 'rxjs';
  import { environment } from '../../environment/environment.prod';
  import { AuthService } from './auth.service';
  import { HttpHeaders } from '@angular/common/http';
import { MenuRoleDto } from '../data/Menu';
import { RemoveRolePermissionsDto } from '../data/Menu';



  console.log(environment.production);
  console.log(environment.apiUrl);


  

  @Injectable({ providedIn: 'root' })
  export class MenuService {
    //private baseUrl = 'https://localhost:7000/api/Menu';
    private baseUrl = `${environment.apiUrl}/Menu`;
    
    

    constructor(private http: HttpClient, private auth: AuthService) {}
    private getHeaders(): HttpHeaders {
      const token = this.auth.getToken();
      return new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
    }

    // ✅ Get all menus (for admin CRUD)
    getAllMenus(): Observable<any[]> {
      return this.http.get<any[]>(`${this.baseUrl}/GetAllMenu`, {
        headers: this.getHeaders(),
      });
    }

    // ✅ Get menus by role (for dynamic sidebar)
    getMenusByRole(roleId: string): Observable<any[]> {
      return this.http.get<any[]>(`${this.baseUrl}/GetMenusByRole/${roleId}`, {
        headers: this.getHeaders(),
      });
    }

    getMenusByRoles(roleIds: string[]): Observable<any[]> {
      return this.http.post<any[]>(`${this.baseUrl}/GetMenusByRoles`, roleIds,{
        headers: this.getHeaders(),
      });
    }


    getMenuById(id: number): Observable<any> {
      return this.http.get<any>(`${this.baseUrl}/${id}`, {
        headers: this.getHeaders(),
      });
    }
    createMenu(menu: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}/CreateMenu`, menu, {
        headers: this.getHeaders(),
      });
    }

    updateMenu(id: number, menu: any): Observable<any> {
      return this.http.put<any>(`${this.baseUrl}/UpdateMenu?id=${id}`, menu, {
        headers: this.getHeaders(),
      });
    }

    deleteMenu(id: number): Observable<any> {
      return this.http.delete<any>(`${this.baseUrl}/DeleteMenu/${id}`, {
        headers: this.getHeaders(),
      });
    }
 
    // Update assignRolePermissionsToMenu
assignRolePermissionsToMenu(menuId: number, rolePermissions: { roleId: string; permissions: number[] }[]) {
  const payload: MenuRoleDto = {
    menuId,
    rolePermissions
  };
  return this.http.post(`${this.baseUrl}/AssignRolePermissionsToMenu`, payload, {
    headers: this.getHeaders()
  });
}

// Update removeRolePermissionsFromMenu
removeRolePermissionsFromMenu(menuId: number, roleId: string, permissionsToRemove: number[]) {
  const payload: RemoveRolePermissionsDto = {
    menuId,
    roleId,
    permissionsToRemove
  };
  return this.http.post(`${this.baseUrl}/RemoveRolePermissionsFromMenu`, payload, {
    headers: this.getHeaders()
  });
}

getRolePermissions(menuId: number, roleId?: string): Observable<any[]> {
  const params: any = {};
  if (roleId) {
    params.roleId = roleId;
  }

  return this.http.get<any[]>(`${this.baseUrl}/GetRolePermissions/${menuId}`, {
    headers: this.getHeaders(),
    params: params
  }).pipe(
    catchError(error => {
      console.error('Error fetching role permissions:', error);
      return of([]);
    })
  );
}

}

