import { Component, OnInit, ViewChild } from '@angular/core';
import { RobotStatus } from '../../models/robot-status.model';
import { WebsocketService } from '../../services/websocket.service';
import { LogPanelComponent } from '../log-panel/log-panel.component';
import { MapPoint } from '../../models/lidar.model';

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
      battery_voltage: 0,
      magnetic_field: false,
      vibration: false,
      alcohol: false
    }
  }
  currentRobotX: number = 0;
  currentRobotY: number = 0;

  constructor(private websocketService: WebsocketService) {}

  ngOnInit(): void {
    this.websocketService.getMessages().subscribe(e => {
      this.handleWebsocketMessage(e)
    })
  }

  handlePositionUpdate(position: MapPoint) {
    this.currentRobotX = position.x;
    this.currentRobotY = position.y;
  }

  handleWebsocketMessage(message: any) {
    if (message.type === 'status') {
      console.log(message)

      if(message.sensors.alcohol === true) {
        this.sentEventWebsocketMessage("alcohol")
      }
      if(message.sensors.vibration === true) {
        this.sentEventWebsocketMessage("vibration")
      }
      if(message.sensors.magnetic_field === true) {
        this.sentEventWebsocketMessage("magnetic_field")
        this.websocketService.sendMessage("sensors", {"type": "stop"})
      }
      this.robotStatus = message;
    }
  }

  private sentEventWebsocketMessage(eventType: string) {
    this.websocketService.sendMessage("sensors", {
      type: "log",
      logType: eventType,
      timestamp: new Date(),
      x: this.currentRobotX,
      y: this.currentRobotY
    })
  }

  handleDownloadLogs() {
    if (this.logPanel && this.logPanel.logs) {
      const logs = this.logPanel.logs;

      const blob = new Blob([JSON.stringify(logs)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'logs.json';
      a.click();
    }
  }
}
