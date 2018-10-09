/**
 * The activity list differs from the Feed in that it displays a custom list of activities
 * that is passed in as a NavigationProp.
 */
import * as React from "react";

import { StoryFeed } from "../shared/StoryFeed";
import { Activity } from "../../store/selectors/activities/types";
import { colors } from "../../helpers/colors";
import { View } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { Story } from "../../store/selectors/stories/types";
import { List } from "immutable";

interface NavParams {
  stories: List<Story>;
}

type OwnProps = NavigationScreenProps<NavParams>;

export const StoryList: React.StatelessComponent<OwnProps> = ({
  navigation
}) => {
  return (
    <View style={{ backgroundColor: colors.pageBackground }}>
      <StoryFeed stories={navigation.getParam("stories")} />
    </View>
  );
};
