import * as React from "react";
import { connect, MapStateToProps } from "react-redux";

import { ActivityFeed } from "../shared/Activity/ActivityFeed";
import { RahaState } from "../../store";
import { Activity } from "../../store/selectors/activities/types";
import { pendingInviteActivities } from "../../store/selectors/activities";
import { View } from "react-native";

type StateProps = {
  pendingInviteActivities: Activity[];
};

const PendingInvitesView: React.StatelessComponent<StateProps> = ({
  pendingInviteActivities
}) => {
  return (
    <View>
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
