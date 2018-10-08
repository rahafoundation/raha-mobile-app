/**
 * The Feed is a great place for members to catch up on what's happened recently!
 * Shows all of the most recent raha gives and verified join videos.
 * We should add ability to see only transactions of people you trust.
 */
import * as React from "react";
import { connect, MapStateToProps } from "react-redux";

import { StoryFeed } from "../shared/StoryFeed";
import { RahaState } from "../../store";
import { Activity } from "../../store/selectors/activities/types";
import { colors } from "../../helpers/colors";
import { View } from "react-native";
import { OperationType } from "@raha/api-shared/dist/models/Operation";
import { allActivities } from "../../store/selectors/activities";
import {
  storiesForActivities,
  bundleMintBasicIncomeStories
} from "../../store/selectors/stories";
import { StoryType, Story } from "../../store/selectors/stories/types";
import { List } from "immutable";

type StateProps = {
  stories: List<Story>;
};

const FeedView: React.StatelessComponent<StateProps> = ({ stories }) => {
  return (
    <View style={{ backgroundColor: colors.pageBackground }}>
      <StoryFeed stories={stories} />
    </View>
  );
};

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
