import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-reset-password',
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})export class ResetPasswordComponent {
  form: FormGroup;
  message = '';
  error = '';

  constructor(private fb: FormBuilder, private authService: AuthService,private router: Router ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit() {
  const { email, otp, newPassword } = this.form.value;

  this.authService.resetPassword(email, otp, newPassword).subscribe({
    next: () => {
      this.message = 'Password reset successful!';
      setTimeout(() => {
        this.router.navigate(['/login']); // Redirect after 2 seconds (optional)
      }, 2000);
    },
    error: (err: any) => {
      this.error = 'Invalid OTP or email.';
    }
  });
}

}