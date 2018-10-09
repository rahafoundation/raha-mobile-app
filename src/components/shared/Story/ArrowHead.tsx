import * as React from "react";
import Svg, { Path } from "react-native-svg";

export enum ArrowHeadDirection {
  Up = "up",
  Down = "down"
}

interface ArrowHeadProps {
  direction: ArrowHeadDirection;
  color: string;
  width: number;
}

function rotationForDirection(direction: ArrowHeadDirection): number {
  switch (direction) {
    case ArrowHeadDirection.Up:
      return 0;
    case ArrowHeadDirection.Down:
      return 180;
    default:
      console.error(`Invalid direction: ${direction}`);
      return 0;
  }
}

// based on the actual SVG art
const SVG_WIDTH = 300;
const SVG_HEIGHT = 170.133;
export const ArrowHead: React.StatelessComponent<ArrowHeadProps> = ({
  direction,
  width,
  color
}) => {
  return (
    <Svg
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      width={width}
      height={(width / SVG_WIDTH) * SVG_HEIGHT}
    >
      {/* Credit: path is derived from caret-up icon in FontAwesome 5 */}
      <Path
        fill={color}
        d="m279.786 170.133h-259.57c-17.974 0-26.975-21.732-14.267-34.439l129.785-129.786c7.878-7.878 20.653-7.878 28.532 0l129.784 129.785c12.711 12.707 3.709 34.44-14.264 34.44z"
        rotation={rotationForDirection(direction)}
        // rotate around center of vector icon
        originX={SVG_WIDTH / 2}
        originY={SVG_HEIGHT / 2}
      />
    </Svg>
  );
};
