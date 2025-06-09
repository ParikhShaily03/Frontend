// Represents the full user object, typically received from the backend (GET/PUT)
export interface User {
    id?: string;            // Optional during create (POST), required during update (PUT)
    name: string;
    userName: string;
    email: string;
    department?: string;    // Optional, as it's not part of login or register
    password?: string;      // Optional — only used during login/register
    
  }
  
  // Payload used when registering a user (POST)
  export interface UserRegister {
    userName: string;
    name: string;
    email: string;
    password: string;
  }
  
  // Payload used when logging in a user
  export interface UserLogin {
    userName: string;
    password: string;
  }
  
 
export interface ColumnFilter {
  ColumnName: string;
  FilterValue: string;
  Operator: string; // 'contains', 'equals', 'startswith', 'endswith', etc.
}