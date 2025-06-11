  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';
  import { User } from '../data/user'; 
  import { environment } from '../../environment/environment.prod';

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

    constructor(private http: HttpClient) { }

    // Get messages with a specific user
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
