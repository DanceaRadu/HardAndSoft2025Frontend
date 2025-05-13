import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../../services/websocket.service';
import { LogMessage } from '../../models/log-message.model';

@Component({
  selector: 'app-log-panel',
  standalone: false,
  templateUrl: './log-panel.component.html',
  styleUrl: './log-panel.component.scss'
})
export class LogPanelComponent implements OnInit {

  logs: LogMessage[] = []

  constructor(private websocketService: WebsocketService) {}

  ngOnInit(): void {
    this.websocketService.getMessages().subscribe(message => {
      console.log(message)
      if (message.type === 'log') {
        this.handleLogMessage(message)
      }
    })
  }

  handleLogMessage(message: LogMessage) {
    this.logs.unshift(message);
  }
}


