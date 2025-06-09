import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-forgot-password',
  standalone:true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  form: FormGroup;
  message = '';
  error = '';
  loading=false

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  
submit() {
  if (this.form.invalid) return;

  this.loading = true;
  this.message = '';
  this.error = '';

  this.authService.forgotPassword(this.form.value.email).subscribe({
    next: (res: any) => {
      console.log('OTP sent response:', res);
      this.message = 'OTP sent to your email, please check.';
      this.loading = false;

      this.router.navigate(['/reset-password'], {
        queryParams: { email: this.form.value.email }
      });
    },
    error: (err) => {
      console.error('Error sending OTP:', err);
      this.error = err?.error?.message || 'Failed to send OTP.';
      this.loading = false;
    },
  });
}

}