import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
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
  private connectionStatusSubject: Subject<boolean> = new Subject<boolean>();

  constructor() {
    this.connect();
  }

  connect(): void {
    this.socket = new SockJS(environment.baseURL + '/ws');
    this.stompClient = Stomp.over(this.socket);
    this.stompClient.debug = () => {};

    this.stompClient.connect({}, () => {
      console.log('Connected to Websocket ✅');
      this.connectionStatusSubject.next(true);

      this.stompClient!.subscribe('/topic/sensors', (message: any) => {
        this.onMessageReceived(message);
      });
    }, () => {
      this.connectionStatusSubject.next(false);
      console.error('Error connecting to WebSocket ❌');
    });
  }

  private onMessageReceived(message: any): void {
    const messageBody = JSON.parse(message.body);
    this.messageSubject.next(messageBody);
  }

  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatusSubject.asObservable();
  }

  disconnect(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.disconnect(() => {
        console.log('Disconnected from WebSocket');
        this.connectionStatusSubject.next(false);
      });
    }
  }
}
