export const getAssetUrl = (asset: string): string => {
  return `https://get-asset-url.krivanek1234.workers.dev/${asset}`;
};

export const isNumber = (value: string | number | unknown): boolean => {
  return value != null && value !== '' && typeof value === 'number' && !isNaN(Number(value.toString()));
};

export const roundNDigits = (value?: number | null, n: number = 2, isPercent = false): number => {
  if (value === undefined || value === null) {
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

export const formatValueIntoCurrency = (value?: string | number | null | unknown): string => {
  if (!value || (!isNumber(value) && typeof value !== 'number')) {
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

export const ensureFind = <T>(argument: T | undefined | null, message = 'This value was promised to be there.'): T => {
  if (argument === undefined || argument === null) {
    throw new TypeError(message);
  }

  return argument;
};

export const insertIntoArray = <T>(arr: T[], index: number, newItem: T): T[] => [
  // part of the array before the specified index
  ...arr.slice(0, index),
  // inserted item
  newItem,
  // part of the array after the specified index
  ...arr.slice(index),
];
