import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert.service'; // Import your alert service



@Component({
  selector: 'app-logout',
  template: ''
})
export class LogoutComponent implements OnInit {
  loading: boolean = false;
  constructor(
    private authService: AuthService,
    private router: Router,
    private alert: AlertService,
   
  ) {}

  ngOnInit() {

  //  const confirmed = window.confirm('Are you sure you want to log out?');
    this.loading = true;

    if (true) {
    this.authService.revokeToken()?.subscribe({
      next: () => {
        this.loading = false; 
        console.log('Token revoked successfully');
        this.alert.success('✅ You have been logged out successfully.');
        this.clearSessionAndRedirect();
      },
      error: err => {
        this.loading = false;
        console.error('Token revocation failed', err);
        this.alert.warning('⚠️ Logout incomplete, but your session has ended.');
        this.clearSessionAndRedirect();
      }
    });
  }else {
    console.log('Logout canceled');
    this.router.navigate(['/home']);
  }
  }
  private clearSessionAndRedirect() {
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    localStorage.removeItem('permissions'); // <-- Clear permissions from storage

    this.authService.setPermissions([]); // <-- Trigger observable for menu to reload
   

    this.router.navigate(['/home']);
  }
}