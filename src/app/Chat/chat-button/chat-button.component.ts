import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { CommonModule } from '@angular/common';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from '../../../environment/environment.prod';

@Component({
  selector: 'app-chat-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-button.component.html',
  styleUrls: ['./chat-button.component.css']
})
export class ChatButtonComponent implements OnInit, OnDestroy {
  unreadCount = 0;
  private hubConnection?: HubConnection;

  constructor(
    public authService: AuthService,
    private router: Router,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.setupSignalR();
    }
  }

  ngOnDestroy() {
    this.hubConnection?.stop();
  }

  private setupSignalR() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/chat`, {
        accessTokenFactory: () => this.authService.getToken() || ''
      })
      .build();

    this.hubConnection.start()
      .then(() => console.log('SignalR Connected (Chat Button)'))
      .catch(err => console.error('SignalR Connection Error (Chat Button): ', err));

    this.hubConnection.on('ReceiveMessage', (message: any) => {
      if (message.receiverId === this.authService.getUserId()) {
        this.unreadCount++;
      }
    });
  }

  openChat() {
    this.unreadCount = 0; // Reset counter when opening chat
    this.router.navigate(['/chat']);
  }
}