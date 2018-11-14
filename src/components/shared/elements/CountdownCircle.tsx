/**
 * Circular countdown timer.
 *
 * Adopted from https://github.com/MrToph/react-native-countdown-circle
 */
import React from "react";
import {
  Easing,
  Animated,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from "react-native";

function getInitialState(props: Props) {
  const circleProgress = new Animated.Value(0);
  return {
    circleProgress,
    millisElapsed: 0,
    interpolationValuesHalfCircle1: calcInterpolationValuesForHalfCircle1(
      circleProgress,
      props
    ),
    interpolationValuesHalfCircle2: calcInterpolationValuesForHalfCircle2(
      circleProgress,
      props
    )
  };
}

function calcInterpolationValuesForHalfCircle1(
  animatedValue: Animated.Value,
  { shadowColor }: Props
): HalfCircleValue {
  const rotate = animatedValue.interpolate({
    inputRange: [0, 50, 50, 100],
    outputRange: ["0deg", "180deg", "180deg", "180deg"]
  });

  const backgroundColor = shadowColor;
  return { rotate, backgroundColor };
}

function calcInterpolationValuesForHalfCircle2(
  animatedValue: Animated.Value,
  { color, shadowColor }: Props
): HalfCircleValue {
  const rotate = animatedValue.interpolate({
    inputRange: [0, 50, 50, 100],
    outputRange: ["0deg", "0deg", "180deg", "360deg"]
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 50, 50, 100],
    outputRange: [color, color, shadowColor, shadowColor]
  });
  return { rotate, backgroundColor };
}

type HalfCircleValue = {
  rotate: Animated.AnimatedInterpolation;
  backgroundColor: string | Animated.AnimatedInterpolation;
};

export interface Props {
  millis: number;
  radius: number;
  color: string;
  shadowColor: string;
  bgColor: string;
  borderWidth: number;
  containerStyle?: ViewStyle;
  children?: React.ReactNode;
}

type State = {
  millisElapsed: number;
  circleProgress: Animated.Value;
  interpolationValuesHalfCircle1: HalfCircleValue;
  interpolationValuesHalfCircle2: HalfCircleValue;
};

// TODO: scroll away clears state
export default class CountdownCircle extends React.PureComponent<Props, State> {
  static defaultProps = {
    color: "#f00",
    shadowColor: "#999",
    bgColor: "#e9e9ef",
    borderWidth: 2,
    children: null,
    containerStyle: null
  };

  constructor(props: Props) {
    super(props);
    this.state = getInitialState(props);
    this.startAnimation();
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.millis !== nextProps.millis) {
      this.state.circleProgress.stopAnimation();
      this.setState(getInitialState(nextProps), this.startAnimation);
    }
  }

  pauseAnimation = () => {
    this.state.circleProgress.stopAnimation();
  };

  restartAnimation = () => {
    this.setState(getInitialState(this.props), this.startAnimation);
  };

  startAnimation = () => {
    this.state.circleProgress.stopAnimation();
    Animated.timing(this.state.circleProgress, {
      toValue: 100,
      duration: this.props.millis,
      easing: Easing.linear
    }).start();
  };

  renderHalfCircle({ rotate, backgroundColor }: HalfCircleValue) {
    const { radius } = this.props;

    return (
      <View
        style={[
          styles.leftWrap,
          {
            width: radius,
            height: radius * 2
          }
        ]}
      >
        <Animated.View
          style={[
            styles.halfCircle,
            {
              width: radius,
              height: radius * 2,
              borderRadius: radius,
              backgroundColor,
              transform: [
                { translateX: radius / 2 },
                { rotate },
                { translateX: -radius / 2 }
              ]
            }
          ]}
        />
      </View>
    );
  }

  renderInnerCircle() {
    const radiusMinusBorder = this.props.radius - this.props.borderWidth;
    return (
      <View
        style={[
          styles.innerCircle,
          {
            width: radiusMinusBorder * 2,
            height: radiusMinusBorder * 2,
            borderRadius: radiusMinusBorder,
            backgroundColor: this.props.bgColor,
            ...this.props.containerStyle
          }
        ]}
      >
        {this.props.children}
      </View>
    );
  }

  render() {
    const {
      interpolationValuesHalfCircle1,
      interpolationValuesHalfCircle2
    } = this.state;
    return (
      <View
        style={[
          styles.outerCircle,
          {
            width: this.props.radius * 2,
            height: this.props.radius * 2,
            borderRadius: this.props.radius,
            backgroundColor: this.props.color
          }
        ]}
      >
        {this.renderHalfCircle(interpolationValuesHalfCircle1)}
        {this.renderHalfCircle(interpolationValuesHalfCircle2)}
        {this.renderInnerCircle()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  outerCircle: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e3e3e3"
  },
  innerCircle: {
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff"
  },
  leftWrap: {
    position: "absolute",
    top: 0,
    left: 0
  },
  halfCircle: {
    position: "absolute",
    top: 0,
    left: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: "#f00"
  }
});
