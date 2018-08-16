declare module "react-native-vector-icons/FontAwesome5" {
  import { Component } from "react";
  import { Icon, IconProps, ImageSource } from "react-native-vector-icons/Icon";

  export const FA5Style: {
    regular: 0;
    light: 1;
    solid: 2;
    brand: 3;
  };

  type ValueOf<T> = T[keyof T];

  // borrowed from
  // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html
  type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

  export type FontAwesome5IconVariants = keyof Omit<typeof FA5Style, "regular">;

  // borrowed from https://stackoverflow.com/a/49725198/1105281
  type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Omit<T, Keys> &
    {
      [K in Keys]-?: Partial<Pick<T, K>> &
        Partial<Record<Exclude<Keys, K>, undefined>>
    }[Keys];

  export type FontAwesome5IconProps = RequireOnlyOne<
    { [K in FontAwesome5IconVariants]?: boolean } & IconProps,
    FontAwesome5IconVariants
  >;

  export default class FontAwesome5Icon extends Component<
    FontAwesome5IconProps,
    any
  > {
    static getImageSource(
      name: string,
      size?: number,
      color?: string,
      fa5Style?: ValueOf<typeof FA5Style>
    ): Promise<ImageSource>;
    static loadFont(file?: string): Promise<void>;
    static hasIcon(name: string): boolean;
  }
}
