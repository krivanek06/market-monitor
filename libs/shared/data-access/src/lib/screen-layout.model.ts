export enum SCREEN_LAYOUT {
  LAYOUT_SM = '(min-width: 640px)',
  LAYOUT_MD = '(min-width: 768px)',
  LAYOUT_LG = '(min-width: 1024px)',
  LAYOUT_XL = '(min-width: 1280px)',
  LAYOUT_2XL = '(min-width: 1536px)',
}

export enum SCREEN_LAYOUT_VALUES {
  LAYOUT_XS = 475,
  LAYOUT_SM = 640,
  LAYOUT_MD = 768,
  LAYOUT_LG = 1024,
  LAYOUT_XL = 1280,
  LAYOUT_2XL = 1536,
}
export type ScreenLayoutType = keyof typeof SCREEN_LAYOUT;
export type ScreenLayoutValuesType = keyof typeof SCREEN_LAYOUT_VALUES;

export const screenLayoutResolveType = (val: ScreenLayoutType) => {
  return SCREEN_LAYOUT[val];
};

export const isScreenLarger = (size: ScreenLayoutValuesType) => {
  if (!window) {
    return false;
  }
  const layout = SCREEN_LAYOUT_VALUES[size];
  return window.innerWidth >= layout;
};
