/**
 * The Feed is a great place for members to catch up on what's happened recently!
 * Shows all of the most recent raha gives and verified join videos.
 * We should add ability to see only transactions of people you trust.
 */
import * as React from "react";
import { View } from "react-native";
import { connect, MapStateToProps } from "react-redux";

import { OperationId } from "@raha/api-shared/dist/models/identifiers";

import { ActivityFeed } from "../shared/Activity/ActivityFeed";
import { RahaState } from "../../store";
import { convertOperationsToActivities } from "../../store/selectors/activities";
import { Activity } from "../../store/selectors/activities/types";
import { colors } from "../../helpers/colors";
import { NavigationScreenProps } from "react-navigation";

type OwnProps = NavigationScreenProps<{
  flagOperationIds: OperationId[];
}>;

interface StateProps {
  activities: Activity[];
}

type Props = OwnProps & StateProps;

const FlagFeedPageView: React.StatelessComponent<Props> = ({ activities }) => {
  return (
    <View style={{ backgroundColor: colors.pageBackground }}>
      <ActivityFeed activities={activities} />
    </View>
  );
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const flagOperationIds = ownProps.navigation.getParam("flagOperationIds");
  if (!flagOperationIds) {
    throw new Error("No flagOperationIds passed to FlagFeed page.");
  }
  return {
    activities: convertOperationsToActivities(
      state,
      state.operations.filter(op => flagOperationIds.includes(op.id))
    )
  };
};

export const FlagFeedPage = connect(mapStateToProps)(FlagFeedPageView);
