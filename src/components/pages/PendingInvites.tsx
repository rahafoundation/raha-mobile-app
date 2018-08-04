import * as React from "react";
import { Map } from "immutable";
import { connect, MapStateToProps } from "react-redux";

import { MemberId } from "@raha/api-shared/dist/models/identifiers";
import { ActivityFeed, isUnconfirmedRequestInvite } from "../shared/ActivityFeed";
import { Container } from "../shared/elements";
import { RahaState } from '../../store';
import { Member } from '../../store/reducers/members';

type StateProps = {
  membersById: Map<MemberId, Member>
}

const PendingInvitesView: React.StatelessComponent<StateProps> = props => {
  return (
    <Container>
      <ActivityFeed
        filter={operation => isUnconfirmedRequestInvite(props.membersById, operation)}
      />
    </Container>
  );
};

const mapStateToProps: MapStateToProps<
  StateProps,
  {},
  RahaState
> = state => {
  return { membersById: state.members.byMemberId };
};

// TODO show a notification with all Unconfirmed request invite relevant to your account
// TODO show this Unconfirmed page buried somewhere (Account?) where people can view (and perhaps flag) all unconfirmed REQUEST_INVITE if they wish
export const PendingInvites = connect(
  mapStateToProps
)(PendingInvitesView);
