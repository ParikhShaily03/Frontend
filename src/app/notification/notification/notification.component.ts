import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environment/environment.prod';
import { interval, Subscription } from 'rxjs';



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

  private pollingSubscription?: Subscription;

  constructor(
    public notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.notificationService.getNotifications();
      this.setupSignalR();
       this.startPolling();
    }
  }

  ngOnDestroy() {
    this.hubConnection?.stop();
      this.stopPolling(); 
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
  .catch(err => {
    console.error('SignalR Connection Error: ', err);
    this.startPolling(); // fallback
  });
   this.hubConnection.on('ReceiveNotification', (data) => {
  console.log('New Notification:', data);
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

  startPolling(): void {
  this.stopPolling();
  this.pollingSubscription = interval(1000).subscribe(() => {
    this.notificationService.getNotifications();
  });
}

stopPolling(): void {
  this.pollingSubscription?.unsubscribe();
}
  
}