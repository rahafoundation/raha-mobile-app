import * as React from "react";
import { Map } from "immutable";
import { connect, MapStateToProps } from "react-redux";

import { OperationType } from "@raha/api-shared/dist/models/Operation";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";
import { ActivityFeed, isUnconfirmedRequestInvite } from "../shared/ActivityFeed";
import { Container } from "../shared/elements";
import { RahaState } from '../../store';
import { Member } from '../../store/reducers/members';

type StateProps = {
  membersById: Map<MemberId, Member>
}

// Show all operartions that are not mint or unverified request invite videos.
const HomeView: React.StatelessComponent<StateProps> = props => {
  return (
    <Container>
      <ActivityFeed
        filter={
          operation => operation.op_code !== OperationType.MINT
          && operation.op_code !== OperationType.TRUST
          && !isUnconfirmedRequestInvite(props.membersById, operation)
        }
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
