import {Component, OnInit} from '@angular/core';
import {WebsocketService} from '../../services/websocket.service';
import { DirectionMessage} from '../../models/direction-message.model';

@Component({
  selector: 'app-direction-commands',
  standalone: false,
  templateUrl: './direction-commands.component.html',
  styleUrl: './direction-commands.component.scss'
})
export class DirectionCommandsComponent implements OnInit {

  decisions: DirectionMessage[] = []

  constructor(private websocketService: WebsocketService) {
  }

  ngOnInit(): void {
    this.websocketService.getMessages().subscribe(m => {
      if(m.type === 'decision') {
        console.log(this.decisions)
        this.handleDecisionMessage(m)
      }
    })
  }

  private handleDecisionMessage(message: DirectionMessage) {
    this.decisions.unshift({
      type: message.type,
      direction: message.direction,
      timestamp: new Date()
    })
  }
}
