import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import * as Stomp from 'stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private stompClient: Stomp.Client | undefined;
  private socket: any;
  private messageSubject: Subject<any> = new Subject<any>()

  constructor() {
    this.connect();
  }

  connect(): void {
    this.socket = new SockJS(environment.baseURL + '/ws');
    this.stompClient = Stomp.over(this.socket);
    this.stompClient.debug = () => {};

    this.stompClient.connect({}, (frame: any) => {
      console.log('Connected to Websocket ✅');
      this.stompClient!.subscribe('/topic/sensors', (message: any) => {
        this.onMessageReceived(message);
      });
    }, (error: any) => {
      console.error('Error connecting to WebSocket ❌');
    });
  }

  private onMessageReceived(message: any): void {
    const messageBody = JSON.parse(message.body);
    this.messageSubject.next(messageBody);
  }

  getMessages() {
    return this.messageSubject.asObservable();
  }

  disconnect(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.disconnect(() => {
        console.log('Disconnected from WebSocket');
      });
    }
  }
}
