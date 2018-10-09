/**
 * The Feed is a great place for members to catch up on what's happened recently!
 * Shows all of the most recent raha gives and verified join videos.
 * We should add ability to see only transactions of people you trust.
 */
import * as React from "react";
import { connect, MapStateToProps } from "react-redux";
import { List } from "immutable";
import { NavigationScreenProps } from "react-navigation";

import { StoryFeed } from "../shared/StoryFeed";
import { RahaState } from "../../store";
import { colors } from "../../helpers/colors";
import { View } from "react-native";
import { allActivities } from "../../store/selectors/activities";
import {
  storiesForActivities,
  bundleMintBasicIncomeStories
} from "../../store/selectors/stories";
import { StoryType, Story } from "../../store/selectors/stories/types";

type StateProps = {
  stories: List<Story>;
};

interface NavParams {
  pageReset?: () => void;
}

type FeedProps = NavigationScreenProps<NavParams> & StateProps;

export class FeedView extends React.Component<FeedProps> {
  private storyFeed: StoryFeed | null = null;

  componentDidMount() {
    if (this.storyFeed) {
      this.props.navigation.setParams({
        pageReset: this.storyFeed.pageUp
      });
    }
  }

  render() {
    return (
      <View style={{ backgroundColor: colors.pageBackground }}>
        <StoryFeed
          ref={ref => (this.storyFeed = ref)}
          stories={this.props.stories}
        />
      </View>
    );
  }
}

const mapStateToProps: MapStateToProps<StateProps, {}, RahaState> = state => {
  return {
    stories: bundleMintBasicIncomeStories(
      state,
      storiesForActivities(state, allActivities(state))
    )
      .filter(story => story.storyData.type !== StoryType.REQUEST_VERIFICATION)
      .reverse()
  };
};

export const Feed = connect(mapStateToProps)(FeedView);
