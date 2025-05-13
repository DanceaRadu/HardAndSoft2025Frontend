import { Component, OnInit } from '@angular/core';
import { RobotStatus } from '../../models/robot-status.model';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-main-page',
  standalone: false,
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent implements OnInit {

  robotStatus: RobotStatus = {
    type: 'status',
    sensors: {
      hall: false,
      ultrasonic: 0
    }
  }

  constructor(private websocketService: WebsocketService) {}

  ngOnInit(): void {
    this.websocketService.getMessages().subscribe(e => {
      this.handleWebsocketMessage(e)
    })
  }

  handleWebsocketMessage(message: any) {
    if (message.type === 'status') {
      console.log(message)
      this.robotStatus = message;
    }
  }
}
