export class GeneralFunctionUtil {
  static getAssetUrl(asset: string): string {
    return `https://financialmodelingprep.com/image-stock/${asset}.png`;
  }

  static isNumber = (value: string | number | unknown): boolean => {
    return value != null && value !== '' && typeof value === 'number' && !isNaN(Number(value.toString()));
  };

  static roundNDigits = (value: number, n: number = 2): number => {
    return Math.round(value * Math.pow(10, n)) / Math.pow(10, n);
  };

  static formatLargeNumber = (
    value?: string | number | null | unknown,
    isPercent = false,
    showDollarSign = false
  ): string => {
    if (!value || (!this.isNumber(value) && typeof value !== 'number')) {
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

  static compare(a?: number | string | null, b?: number | string | null, isAsc = true): number {
    if (!!a && !b) {
      return 1;
    }

    if (!a || !b) {
      return -1;
    }

    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
