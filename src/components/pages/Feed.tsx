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
import { addOperationsToActivities } from "../../store/selectors/activities";
import {
  storiesForActivities,
  createStory
} from "../../store/selectors/stories";
import {
  StoryType,
  Story,
  MintBasicIncomeStoryData
} from "../../store/selectors/stories/types";
import {
  OperationType,
  Operation,
  MintType
} from "@raha/api-shared/dist/models/Operation";

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

function isBasicIncomeOp(op: Operation) {
  return (
    op.op_code === OperationType.MINT && op.data.type === MintType.BASIC_INCOME
  );
}

const mapStateToProps: MapStateToProps<StateProps, {}, RahaState> = state => {
  const feedOps = state.operations.filter(
    o => o.op_code !== OperationType.REQUEST_VERIFICATION && !isBasicIncomeOp(o)
  );
  let stories = storiesForActivities(state, addOperationsToActivities(feedOps));
  const lastStory = stories.last();
  if (lastStory) {
    const lastStoryTimestamp = lastStory.timestamp;
    const basicIncomeOpsSinceLast = state.operations.filter(
      o => o.created_at > lastStoryTimestamp && isBasicIncomeOp(o)
    );
    if (basicIncomeOpsSinceLast.size > 0) {
      stories = stories.push(createStory(state, {
        type: StoryType.MINT_BASIC_INCOME,
        activities: addOperationsToActivities(basicIncomeOpsSinceLast).toArray()
      } as MintBasicIncomeStoryData) as Story);
    }
  }
  stories = stories.reverse();
  return { stories };
};

export const Feed = connect(mapStateToProps)(FeedView);
