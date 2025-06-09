import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../data/user';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.css',
})
export class EditUserComponent implements OnInit {
  editUserForm!: FormGroup;
  userId!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private alert: AlertService
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadUser();
  }

  initForm(): void {
    this.editUserForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      department: [''],
    });
  }

  loadUser(): void {
    this.userService.getUserById(this.userId).subscribe({
      next: (user: User) => {
        this.editUserForm.patchValue(user);
      },
      error: (err) => {
        console.error('Error loading user:', err);
      },
    });
  }

  onSubmit(): void {
    if (this.editUserForm.invalid) return;

    const updatedUser: User = this.editUserForm.value;

    this.userService.upsertUser(updatedUser).subscribe({
      next: () => {
        this.alert.success('User updated successfully');
        this.router.navigate(['/users']); // Change to your user list route
      },
      error: () => {
        this.alert.error('Failed to Update user');
      },
    });
  }
}
