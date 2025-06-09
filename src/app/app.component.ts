import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
//import { AuthService } from './services/auth.service';
import { MenuComponent } from './Menu/DynamicMenu/menu.component';
// import { MenuListComponent } from './Menu/menu-list.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { NotificationComponent } from "./notification/notification/notification.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, MenuComponent, NotificationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {

  isSidebarOpen = false;
 

  constructor(public authService: AuthService) {} 


  
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }


  
}

