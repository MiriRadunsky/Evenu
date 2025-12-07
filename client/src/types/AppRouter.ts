import type { JSX } from "react/jsx-runtime";

export type AppRoute = {
  title?: string;
  path: string;
  element: JSX.Element;
  icon: React.ComponentType;
};
