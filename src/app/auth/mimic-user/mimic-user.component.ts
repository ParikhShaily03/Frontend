import { Component,Input,Output,EventEmitter } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-mimic-user',
  imports: [ReactiveFormsModule,CommonModule,FormsModule],
  templateUrl: './mimic-user.component.html',
  styleUrl: './mimic-user.component.css'
})
export class MimicUserComponent {
  @Input() username: string = '';
  @Output() closed = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  confirmMimic() {
    this.authService.mimicUser(this.username).subscribe({
      next: (res) => {
        this.authService.setToken(res.data.token);
        this.authService.setRoles(res.data.roles);
        this.authService.setPermissions(res.data.permissions || []);
        this.authService.setRoleIds(res.data.roleIds || []);
        localStorage.setItem('impersonatedBy', res.data.impersonatedBy || '');
        this.authService.triggerMimicChange();
        this.closed.emit();
      },
      error: (err) => {
        console.error('Mimic failed', err);
      }
    });
  }

  closeModal() {
    this.closed.emit();
  }
}