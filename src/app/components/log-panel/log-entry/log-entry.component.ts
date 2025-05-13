import {Component, Input} from '@angular/core';
import {LogMessage} from '../../../models/log-message.model';

@Component({
  selector: 'app-log-entry',
  standalone: false,
  templateUrl: './log-entry.component.html',
  styleUrl: './log-entry.component.scss'
})
export class LogEntryComponent {
  @Input({required: true}) log!: LogMessage
}
