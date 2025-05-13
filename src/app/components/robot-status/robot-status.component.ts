import { Component, Input } from '@angular/core';
import { RobotStatus } from '../../models/robot-status.model';

@Component({
  selector: 'app-robot-status',
  standalone: false,
  templateUrl: './robot-status.component.html',
  styleUrl: './robot-status.component.scss'
})
export class RobotStatusComponent {
  @Input({required: true }) robotStatus!: RobotStatus;
}
