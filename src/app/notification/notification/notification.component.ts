import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environment/environment.prod';



@Component({
  selector: 'app-notification-button',
    standalone: true,
  imports:[FormsModule,CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  showDropdown = false;
  private hubConnection?: HubConnection;

  constructor(
    public notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.notificationService.getNotifications();
      this.setupSignalR();
    }
  }

  ngOnDestroy() {
    this.hubConnection?.stop();
  }

  private setupSignalR() {
    this.hubConnection = new HubConnectionBuilder()
      // .withUrl('https://localhost:7000/notificationHub')
      .withUrl(`${environment.apiUrl}/hubs/notifications`, {
              accessTokenFactory: () => this.authService.getToken() || ''
            })
      .build();

    this.hubConnection.start()
      .then(() => console.log('SignalR Connected'))
      .catch(err => console.error('SignalR Connection Error: ', err));

    this.hubConnection.on('ReceiveNotification', () => {
      this.notificationService.getNotifications(); // Refresh notifications
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  markAsRead(id: number) {
    this.notificationService.markAsRead(id);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }
    isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}