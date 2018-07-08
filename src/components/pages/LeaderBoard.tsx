/**
 * A scrolling list of MemberThumbnail, appropriate for viewing groups
 * of members such as everyone trusted by or who trusts a certain person.
 */
import * as React from "react";
import { MapStateToProps, connect } from "react-redux";
import { NavigationScreenProps } from "react-navigation";
import { FlatList } from "react-native";

import { Member } from "../../store/reducers/members";
import { RahaState } from "../../store";
import {
  getMembersSortedByTrust,
  getMembersSortedByVotes,
  getMembersSortedByInvites
} from "../../store/selectors/members";
import { MemberThumbnail } from "../shared/MemberThumbnail";
import { MemberId } from "../../identifiers";
import { Container } from "../shared/elements";

enum LeaderBoardTypes {
  Trust = "Trust",
  Inviters = "Inviters",
  Votes = "Votes"
}

// TODO use below, support multiple leaderboard types
const LeaderBoardConfig = {
  Trust: {
    title: "Most Trusted",
    body: "Leaderboard of members trusted by the most people",
    fn: getMembersSortedByTrust
  },
  Inviters: {
    title: "Invite Champions!",
    body:
      "Leaderboard for members who have championed the Raha movement by inviting the most people",
    fn: getMembersSortedByInvites
  },
  Votes: {
    title: "Raha Parliament Votes",
    body: "Number of votes receieved in the Raha Delegative Democracy",
    fn: getMembersSortedByVotes
  }
};

interface NavParams {
  memberIds: MemberId[];
}

type OwnProps = NavigationScreenProps<NavParams>;

type StateProps = {
  membersAndScores: [Member, number][];
};

type Props = OwnProps & StateProps;

export const LeaderBoardView: React.StatelessComponent<Props> = ({
  navigation,
  membersAndScores
}) => {
  return (
    <Container>
      <FlatList
        data={membersAndScores}
        keyExtractor={m => m[0].memberId}
        renderItem={m => (
          <MemberThumbnail
            navigation={navigation}
            member={m.item[0]}
            score={m.item[1]}
          />
        )}
      />
    </Container>
  );
};

// TODO highlight logged in users place on leaderboard, optionally scroll to it
const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  props
) => {
  return {
    membersAndScores: getMembersSortedByInvites(state)
  };
};

export const LeaderBoard = connect(mapStateToProps)(LeaderBoardView);
