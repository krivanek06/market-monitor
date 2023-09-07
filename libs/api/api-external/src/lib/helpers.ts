import { endOfMonth, startOfMonth } from 'date-fns';
import { firestore } from 'firebase-admin';

export const filterOutSymbols = <T extends { symbol: string }>(
  data: T[],
  nonNullableKeys: (keyof T)[] = [],
  removeKeys: (keyof T)[] = [],
): T[] => {
  // if symbol con any of the ignored symbols, filter them out
  const ignoredSymbols = ['.', '-', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  return (
    data
      // filter out symbols that contain any of the ignored symbols
      .filter((d) => !ignoredSymbols.some((ignoredSymbol) => d.symbol.includes(ignoredSymbol)))
      // filter out symbols if multiple one in the array
      // .filter((d, index) => data.indexOf(d) === index)
      // filter out symbols if keys are null
      .filter((d) => nonNullableKeys.every((key) => !!d[key]))
      .map((d) => {
        removeKeys.forEach((key) => delete d[key]);
        return d;
      })
  );
};

export const getDateRangeByMonthAndYear = (month: number | string, year: number | string): [string, string] => {
  const date = new Date(`${year}-${month}-01`);
  const from = startOfMonth(date).toISOString().split('T')[0];
  const to = endOfMonth(date).toISOString().split('T')[0];
  return [from, to];
};

/**
 * usage: .withConverter(assignTypes<DataSnapshot<SymbolOwnershipHolders[]>>());
 *
 * @returns
 */
export const assignTypes = <T extends object>() => {
  return {
    toFirestore(doc: T): firestore.DocumentData {
      return doc;
    },
    fromFirestore(snapshot: firestore.QueryDocumentSnapshot): T {
      return snapshot.data()! as T;
    },
  };
};
