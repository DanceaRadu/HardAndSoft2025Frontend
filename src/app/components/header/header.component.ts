import { Component, OnDestroy, OnInit } from '@angular/core';
import { WebsocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isConnected: boolean = false;
  private connectionStatusSubscription!: Subscription;

  constructor(private websocketService: WebsocketService) {}

  ngOnInit(): void {
    this.connectionStatusSubscription = this.websocketService.getConnectionStatus()
      .subscribe(status => {
        this.isConnected = status;
      });
  }

  ngOnDestroy(): void {
    if (this.connectionStatusSubscription) {
      this.connectionStatusSubscription.unsubscribe();
    }
  }

  handleStartMazeMapping() {
    this.websocketService.sendMessage("sensors", {type: "start"})
  }

  handleStopMazeMapping() {
    this.websocketService.sendMessage("sensors", {type: "stop"})
  }
}
