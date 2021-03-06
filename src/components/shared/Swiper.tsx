/**
 * Swiper
 * Renders a swipable set of screens passed as children and pagination indicators.
 * Adapted from https://rationalappdev.com/complete-guide-to-mobile-app-onboarding-with-react-native/
 */

import React, { Component } from "react";
import {
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View
} from "react-native";
import { range } from "../../helpers/math";
import { Button } from "./elements";
import { palette } from "../../helpers/colors";

// Detect screen width
const { width } = Dimensions.get("window");

type SwiperProps = {
  // Arrange screens horizontally
  horizontal?: boolean;
  // Scroll exactly to the next screen, instead of continous scrolling
  pagingEnabled?: boolean;
  // Shows horizontal scroll indicators
  showsHorizontalScrollIndicator?: boolean;
  // Shows vertical scroll indicators
  showsVerticalScrollIndicator?: boolean;
  // Bounces when the end is reached
  bounces?: boolean;
  // Scrolls to the top when the status bar is tapped
  scrollsToTop?: boolean;
  // Removes offscreen child views
  removeClippedSubviews?: boolean;
  // Adjusts content behind nav-, tab- or toolbars automatically
  automaticallyAdjustContentInsets?: boolean;
  // Sets the index of the first screen
  index?: number;
  // Sets the slides
  children: Element[];
  // Sets button props
  buttonOnPress?: () => void;
  buttonTitle?: string;
};

interface SwiperState {
  isScrolling: boolean;
  offset: number;
  total: number;
  index: number;
  width: number;
}

export class Swiper extends Component<SwiperProps, SwiperState> {
  private scrollView?: ScrollView | null;

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
    const total = props.children ? props.children.length || 1 : 0;
    // Current index
    const index =
      total > 1 ? Math.min(props.index ? props.index : 0, total - 1) : 0;
    // Current offset
    const offset = width * index;

    const state = {
      total,
      index,
      offset,
      width,
      isScrolling: false
    };

    return state;
  }

  /**
   * Scroll begin handler
   * @param {object} e native event
   */
  onScrollBegin: ScrollViewProps["onScrollBeginDrag"] = (
    event?: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (!event) {
      // TODO: what does this case even mean? read react-native docs
      return;
    }
    // Update internal isScrolling state
    this.setState({ isScrolling: true });
  };

  /**
   * Scroll end handler
   */
  onScrollEnd: ScrollViewProps["onMomentumScrollEnd"] = event => {
    if (!event) {
      // TODO: what does this case even mean? read react-native docs
      return;
    }
    // Update internal isScrolling state
    this.state.isScrolling = false;

    // Update index
    this.updateIndex(
      event.nativeEvent.contentOffset
        ? event.nativeEvent.contentOffset.x
        : this.state.offset
      // TODO: When scrolled with .scrollTo() on Android there is no contentOffset
      // event.nativeEvent.position * this.state.width
    );
  };

  /*
     * Drag end handler
     */
  onScrollEndDrag: ScrollViewProps["onScrollEndDrag"] = event => {
    if (!event) {
      // TODO: what does this case even mean? read react-native docs
      return;
    }
    const {
      contentOffset: { x: newOffset }
    } = event.nativeEvent;
    const { children } = this.props;
    const { index } = this.state;
    const { offset } = this.state;

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
    if (this.state.isScrolling || this.state.total < 2) {
      return;
    }

    const state = this.state,
      diff = this.state.index + 1,
      x = diff * state.width,
      y = 0;

    // Call scrollTo on scrollView component to perform the swipe
    this.scrollView && this.scrollView.scrollTo({ x, y, animated: true });

    // Update internal scroll state
    this.setState({
      isScrolling: true
    });

    // Trigger onScrollEnd manually on android
    // TODO: Revisit for Android https://github.com/facebook/react-native/issues/11693
    // if (Platform.OS === "android") {
    //   setImmediate(() => {
    //     this.onScrollEnd({
    //       nativeEvent: {
    //         position: diff
    //       }
    //     });
    //   });
    // }
  };

  /**
   * Render ScrollView component
   * @param {array} slides to swipe through
   */
  renderScrollView = (pages: React.ReactNode[]) => {
    return (
      <ScrollView
        style={styles.scrollView}
        ref={component => {
          this.scrollView = component;
        }}
        {...this.props}
        onScrollBeginDrag={this.onScrollBegin}
        onMomentumScrollEnd={this.onScrollEnd}
        onScrollEndDrag={this.onScrollEndDrag}
      >
        {pages.map((page, i) => (
          // Render each slide inside a View
          <View style={styles.slide} key={i}>
            <ScrollView
              style={styles.slideScrollView}
              contentContainerStyle={styles.slideScrollView}
            >
              {page}
            </ScrollView>
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

    const dots = range(this.state.total).map((index: number) => {
      const appliedStyles = [
        styles.dot,
        ...(index === this.state.index ? [styles.activeDot] : [])
      ];
      return <View key={index} style={appliedStyles} />;
    });

    return (
      <View pointerEvents="none" style={styles.pagination}>
        {dots}
      </View>
    );
  };

  /**
   * Render the component
   */
  render() {
    return (
      <View style={styles.container}>
        {this.renderScrollView(this.props.children)}
        {this.renderPagination()}
        {this.props.buttonTitle &&
          this.props.buttonOnPress && (
            <Button
              style={styles.button}
              title={this.props.buttonTitle}
              onPress={this.props.buttonOnPress}
            />
          )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    width: "100%"
  },
  scrollView: {
    flex: 1
  },
  container: {
    width: width,
    height: "100%"
  },
  slide: {
    flex: 1,
    width: width
  },
  slideScrollView: {
    flexGrow: 1
  },
  pagination: {
    height: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.black
  },
  dot: {
    backgroundColor: palette.mediumGray,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3
  },
  activeDot: {
    backgroundColor: palette.white
  }
});
