import { Component, OnInit } from "@angular/core";
import { ChatService, ChatMessage } from "../../services/chat.service";
import { ActivatedRoute } from "@angular/router";
import { UserService } from "../../services/user.service"; 
import { User } from "../../data/user"; 
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { OnDestroy } from "@angular/core";
import { interval, Subscription } from "rxjs";
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from "../../../environment/environment.prod"; 
import { AuthService } from "../../services/auth.service";
import { NotificationService } from "../../services/notification.service";
@Component({
  selector: "app-chat",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"],
})
export class ChatComponent implements OnInit,OnDestroy {
  messages: ChatMessage[] = [];
  userId: string = "";
  toUserId: string = "";
  users: User[] = [];
  newMessage: string = "";
  toUserName: string = "";
  private pollingSubscription: Subscription | undefined;
    private hubConnection?: HubConnection;


  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const storedUserId = localStorage.getItem("userId");
    this.userId = storedUserId ? JSON.parse(storedUserId) : "";
       this.setupSignalR();
    console.log("Logged-in user ID:", this.userId);
      this.chatService.messageReceived$.subscribe((message: ChatMessage) => {
      if (message.senderId === this.toUserId || message.receiverId === this.toUserId) {
        this.messages.push(message);
      } else {
        // Show notification for new message from other users
        this.notificationService.getNotifications();
      }
    });

    this.chatService.getContacts().subscribe(
      (data) => {
        this.users = data.users;
      },
      (error) => {
        console.error("Error fetching users:", error);
      }
    );
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.hubConnection?.stop();  // Disconnect SignalR on destroy
  }

   private setupSignalR(): void {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/chat`, {
        accessTokenFactory: () => this.authService.getToken() || ''  // Replace with your auth token logic
      })
      .build();

    this.hubConnection.start()
      .then(() => console.log('SignalR Connected (Chat)'))
      .catch(err => console.error('SignalR Connection Error (Chat): ', err));

    this.hubConnection.on('ReceiveMessage', (newMessage: ChatMessage) => {
      console.log('New Chat Message:', newMessage);
      if (newMessage.senderId === this.toUserId || newMessage.receiverId === this.toUserId) {
        this.messages.push(newMessage);
      }
    });
  }


  // Load messages with selected user
  loadMessages(): void {
    if (!this.toUserId) return;
    this.chatService.getMessages(this.toUserId).subscribe(
      (data) => {
        this.messages = data;
      },
      (error) => {
        console.error("Error fetching messages:", error);
      }
    );
  }

  // Mark as read
  markAsRead(messageId: number): void {
    this.chatService.markMessageAsRead(messageId).subscribe(
      () => {
        const message = this.messages.find((m) => m.id === messageId);
        if (message) message.isRead = true;
      },
      (error) => {
        console.error("Error marking as read:", error);
      }
    );
  }

  // Send message
  sendMessage(): void {
    if (this.newMessage.trim() && this.toUserId) {
      this.chatService.sendMessage(this.toUserId, this.newMessage).subscribe(
        (sentMessage) => {
          this.messages.push(sentMessage);
          this.newMessage = "";
        },
        (error) => {
          console.error("Error sending message:", error);
        }
      );
    }
  }


   onUserSelect(): void {
    if (this.toUserId) {
      const selectedUser = this.users.find(u => u.id === this.toUserId);
      this.toUserName = selectedUser ? selectedUser.userName : '';
      this.loadMessages();
      this.startPolling();
    } else {
      this.stopPolling();
    }
  }

  
  startPolling(): void {
    this.stopPolling(); 
    this.pollingSubscription = interval(3500).subscribe(() => {  
      this.loadMessages();
    });
  }

  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  
}
