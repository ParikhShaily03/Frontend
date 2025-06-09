import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
})
export class AddUserComponent implements OnInit {
  userForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private alert: AlertService
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      department: ['']
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    const newUser = this.userForm.value;
    newUser.id = ''; // Backend will generate ID

    this.userService.upsertUser(newUser).subscribe({
      next: () => {
        this.alert.success('User added successfully');
        this.router.navigate(['/user-list']);
      },
      error: () => {
        this.alert.error('Failed to add user');
      }
    });
  }
}
