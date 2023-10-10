export type ValueItem = {
  value: number;
  valuePrct: number;
};

export type ValuePresentItem<T> = ValueItem & {
  imageSrc?: string | null;

  name: string;

  color: string;

  // item that will be propagated to the parent
  item: T;
};
