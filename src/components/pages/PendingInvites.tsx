import * as React from "react";
import { Map } from "immutable";
import { connect, MapStateToProps } from "react-redux";

import { MemberId } from "@raha/api-shared/dist/models/identifiers";
import {
  ActivityFeed,
  isUnconfirmedRequestInvite
} from "../shared/Activity/ActivityFeed";
import { Container } from "../shared/elements";
import { RahaState } from "../../store";
import { Member } from "../../store/reducers/members";

type StateProps = {
  membersById: Map<MemberId, Member>;
};

const PendingInvitesView: React.StatelessComponent<StateProps> = props => {
  return (
    <Container>
      <ActivityFeed
        filter={operation =>
          isUnconfirmedRequestInvite(props.membersById, operation)
        }
      />
    </Container>
  );
};

const mapStateToProps: MapStateToProps<StateProps, {}, RahaState> = state => {
  return { membersById: state.members.byMemberId };
};

export const PendingInvites = connect(mapStateToProps)(PendingInvitesView);
