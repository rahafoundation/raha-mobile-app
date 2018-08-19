import * as React from "react";
import { connect, MapStateToProps } from "react-redux";

import { ActivityFeed } from "../shared/Activity/ActivityFeed";
import { Container } from "../shared/elements";
import { RahaState } from "../../store";
import { Activity } from "../../store/selectors/activities/types";
import { pendingInviteActivities } from "../../store/selectors/activities";

type StateProps = {
  pendingInviteActivities: Activity[];
};

const PendingInvitesView: React.StatelessComponent<StateProps> = ({
  pendingInviteActivities
}) => {
  return (
    <Container>
      <ActivityFeed activities={pendingInviteActivities} />
    </Container>
  );
};

const mapStateToProps: MapStateToProps<StateProps, {}, RahaState> = state => {
  return {
    pendingInviteActivities: pendingInviteActivities(state)
  };
};

export const PendingInvites = connect(mapStateToProps)(PendingInvitesView);
