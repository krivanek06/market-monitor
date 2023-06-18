export interface InputSourceWrapper {
  name: string;
  items: InputSource[];
}

export interface InputSource {
  image?: string;
  value: string | number;
  caption: string;
  additionalData?: unknown;
}

export const NONE_INPUT_SOURCE_VALUE = -99;
export const NONE_INPUT_SOURCE: InputSource = {
  caption: 'None',
  value: NONE_INPUT_SOURCE_VALUE,
};

export enum InputTypeEnum {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  EMAIL = 'EMAIL',
  PASSWORD = 'PASSWORD',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
  SLIDE_TOGGLE = 'SLIDE_TOGGLE',
  TIME = 'TIME',
  SELECT = 'SELECT',
  SELECTSEARCH = 'SELECTSEARCH',
  TEXTAREA = 'TEXTAREA',
  MULTISELECT = 'MULTISELECT',
  SELECT_SOURCE_WRAPPER = 'SELECT_SOURCE_WRAPPER',
}

export type InputType =
  | 'TEXT'
  | 'NUMBER'
  | 'PASSWORD'
  | 'EMAIL'
  | 'CHECKBOX'
  | 'RADIO'
  | 'SLIDE_TOGGLE'
  | 'SELECT'
  | 'SELECTSEARCH'
  | 'MULTISELECT'
  | 'SELECT_SOURCE_WRAPPER'
  | 'TEXTAREA';

// -------------------------------------------------

// -------------------------------------------------

export interface LabelValue<T> {
  label: string;
  value: T;
}
