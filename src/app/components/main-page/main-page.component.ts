import { Component, OnInit, ViewChild } from '@angular/core';
import { RobotStatus } from '../../models/robot-status.model';
import { WebsocketService } from '../../services/websocket.service';
import { LogPanelComponent } from '../log-panel/log-panel.component';

@Component({
  selector: 'app-main-page',
  standalone: false,
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent implements OnInit {

  @ViewChild(LogPanelComponent) logPanel!: LogPanelComponent;

  robotStatus: RobotStatus = {
    type: 'status',
    sensors: {
      hall: false,
      ultrasonic: 0,
      battery_voltage: 0,
      magnetic_field: false,
      vibration: false
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

  handleDownloadLogs() {
    if (this.logPanel && this.logPanel.logs) {
      const logs = this.logPanel.logs;
      console.log('Logs:', logs);

      const blob = new Blob([JSON.stringify(logs)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'logs.json';
      a.click();
    }
  }
}
