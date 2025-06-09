import { HttpClient,HttpHeaders  } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Make sure this is correctly imported
import { environment } from '../../environment/environment.prod';
import { PermissionEnum } from '../data/permission.enum';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  //private baseUrl = 'https://localhost:7000/api/Permission';
  private baseUrl = `${environment.apiUrl}/Permission`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }


  getAllPermissions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}`, {
      headers: this.getHeaders()
    });
  }

  getPermissionsByRole(roleId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/by-role/${roleId}`,{
      headers: this.getHeaders()
    });
  }

  assignPermissionToRoles(roleIds: string[], permissionId: string): Observable<any> {
    const payload = { roleIds, permissionId };
    return this.http.post(`${this.baseUrl}/assign-to-roles`, payload,{
      headers: this.getHeaders()
    });
  }

  assignMultiplePermissionsToRole(payload: { roleId: string; permissions: string[] }): Observable<any> {
    return this.http.post(`${this.baseUrl}/assign-multiple-permissions-to-role`, payload,{
      headers: this.getHeaders()
    });
  }

  removePermissionFromRole(payload: { roleIds: string[]; permissionId: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/remove-from-role`, payload,{
      headers: this.getHeaders()
    });
  }

   
  
} 
