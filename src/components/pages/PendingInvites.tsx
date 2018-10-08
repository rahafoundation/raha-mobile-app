import * as React from "react";
import { connect, MapStateToProps } from "react-redux";

import { StoryFeed } from "../shared/StoryFeed";
import { RahaState } from "../../store";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../helpers/colors";
import { unverifiedCreateMemberActivities } from "../../store/selectors/activities";
import { Story } from "../../store/selectors/stories/types";
import { List } from "immutable";
import { storiesForActivities } from "../../store/selectors/stories";

type StateProps = {
  unverifiedCreateMemberStories: List<Story>;
};

const PendingInvitesView: React.StatelessComponent<StateProps> = ({
  unverifiedCreateMemberStories
}) => {
  return (
    <View style={styles.page}>
      <StoryFeed stories={unverifiedCreateMemberStories} />
    </View>
  );
};

const mapStateToProps: MapStateToProps<StateProps, {}, RahaState> = state => {
  return {
    unverifiedCreateMemberStories: storiesForActivities(
      state,
      unverifiedCreateMemberActivities(state)
    )
  };
};

export const PendingInvites = connect(mapStateToProps)(PendingInvitesView);

const pageStyle: ViewStyle = {
  backgroundColor: colors.pageBackground
};
const styles = StyleSheet.create({
  page: pageStyle
});
