/**
 * The Feed is a great place for members to catch up on what's happened recently!
 * Shows all of the most recent raha gives and verified join videos.
 * We should add ability to see only transactions of people you trust.
 */
import * as React from "react";
import { connect, MapStateToProps } from "react-redux";

import { ActivityFeed } from "../shared/Activity/ActivityFeed";
import { RahaState } from "../../store";
import { activities } from "../../store/selectors/activities";
import { Activity } from "../../store/selectors/activities/types";
import { colors } from "../../helpers/colors";
import { View } from "react-native";
import { OperationType } from "@raha/api-shared/dist/models/Operation";
import { NavigationScreenProps } from "react-navigation";

type StateProps = {
  activities: Activity[];
};

interface NavParams {
  pageReset?: () => void;
}

type FeedProps = NavigationScreenProps<NavParams> & StateProps;

export class FeedView extends React.Component<FeedProps> {
  private activityFeed: ActivityFeed | null = null;

  componentDidMount() {
    if (this.activityFeed) {
      this.props.navigation.setParams({
        pageReset: this.activityFeed.pageUp
      });
    }
  }

  render() {
    return (
      <View style={{ backgroundColor: colors.pageBackground }}>
        <ActivityFeed
          ref={ref => (this.activityFeed = ref)}
          activities={this.props.activities}
        />
      </View>
    );
  }
}

const mapStateToProps: MapStateToProps<StateProps, {}, RahaState> = state => {
  return {
    activities: activities(
      state,
      operation => operation.op_code !== OperationType.REQUEST_VERIFICATION
    )
  };
};

export const Feed = connect(mapStateToProps)(FeedView);
