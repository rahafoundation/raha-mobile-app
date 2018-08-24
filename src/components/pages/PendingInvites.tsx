import * as React from "react";
import { connect, MapStateToProps } from "react-redux";

import { ActivityFeed } from "../shared/Activity/ActivityFeed";
import { RahaState } from "../../store";
import { Activity } from "../../store/selectors/activities/types";
import { pendingInviteActivities } from "../../store/selectors/activities";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../helpers/colors";

type StateProps = {
  pendingInviteActivities: Activity[];
};

const PendingInvitesView: React.StatelessComponent<StateProps> = ({
  pendingInviteActivities
}) => {
  return (
    <View style={styles.page}>
      <ActivityFeed activities={pendingInviteActivities} />
    </View>
  );
};

const mapStateToProps: MapStateToProps<StateProps, {}, RahaState> = state => {
  return {
    pendingInviteActivities: pendingInviteActivities(state)
  };
};

export const PendingInvites = connect(mapStateToProps)(PendingInvitesView);

const pageStyle: ViewStyle = {
  backgroundColor: colors.pageBackground
};
const styles = StyleSheet.create({
  page: pageStyle
});
