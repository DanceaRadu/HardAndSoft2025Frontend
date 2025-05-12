import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-connection-status',
  standalone: false,
  templateUrl: './connection-status.component.html',
  styleUrl: './connection-status.component.scss'
})
export class ConnectionStatusComponent {
  @Input({required: true}) status: boolean = false;
}
