/**
 * Swiper
 * Renders a swipable set of screens passed as children,
 * pagination indicators and a button to swipe through screens
 * or to get out of the flow when the last screen is reached.
 *
 * Adapted from https://rationalappdev.com/complete-guide-to-mobile-app-onboarding-with-react-native/
 */

import React, { Component } from "react";
import {
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
  ViewPagerAndroidOnPageScrollEventData
} from "react-native";
import RoundedButton from "./RoundedButton";

// Detect screen width and height
const { width, height } = Dimensions.get("window");

type SwiperProps = {
  navigation: any;
  horizontal: boolean;
  pagingEnabled: boolean;
  showsHorizontalScrollIndicator: boolean;
  showsVerticalScrollIndicator: boolean;
  bounces: boolean;
  scrollsToTop: boolean;
  removeClippedSubviews: boolean;
  automaticallyAdjustContentInsets: boolean;
  index: number;
  children: React.ReactNode[];
};

interface SwiperState {
  isScrolling: boolean;
  offset: number;
  total: number;
  index: number;
  width: number;
  height: number;
  scrollView?: ScrollView;
}

export default class Swiper extends Component<SwiperProps, SwiperState> {
  // Props for ScrollView component
  static defaultProps = {
    horizontal: true,
    pagingEnabled: true,
    showsHorizontalScrollIndicator: false,
    showsVerticalScrollIndicator: false,
    bounces: false,
    scrollsToTop: false,
    removeClippedSubviews: true,
    automaticallyAdjustContentInsets: false,
    index: 0
  };

  state = this.initState(this.props);

  shouldComponentUpdate(
    nextProps: SwiperProps,
    nextState: SwiperState
  ): boolean {
    return (
      this.state.isScrolling !== nextState.isScrolling ||
      this.state.offset !== nextState.offset
    );
  }

  /**
   * Initialize the state
   */
  initState(props: SwiperProps): SwiperState {
    // Get the total number of slides passed as children
    const total = props.children ? props.children.length || 1 : 0,
      // Current index
      index = total > 1 ? Math.min(props.index, total - 1) : 0,
      // Current offset
      offset = width * index;

    const state = {
      total,
      index,
      offset,
      width,
      height,
      isScrolling: false
    };

    return state;
  }

  /**
   * Scroll begin handler
   * @param {object} e native event
   */
  onScrollBegin = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Update internal isScrolling state
    this.setState({ isScrolling: true });
  };

  /**
   * Scroll end handler
   * @param {object} e native event
   */
  onScrollEnd: ScrollViewProps["onMomentumScrollEnd"] = e => {
    if (e === undefined) {
      // maybe freak out?
      return;
    }
    // Update internal isScrolling state
    this.state.isScrolling = false;

    // Update index
    this.updateIndex(
      e.nativeEvent.contentOffset
        ? e.nativeEvent.contentOffset.x
        : // When scrolled with .scrollTo() on Android there is no contentOffset
          e.nativeEvent.position * this.state.width
    );
  };

  /*
     * Drag end handler
     * @param {object} e native event
     */
  onScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {
        contentOffset: { x: newOffset }
      } = e.nativeEvent,
      { children } = this.props,
      { index } = this.state,
      { offset } = this.state;

    // Update internal isScrolling state
    // if swiped right on the last slide
    // or left on the first one
    if (
      offset === newOffset &&
      (index === 0 || index === children.length - 1)
    ) {
      this.setState({
        isScrolling: false
      });
    }
  };

  /**
   * Update index after scroll
   * @param {object} offset content offset
   */
  updateIndex = (offset: number) => {
    const state = this.state,
      diff = offset - this.state.offset,
      step = state.width;
    let index = state.index;

    // Do nothing if offset didn't change
    if (!diff) {
      return;
    }

    // Make sure index is always an integer
    index = index + Math.round(diff / step);

    // Update internal offset
    this.setState({
      offset: offset
    });
    // Update index in the state
    this.setState({
      index
    });
  };

  /**
   * Swipe one slide forward
   */
  swipe = () => {
    // Ignore if already scrolling or if there is less than 2 slides
    if (this.state.isScrolling || this.state.total < 2) {
      return;
    }

    const state = this.state,
      diff = this.state.index + 1,
      x = diff * state.width,
      y = 0;

    // Call scrollTo on scrollView component to perform the swipe
    this.state.scrollView &&
      this.state.scrollView.scrollTo({ x, y, animated: true });

    // Update internal scroll state
    this.setState({
      isScrolling: true
    });

    // Trigger onScrollEnd manually on android
    if (Platform.OS === "android") {
      setImmediate(() => {
        this.onScrollEnd({
          nativeEvent: {
            position: diff
          }
        });
      });
    }
  };

  /**
   * Render ScrollView component
   * @param {array} slides to swipe through
   */
  renderScrollView = (pages: React.ReactNode[]) => {
    return (
      <ScrollView
        ref={component => {
          this.state.scrollView = component;
        }}
        {...this.props}
        contentContainerStyle={[styles.wrapper, this.props.style]}
        onScrollBeginDrag={this.onScrollBegin}
        onMomentumScrollEnd={this.onScrollEnd}
        onScrollEndDrag={this.onScrollEndDrag}
      >
        {pages.map((page, i) => (
          // Render each slide inside a View
          <View style={[styles.fullScreen, styles.slide]} key={i}>
            {page}
          </View>
        ))}
      </ScrollView>
    );
  };

  /**
   * Render pagination indicators
   */
  renderPagination = () => {
    if (this.state.total <= 1) {
      return null;
    }

    const ActiveDot = <View style={[styles.dot, styles.activeDot]} />,
      Dot = <View style={styles.dot} />;

    let dots = [];

    for (let key = 0; key < this.state.total; key++) {
      dots.push(
        key === this.state.index
          ? // Active dot
            React.cloneElement(ActiveDot, { key })
          : // Other dots
            React.cloneElement(Dot, { key })
      );
    }

    return (
      <View pointerEvents="none" style={[styles.pagination, styles.fullScreen]}>
        {dots}
      </View>
    );
  };

  /**
   * Render Continue or Done button
   */
  renderButton = () => {
    const lastScreen = this.state.index === this.state.total - 1;
    return (
      <View
        pointerEvents="box-none"
        style={[styles.buttonWrapper, styles.fullScreen]}
      >
        {lastScreen ? (
          // Show this button on the last screen
          <RoundedButton
            text="Create Video"
            onPress={() => this.props.navigation.navigate()}
          />
        ) : (
          <RoundedButton text="Continue" onPress={() => this.swipe()} />
        )}
      </View>
    );
  };

  /**
   * Render the component
   */
  render({ children } = this.props) {
    return (
      <View style={[styles.container, styles.fullScreen]}>
        {this.renderScrollView(children)}
        {this.renderPagination()}
        {this.renderButton()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fullScreen: {
    width: width,
    height: height
  },
  container: {
    backgroundColor: "transparent",
    position: "relative"
  },
  slide: {
    backgroundColor: "transparent"
  },
  pagination: {
    position: "absolute",
    bottom: 110,
    left: 0,
    right: 0,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    backgroundColor: "transparent"
  },
  dot: {
    backgroundColor: "rgba(0,0,0,.25)",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3
  },
  activeDot: {
    backgroundColor: "#FFFFFF"
  },
  buttonWrapper: {
    backgroundColor: "transparent",
    flexDirection: "column",
    position: "absolute",
    bottom: 0,
    left: 0,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 40,
    justifyContent: "flex-end",
    alignItems: "center"
  }
});
