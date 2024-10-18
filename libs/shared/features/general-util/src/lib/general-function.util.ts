export const isNumber = (value: string | number | unknown): boolean => {
  return value != null && value !== '' && typeof value === 'number' && !isNaN(Number(value.toString()));
};

/**
 *
 * @returns calculated growth in percentage between starting and ending values
 */
export const calculateGrowth = (starting?: number, ending?: number) => {
  if (!starting || !ending || ending === 0) {
    return 0;
  }
  return roundNDigits(((starting - ending) / Math.abs(ending)) * 100);
};

export const roundNDigits = (value?: number | null, n = 2, isPercent = false): number => {
  if (value === undefined || value === null || isNaN(value)) {
    return 0;
  }

  const usedValue = isPercent ? value * 100 : value;
  return Math.round(usedValue * Math.pow(10, n)) / Math.pow(10, n);
};

export const groupValuesByDate = <T extends { date: string }>(data: T[]): { data: T[]; date: string }[] => {
  return data.reduce(
    (acc, curr) => {
      const date = curr.date.split('T')[0];
      const dateArrayIndex = acc.findIndex((d) => d.date === date);

      // date not in array, create new entry
      if (dateArrayIndex === -1) {
        return [{ date, data: [curr] }, ...acc];
      }

      // add data to the right position
      acc[dateArrayIndex].data = [...acc[dateArrayIndex].data, curr];
      return acc;
    },
    [] as { data: T[]; date: string }[],
  );
};

export const getRandomIndex = (max: number): number => {
  return Math.floor(Math.random() * max);
};

export const getRandomElement = <T>(arr: T[], limit: number): T[] => {
  return arr.sort(() => 0.5 - Math.random()).slice(0, limit);
};

export const formatValueIntoCurrency = (value?: string | number | null | unknown): string => {
  if (value === undefined || value === null || (!isNumber(value) && typeof value !== 'number')) {
    return 'N/A';
  }
  // Create our number formatter.
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });

  return formatter.format(Number(value));
};
export const formatLargeNumber = (
  value?: string | number | null | unknown,
  isPercent = false,
  showDollarSign = false,
): string => {
  if (!value || (!isNumber(value) && typeof value !== 'number')) {
    return 'N/A';
  }

  let castedValue = Number(value);

  if (isPercent) {
    const rounded = Math.round(castedValue * 100 * 100) / 100;
    return `${rounded}%`;
  }

  let symbol = '';
  if (Math.abs(castedValue) >= 1000) {
    castedValue = castedValue / 1000;
    symbol = 'K';
  }

  if (Math.abs(castedValue) >= 1000) {
    castedValue = castedValue / 1000;
    symbol = 'M';
  }

  if (Math.abs(castedValue) >= 1000) {
    castedValue = castedValue / 1000;
    symbol = 'B';
  }

  if (Math.abs(castedValue) >= 1000) {
    castedValue = castedValue / 1000;
    symbol = 'T';
  }
  let result = castedValue.toFixed(2) + symbol;

  if (showDollarSign) {
    result = `$${result}`;
  }
  return result;
};

export const compare = (a?: number | string | null, b?: number | string | null, isAsc = true): number => {
  if (!!a && !b) {
    return 1;
  }

  if (!a || !b) {
    return -1;
  }

  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
};

export const insertIntoArray = <T>(arr: T[], index: number, newItem: T): T[] => [
  // part of the array before the specified index
  ...arr.slice(0, index),
  // inserted item
  newItem,
  // part of the array after the specified index
  ...arr.slice(index),
];

export const waitSeconds = (seconds: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export const getRandomNumber = (min: number, max: number): number => {
  return Math.ceil(Math.random() * (max - min) + min);
};

export const getObjectEntries = <T extends object>(obj: T) => Object.entries(obj) as Entries<T>;
export const getObjectKeys = <T extends object>(obj: T) => Object.keys(obj) as (keyof T)[];

export const createNameInitials = (name: string) => {
  const words = name.split(' ').reduce((acc, word) => acc + (word.at(0) ?? '').toUpperCase(), '');
  return `${words}.`;
};

export const generateRandomString = (length = 10): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
