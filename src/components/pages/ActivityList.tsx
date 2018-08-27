/**
 * The activity list differs from the Feed in that it displays a custom list of activities
 * that is passed in as a NavigationProp.
 */
import * as React from "react";

import { ActivityFeed } from "../shared/Activity/ActivityFeed";
import { Activity } from "../../store/selectors/activities/types";
import { colors } from "../../helpers/colors";
import { View } from "react-native";
import { NavigationScreenProps } from "react-navigation";

interface NavParams {
  activities: Activity[];
}

type OwnProps = NavigationScreenProps<NavParams>;

export const ActivityList: React.StatelessComponent<OwnProps> = ({
  navigation
}) => {
  return (
    <View style={{ backgroundColor: colors.pageBackground }}>
      <ActivityFeed activities={navigation.getParam("activities")} />
    </View>
  );
};
