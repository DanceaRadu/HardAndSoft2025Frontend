import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-robot-status',
  standalone: false,
  templateUrl: './robot-status.component.html',
  styleUrl: './robot-status.component.scss'
})
export class RobotStatusComponent implements OnInit {
  constructor(private websocketService: WebsocketService) { }

  ngOnInit(): void {
    this.websocketService.getMessages().forEach(e => {
      console.log("message", e)
    })
  }
}
