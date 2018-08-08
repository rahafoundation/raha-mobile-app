/**
 * The Home Feed is a great place for members to catch up on what's happened recently!
 * Shows all of the most recent raha gives and verified join videos.
 * We should add ability to see only transactions of people you trust.
 */
import * as React from "react";
import { Map } from "immutable";
import { connect, MapStateToProps } from "react-redux";

import { OperationType } from "@raha/api-shared/dist/models/Operation";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";
import {
  ActivityFeed,
  isUnconfirmedRequestInvite
} from "../shared/ActivityFeed";
import { Container } from "../shared/elements";
import { RahaState } from "../../store";
import { Member } from "../../store/reducers/members";

type StateProps = {
  membersById: Map<MemberId, Member>;
};

const HomeView: React.StatelessComponent<StateProps> = props => {
  return (
    <Container>
      <ActivityFeed
        filter={operation =>
          operation.op_code !== OperationType.MINT &&
          operation.op_code !== OperationType.TRUST &&
          !isUnconfirmedRequestInvite(props.membersById, operation)
        }
      />
    </Container>
  );
};

const mapStateToProps: MapStateToProps<StateProps, {}, RahaState> = state => {
  return { membersById: state.members.byMemberId };
};

export const Home = connect(mapStateToProps)(HomeView);
