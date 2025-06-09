import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-unauthorise',
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './unauthorise.component.html',
  styleUrl: './unauthorise.component.css'
})
export class UnauthoriseComponent {

  constructor(private authService: AuthService){}

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

}
