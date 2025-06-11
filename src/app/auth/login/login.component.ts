import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { RouterModule } from '@angular/router';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  form;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private alert: AlertService
  ) {
    this.form = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  submit() {
    if (this.form.invalid) return;

    this.auth.login(this.form.value).subscribe({
      next: (res: any) => {
        const token = res?.data?.token;
        const userId = res?.data?.userId;
        const roles = res.data.roles;
        const roleIds = res.data.roleIds;
        const permissions = res.data.permissions;
        const menuPermissions = res.data.menuPermissions;
const refreshtoken=res.data.refreshToken;

        this.alert.success('Login successful');

        console.log('Login response:', res);

        if (token && userId) {
          this.auth.setToken(token);
          this.auth.setRoles(roles);
          this.auth.setRoleIds(roleIds);
          this.auth.setPermissions(permissions);
          this.auth.setMenuPermissions(menuPermissions); 
          this.auth.setRefreshToken(refreshtoken)
         this.auth.setUserId(userId);

          this.router.navigate(['/users']);
        } else {
          this.alert.warning('Login succeeded, but token not found');
        }
      },
      error: (err) => {
        const message = err?.error?.toLowerCase();
       // const message = (typeof err?.error === 'string' ? err.error : err?.error?.message)?.toLowerCase();

        if (message?.includes('invalid') || message?.includes('unauthorized')) {
          this.alert.error('❌ Invalid username or password.');
        } else {
          this.alert.error('🚫 Login failed. Please try again.');
        }
      },
    });
  }
}
