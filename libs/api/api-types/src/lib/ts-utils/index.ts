import { FieldValue } from 'firebase/firestore';

export * from './omit-strict.util';
export * from './one-of.util';

export type FieldValueConverter<T> = {
  [K in keyof T]: FieldValue;
};

export type FieldValuePartial<T> = {
  [K in keyof Partial<T>]: FieldValue;
};
