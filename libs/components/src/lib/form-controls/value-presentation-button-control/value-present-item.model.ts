export interface ValuePresentItem<T> {
  imageSrc?: string | null;

  name: string;
  value: number;
  valuePrct: number;

  color: string;

  // item that will be propagated to the parent
  item: T;
}
