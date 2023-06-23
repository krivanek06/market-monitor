import { Pipe, PipeTransform } from '@angular/core';

// source: https://medium.com/@thunderroid/angular-date-ago-pipe-minutes-hours-days-months-years-ago-c4b5efae5fe5
@Pipe({
  name: 'dateAgo',
  standalone: true,
})
export class DateAgoPipe implements PipeTransform {
  transform(value: string): string {
    const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);
    if (seconds < 29) {
      // less than 30 seconds ago will show as 'Just now'
      return 'Just now';
    }

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    } as const;

    let counter = 0;
    for (const i in intervals) {
      // cast index to correct type
      const castedIndex = i as keyof typeof intervals;
      // get value to divide
      const intervalValue = intervals[castedIndex] as number;
      counter = Math.floor(seconds / intervalValue);
      if (counter > 0)
        if (counter === 1) {
          return counter + ' ' + i + ' ago'; // singular (1 day ago)
        } else {
          return counter + ' ' + i + 's ago'; // plural (2 days ago)
        }
    }

    return value;
  }
}
