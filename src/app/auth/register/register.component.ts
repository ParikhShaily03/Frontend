import { Component, OnInit } from '@angular/core';
import { FormBuilder,Validators,FormGroup ,ReactiveFormsModule  } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private alert:AlertService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      userName: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid)  {
      this.alert.warning('⚠️ Please fill out all required fields correctly.');
      return;
    }

    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.alert.success('✅ Registration successful! Please log in.');
        this.router.navigate(['/login']);
      },
      error: err => {
        const message = err?.error?.message || 'Something went wrong.';
         if (message.includes('email')) {
        this.alert.warning(`⚠️ ${message}`);
      } else {
        this.alert.error(`🚫 Registration failed: ${message}`);
      } 
      }
    });
  }
}