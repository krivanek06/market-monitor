import {
  differenceInBusinessDays,
  differenceInDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDaysInMonth,
  getMonth,
  getWeek,
  getWeeksInMonth,
  getYear,
  isBefore,
  isSameDay,
  isWeekend,
  parse,
  startOfMonth,
  subDays,
  subYears,
} from 'date-fns';
import { fromZonedTime, toZonedTime, format as tzFormat } from 'date-fns-tz';

export type DateServiceUtilDateInformation = {
  year: number;
  month: number;
  week: number;
  day: number;
};

type DateInput = string | number | Date;

export const dateGetDetailsInformationFromDate = (input: string | Date | number): DateServiceUtilDateInformation => {
  const date = new Date(input);

  return {
    year: getYear(date),
    month: getMonth(date) + 1,
    week: getWeek(date),
    day: getDaysInMonth(date),
  };
};

/**
 * const one = new Date(2022, 10, 20);
 * const second = new Date(2022, 10, 22);
 * result will be 2
 *
 * @param first
 * @param second
 * @returns the day difference in two dates
 */
export const dateGetDayDifference = (first: DateInput, second: DateInput): number => {
  const firstDate = new Date(first);
  const secondDate = new Date(second);
  return Math.abs(differenceInDays(firstDate, secondDate));
};

/**
 * Docs: https://date-fns.org/v2.14.0/docs/format
 *
 * @param inputDate
 * @param formatOptions
 * @returns - months: [1,2...12]
 */
export const dateFormatDate = (inputDate: DateInput, formateStr = 'yyyy-MM-dd'): string => {
  const date = new Date(inputDate);
  return format(date, formateStr);
};

/**
 *
 * @returns today in format yyyy-MM-dd
 */
export const getCurrentDateDefaultFormat = (date = new Date()): string => {
  return dateFormatDate(date, 'yyyy-MM-dd');
};

export const getCurrentDateDetailsFormat = (date = new Date()): string => {
  return dateFormatDate(date, 'yyyy-MM-dd HH:mm:ss');
};

export const getCurrentDateIOSFormat = (date: DateInput = new Date()): string => {
  return new Date(date).toISOString();
};

export const getYesterdaysDate = (): string => {
  return dateFormatDate(subDays(new Date(), 1));
};

export const dateIsNotWeekend = (date: DateInput): boolean => {
  return !isWeekend(new Date(date));
};

export const dateDifferenceInBusinessDays = (date1: DateInput, date2: DateInput): number => {
  return Math.abs(differenceInBusinessDays(new Date(date1), new Date(date2)));
};

export const dateGetWeeksInMonth = (inputDate: DateInput): number => {
  return getWeeksInMonth(new Date(inputDate));
};

export const dateIsSameDay = (date1: DateInput, date2: DateInput): boolean => {
  return isSameDay(new Date(Number(date1)), new Date(Number(date2)));
};

export const dateSubYears = (date: Date | number, amount: number): Date => {
  return subYears(date, amount);
};

export const dateIsBefore = (date: Date | number, dateToCompare: Date | number): boolean => {
  return isBefore(date, dateToCompare);
};

export const dateFormatDateWithHours = (date: Date) => {
  const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  return `${hours}:${minutes}, ${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
};

export const generateDatesArrayForMonth = (data: { year: number; month: number }): string[] => {
  const startDate = startOfMonth(new Date(data.year, data.month - 1)); // month is zero-based
  const endDate = endOfMonth(startDate);
  const datesArray = eachDayOfInterval({ start: startDate, end: endDate });
  const datesArrayFormatted = datesArray.map((date) => dateFormatDate(date));
  return datesArrayFormatted;
};

export const getCurrentDateAndTimeRoundedTo = (roundTo: '10_MINUTES' | 'QUARTER' | 'HOUR'): string => {
  const date = new Date();
  const minutes = date.getMinutes();
  const hours = date.getHours();
  const seconds = date.getSeconds();

  if (roundTo === '10_MINUTES') {
    const roundedMinutes = Math.round(minutes / 10) * 10;
    date.setMinutes(roundedMinutes, 0, 0);
  }

  if (roundTo === 'QUARTER') {
    const roundedMinutes = Math.round(minutes / 15) * 15;
    date.setMinutes(roundedMinutes, 0, 0);
  }

  if (roundTo === 'HOUR') {
    date.setMinutes(0, 0, 0);
  }

  return dateFormatDate(date);
};

/**
 * based on provided array of objects, it will fill out missing dates for
 * the current month
 * @param dates
 */
export const fillOutMissingDatesForMonth = <T extends { date: string }>(input: T[], ignoreWeekend = true) => {
  if (input.length === 0) {
    return input;
  }
  const first = input[0];
  // get the year and month of the element we are working
  const { year, month } = dateGetDetailsInformationFromDate(first.date);

  const dateRange = generateDatesArrayForMonth({ year, month });
  const filteredDates = dateRange.filter((date) => !ignoreWeekend || !isWeekend(new Date(date)));

  // create empty object that will fill out the missing space
  const emptyValue = Object.keys(first).reduce((acc, key) => ({ ...acc, [key]: null }), {}) as T;

  // find date in provided input else use emptyValue
  return filteredDates.map((date) => {
    const dataInInput = input.find((d) => d.date === date);
    if (dataInInput) {
      return dataInInput;
    }
    return { ...emptyValue, date };
  });
};

export const fillOutMissingDatesForDate = (
  startingDate: DateInput,
  endingDate: DateInput,
  ignoreWeekend = true,
): string[] => {
  const startDate = new Date(startingDate);
  const endDate = new Date(endingDate);

  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  const filteredDates = dateRange.filter((date) => !ignoreWeekend || !isWeekend(date));

  return filteredDates.map((date) => dateFormatDate(date));
};

/**
 * check if date is in format: yyyy-MM-dd and match
 * yyyy-03-31, yyyy-06-30, yyyy-09-30, yyyy-12-31
 *
 * @param date
 * @returns
 */
export const isDateValidQuarter = (date: DateInput): boolean => {
  const { month, day } = dateGetDetailsInformationFromDate(date);

  if (day === 31 && [3, 12].includes(month)) {
    return true;
  }

  if (day === 30 && [6, 9].includes(month)) {
    return true;
  }

  return false;
};

/**
 * from the provided date will return the most recent quarter
 * example: 2021-04-03 -> 2021-03-31
 *
 * @param date
 */
export const getMostRecentQuarter = (date: DateInput): string => {
  const { year, month, day } = dateGetDetailsInformationFromDate(date);

  if (month > 1 && month <= 3) {
    return `${year}-03-31`;
  }

  if (month > 3 && month <= 6) {
    return `${year}-06-30`;
  }

  if (month > 6 && month <= 9) {
    return `${year}-09-30`;
  }

  return `${year}-12-31`;
};

export const getPreviousQuarter = (date: DateInput): string => {
  const { year, month } = dateGetDetailsInformationFromDate(date);

  if (month > 1 && month <= 3) {
    return `${year - 1}-12-31`;
  }

  if (month > 3 && month <= 6) {
    return `${year}-03-31`;
  }

  if (month > 6 && month <= 9) {
    return `${year}-06-30`;
  }

  return `${year}-09-30`;
};

/**
 *
 * @param data
 * @returns whether data is is not older than N days
 */
export const checkDataValidityDays = <T extends { lastUpdate: string | Date }>(data?: T, days = 7) =>
  !!data && !isBefore(new Date(data.lastUpdate), subDays(new Date(), days));

export const getPreviousDate = (date: DateInput): string => {
  return subDays(new Date(date), 1).toDateString();
};

/**
 *
 * @returns converted ET time to local time - '09:30 a.m. ET' -> '15:30' Slovakia time
 */
export const convertETToLocalTime = (timeET: string): string => {
  try {
    // Define the time format based on the input '09:30 a.m. ET'
    const timeFormat = 'hh:mm a';

    // Parse the input string using date-fns
    const parsedTime = parse(timeET.replace('ET', '').trim(), timeFormat, new Date());

    // Convert to UTC, assuming input time is in Eastern Time
    const utcTime = fromZonedTime(parsedTime, 'America/New_York');

    // Get the user's local timezone
    const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Convert UTC time to user's local time
    const localTime = toZonedTime(utcTime, localTimeZone);

    // Format the output in Slovakian time format
    return tzFormat(localTime, 'HH:mm', { timeZone: localTimeZone });
  } catch {
    return '';
  }
};
