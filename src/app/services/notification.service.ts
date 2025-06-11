import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from '../../environment/environment.prod';

export interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
 // private notificationsUrl = 'https://localhost:7000/api/Notification';
   private notificationsUrl = `${environment.apiUrl}/Notification`;
  private unreadCount = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCount.asObservable();
  private notifications = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notifications.asObservable();
   private newNotification = new Subject<Notification>();
  public newNotification$ = this.newNotification.asObservable();

 private hubConnection?: HubConnection;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.createConnection();
  }

    private createConnection() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/notifications`, {
        accessTokenFactory: () => this.authService.getToken() || ''
      })
      .build();

    this.hubConnection.start()
      .then(() => console.log('Notification Hub Connection Started'))
      .catch(err => console.error('Error starting notification hub connection: ', err));

    this.hubConnection.on('ReceiveNotification', (notification: Notification) => {
      this.newNotification.next(notification);
      this.getNotifications(); // Refresh the list
    });
  }
  getNotifications() {
    this.http.get<Notification[]>(this.notificationsUrl).subscribe({
      next: (notifs) => {
        this.notifications.next(notifs);
        this.updateUnreadCount(notifs);
      },
      error: (err) => console.error('Error fetching notifications', err)
    });
  }

  markAsRead(id: number) {
    this.http.post(`${this.notificationsUrl}/${id}/mark-read`, {}).subscribe({
      next: () => {
        const updated = this.notifications.value.map(n => 
          n.id === id ? {...n, isRead: true} : n
        );
        this.notifications.next(updated);
        this.updateUnreadCount(updated);
      },
      error: (err) => console.error('Error marking notification as read', err)
    });
  }

  private updateUnreadCount(notifs: Notification[]) {
    const count = notifs.filter(n => !n.isRead).length;
    this.unreadCount.next(count);
  }
}