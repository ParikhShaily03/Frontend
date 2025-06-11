import { Component, OnInit } from "@angular/core";
import { ChatService, ChatMessage } from "../../services/chat.service";
import { ActivatedRoute } from "@angular/router";
import { UserService } from "../../services/user.service"; // Import UserService
import { User } from "../../data/user"; // Import User model
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { OnDestroy } from "@angular/core";
import { interval, Subscription } from "rxjs";

@Component({
  selector: "app-chat",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"],
})
export class ChatComponent implements OnInit {
  messages: ChatMessage[] = [];
  userId: string = "";
  toUserId: string = "";
  users: User[] = [];
  newMessage: string = "";
  toUserName: string = "";
  private pollingSubscription: Subscription | undefined;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const storedUserId = localStorage.getItem("userId");
    this.userId = storedUserId ? JSON.parse(storedUserId) : "";
    console.log("Logged-in user ID:", this.userId);

    this.chatService.getContacts().subscribe(
      (data) => {
        this.users = data.users;
      },
      (error) => {
        console.error("Error fetching users:", error);
      }
    );
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
    this.stopPolling(); // Stop any existing polling
    this.pollingSubscription = interval(3000).subscribe(() => {  
      this.loadMessages();
    });
  }

  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
