export enum SCREEN_LAYOUT {
  LAYOUT_XS = 475,
  LAYOUT_SM = 640,
  LAYOUT_MD = 768,
  LAYOUT_LG = 1024,
  LAYOUT_XL = 1280,
  LAYOUT_2XL = 1536,
}

export type ScreenLayoutType = keyof typeof SCREEN_LAYOUT;

export const isScreenLarger = (size: ScreenLayoutType) => {
  if (!window) {
    return false;
  }
  const layout = SCREEN_LAYOUT[size];
  return window.innerWidth >= layout;
};
