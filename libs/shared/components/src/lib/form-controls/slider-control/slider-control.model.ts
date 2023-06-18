export interface InputTypeSlider {
  min: number;
  max: number;
  step: number;
  valueFormatter?: (value: number) => string;
}
