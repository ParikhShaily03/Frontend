import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environment/environment.prod';

export interface Role {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  //private baseUrl = 'https://localhost:7000/api/Role';
   private baseUrl = `${environment.apiUrl}/Role`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders() {
    const token = this.auth.getToken();
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  // role.service.ts
getAllRoles(search: string = '', sortBy: string = 'name', descending: boolean = false): Observable<Role[]> {
  const params = {
    search,
    sortBy,
    descending: descending.toString()
  };
  return this.http.get<Role[]>(`${this.baseUrl}/GetAll`, {
    headers: this.getHeaders(),
    params
  });
}


  createRole(roleName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/Create?roleName=${roleName}`, {}, { headers: this.getHeaders() });
  }

  updateRole(role: Role): Observable<any> {
    return this.http.put(`${this.baseUrl}/Update`, role, {
      headers: this.getHeaders()
    });
  }
  
  
  deleteRole(roleId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Delete?roleId=${roleId}`,{
      headers: this.getHeaders()
    });
  }

  assignRoleToUser(userId: string, roleName: string): Observable<any> {
  const token = this.auth.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  
  const payload = { userId, roleName };
  return this.http.post(`${this.baseUrl}/AssignRole`, payload, { headers });
}

 getRolesByUser(userId: string): Observable<{id: string, name: string}[]> {
  return this.http.get<{id: string, name: string}[]>(`${this.baseUrl}/UserRoles/${userId}`, {
    headers: this.getHeaders()
  });
}

removeRoleFromUser(userId: string, roleName: string): Observable<{ message: string }> {
  const token = this.auth.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  const payload = { userId, roleName }; // ✅ Correctly using roleName
  return this.http.post<{ message: string }>(`${this.baseUrl}/RemoveRole`, payload, { headers });
}


  getUserRoles(): Observable<string[]> {
    return of(this.auth.getRoles());
  }
  
  
}
