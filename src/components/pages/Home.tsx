import * as React from "react";
import { Map } from "immutable";
import { connect, MapStateToProps } from "react-redux";

import { OperationType, Operation } from "@raha/api-shared/models/Operation";
import { MemberId } from "@raha/api-shared/models/identifiers";
import { ActivityFeed } from "../shared/ActivityFeed";
import { Container } from "../shared/elements";
import { RahaState } from '../../store';
import { Member } from '../../store/reducers/members';

function isInviteConfirmed(membersById: Map<MemberId, Member>, memberId: MemberId): boolean {
  const member = membersById.get(memberId);
  return !!member && member.get("inviteConfirmed");
}

function isUnconfirmedRequestInvite(membersById: Map<MemberId, Member>, operation: Operation): boolean {
  if (operation.op_code !== OperationType.REQUEST_INVITE) {
    return false;
  }
  return !isInviteConfirmed(membersById, operation.creator_uid);
}

type StateProps = {
  membersById: Map<MemberId, Member>
}

// Show all operartions that are not mint or unverified request invite videos.
const HomeView: React.StatelessComponent<StateProps> = props => {
  return (
    <Container>
      <ActivityFeed
        filter={operation => operation.op_code !== OperationType.MINT && !isUnconfirmedRequestInvite(props.membersById, operation.creator_uid)}
      />
    </Container>
  );
};

const UnconfirmedView: React.StatelessComponent<StateProps> = props => {
  return (
    <Container>
      <ActivityFeed
        filter={operation => operation.op_code === OperationType.REQUEST_INVITE && !isInviteConfirmed(props.membersById, operation.creator_uid)}
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

export const Home = connect(
  mapStateToProps
)(HomeView);

// TODO show a notification with all Unconfirmed request invite relevant to your account
// TODO show this Unconfirmed page buried somewhere (Account?) where people can view (and perhaps flag) all unconfirmed REQUEST_INVITE if they wish
export const Unconfirmed = connect(
  mapStateToProps
)(UnconfirmedView);
