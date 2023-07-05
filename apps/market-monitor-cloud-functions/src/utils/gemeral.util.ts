import { isAfter, isBefore, isWeekend, setHours, setMinutes, setSeconds } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

export const delaySeconds = (seconds: number) => new Promise((res) => setTimeout(res, seconds * 1000));

export const isStockMarketOpen = (input?: string) => {
  const currentDate = input ? new Date(input) : new Date();
  if (isWeekend(currentDate)) {
    return false; // Market is closed on weekends
  }

  const timeZone = 'America/New_York';
  const utcCurrentDate = zonedTimeToUtc(currentDate, timeZone);

  const marketOpeningTime = setHours(setMinutes(setSeconds(utcCurrentDate, 0), 30), 13); // 9:30 AM ET -> 13:30 UTC
  const marketClosingTime = setHours(setMinutes(setSeconds(utcCurrentDate, 0), 0), 20); // 4:00 PM ET -> 20:00 UTC

  return isAfter(utcCurrentDate, marketOpeningTime) && isBefore(utcCurrentDate, marketClosingTime);
};
