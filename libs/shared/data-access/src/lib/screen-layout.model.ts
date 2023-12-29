export enum SCREEN_LAYOUT {
  LAYOUT_SM = '(min-width: 640px)',
  LAYOUT_MD = '(min-width: 768px)',
  LAYOUT_LG = '(min-width: 1024px)',
  LAYOUT_XL = '(min-width: 1280px)',
  LAYOUT_2XL = '(min-width: 1536px)',
}

export type ScreenLayoutType = keyof typeof SCREEN_LAYOUT;

export const screenLayoutResolveType = (val: ScreenLayoutType) => {
  return SCREEN_LAYOUT[val];
};
