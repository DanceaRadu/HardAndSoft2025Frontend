import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'logTimeFormat',
  standalone: false
})
export class LogTimeFormatPipe implements PipeTransform {

  transform(value?: Date): string {

    if(!value) {
      return '00:00:00.000';
    }

    const date = new Date(value);
    const hours = this.padZero(date.getHours());
    const minutes = this.padZero(date.getMinutes());
    const seconds = this.padZero(date.getSeconds());
    const milliseconds = this.padMilliseconds(date.getMilliseconds());

    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  private padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  private padMilliseconds(num: number): string {
    return num.toString().padStart(3, '0');
  }
}
