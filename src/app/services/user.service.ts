  import { Injectable } from "@angular/core";
  import { HttpClient, HttpHeaders } from "@angular/common/http";
  import { Observable } from "rxjs";
  import { User } from "../data/user";
  import { AuthService } from "./auth.service";
  import { map } from "rxjs/operators";
  import { environment } from "../../environment/environment.prod";
  import { ColumnFilter } from "../data/user";


  @Injectable({
    providedIn: "root",
  })
  export class UserService {
    //private baseUrl = 'https://localhost:7000/api/Users';
    private baseUrl = `${environment.apiUrl}/Users`;

    constructor(private http: HttpClient, private auth: AuthService) {}

  getUsers(
    pageNumber: number = 1,
    pageSize: number = 5,
    search: string = "",
    sortField: string = "",
    sortOrder: "asc" | "desc" = "asc",
    filters?: ColumnFilter[]
  ): Observable<{ users: User[]; totalCount: number }> {
    const token = this.auth.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const requestBody = {
      PageNumber: pageNumber,
      PageSize: pageSize,
      SortField: sortField,
      SortOrder: sortOrder,
      Filters: filters || [],
      SearchTerm: search
    };
    

    console.log('Sending request body:', requestBody);
    return this.http
      .post<{ data: User[]; totalCount: number }>(`${this.baseUrl}/GetUsers`, requestBody, { headers })
      .pipe(map((res) => ({ users: res.data, totalCount: res.totalCount })));
  }

    private convertToColumnFilters(filters: any): ColumnFilter[] {
      const columnFilters: ColumnFilter[] = [];
      
      for (const key in filters) {
          if (filters[key]) {
              columnFilters.push({
                  ColumnName: key,
                  FilterValue: filters[key].toString(),
                  Operator: "contains" // or any other operator
              });
          }
      }
      
      return columnFilters;
  }

    getUserById(id: string): Observable<User> {
      const token = this.auth.getToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      return this.http.get<User>(`${this.baseUrl}/GetUser/${id}`, { headers });
    }

    upsertUser(user: User): Observable<any> {
      const token = this.auth.getToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      });

      return this.http.post(`${this.baseUrl}/UpsertUser?ID=${user.id}`, user, {
        headers,
      });
    }

    deleteUser(id: string): Observable<any> {
      const token = this.auth.getToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      return this.http.delete(`${this.baseUrl}/DeleteUser/${id}`, { headers });
    }
  }
