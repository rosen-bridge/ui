export type NavigationBarState = {
  click: (path: string) => void;
  isActive: (path: string) => boolean;
};
