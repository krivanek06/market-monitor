export interface InputSourceWrapper<T> {
  name: string;
  items: InputSource<T>[];
}

export type DefaultImageType = 'default' | 'symbol';

export interface InputSource<T> {
  image?: string | null;
  imageType?: DefaultImageType;
  value: T;
  caption: string;
  additionalData?: unknown;
}

export const NONE_INPUT_SOURCE_VALUE = -99;
export const NONE_INPUT_SOURCE: InputSource<number> = {
  caption: 'None',
  value: NONE_INPUT_SOURCE_VALUE,
};

export type InputType =
  | 'TEXT'
  | 'NUMBER'
  | 'PASSWORD'
  | 'EMAIL'
  | 'CHECKBOX'
  | 'RADIO'
  | 'SLIDE_TOGGLE'
  | 'SELECT'
  | 'MULTISELECT'
  | 'SELECT_SOURCE_WRAPPER'
  | 'TEXTAREA'
  | 'SELECT_AUTOCOMPLETE';

// -------------------------------------------------

// -------------------------------------------------

export interface LabelValue<T> {
  label: string;
  value: T;
}

export interface InputTypeSlider {
  min: number;
  max: number;
  step: number;
  valueFormatter?: (value: number) => string;
}
