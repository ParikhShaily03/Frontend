  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable, Subject } from 'rxjs';
  import { User } from '../data/user'; 
  import { environment } from '../../environment/environment.prod';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { AuthService } from './auth.service';

  // Define a model for the chat message
  export interface ChatMessage {
    id: number;
    senderId: string;
    
    receiverId: string;
    message: string;
    sentAt: string;  // ISO string
    isRead: boolean;
  }

  @Injectable({
    providedIn: 'root'
  })
  export class ChatService {
    // private apiUrl = 'https://localhost:7000/api/Chat';
      private apiUrl = `${environment.apiUrl}/Chat`;
        private hubConnection?: HubConnection;
  private messageReceived = new Subject<ChatMessage>();
  public messageReceived$ = this.messageReceived.asObservable();


   
  constructor(private http: HttpClient, private authService: AuthService) {
    this.createConnection();
  }
    private createConnection() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/chat`, {
        accessTokenFactory: () => this.authService.getToken() || ''
      })
      .build();

    this.hubConnection.start()
      .then(() => console.log('Chat Hub Connection Started'))
      .catch(err => console.error('Error starting chat hub connection: ', err));

    this.hubConnection.on('ReceiveMessage', (message: ChatMessage) => {
      this.messageReceived.next(message);
    });

  }
    getMessages(userId: string): Observable<ChatMessage[]> {
      return this.http.get<ChatMessage[]>(`${this.apiUrl}/messages/${userId}`);
    }

    // Mark a message as read
    markMessageAsRead(messageId: number): Observable<any> {
      return this.http.post(`${this.apiUrl}/mark-read/${messageId}`, {});
    }
  sendMessage(toUserId: string, message: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.apiUrl}/messages`, {
      ToUserId: toUserId,  
      Message: message
    });
  }

  getContacts(): Observable<{ users: User[] }> {
    return this.http.get<{ users: User[] }>(`${this.apiUrl}/contacts`);
  }


  }
