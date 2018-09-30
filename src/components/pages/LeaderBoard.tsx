/**
 * A scrolling list of MemberThumbnail, appropriate for viewing groups
 * of members such as everyone trusted by or who trusts a certain person.
 */
import * as React from "react";
import { MapStateToProps, connect } from "react-redux";
import { FlatList, View, Text } from "react-native";

import { Loading } from "../shared/Loading";
import { Member } from "../../store/reducers/members";
import { RahaState } from "../../store";
import { getLoggedInMember } from "../../store/selectors/authentication";
import {
  getMembersSortedByTrust,
  getMembersSortedByVotes,
  getMembersSortedByInvites
} from "../../store/selectors/members";
import { MemberThumbnail } from "../shared/MemberThumbnail";
import { fontSizes } from "../../helpers/fonts";
import { colors } from "../../helpers/colors";

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

type StateProps = {
  membersAndScores: [Member, number][];
  loggedInMember?: Member;
};

type Props = StateProps;

export const LeaderBoardView: React.StatelessComponent<Props> = ({
  loggedInMember,
  membersAndScores
}) => {
  if (!loggedInMember) {
    return <Loading />;
  }

  const ownRank = membersAndScores.findIndex(m => {
    return m[0].get("memberId") === loggedInMember.get("memberId");
  });
  return (
    <View
      style={{
        marginHorizontal: 12
      }}
    >
      <Text
        style={{
          textAlign: "center",
          color: colors.bodyText,
          ...fontSizes.large
        }}
      >
        Your Rank: {ownRank + 1}
      </Text>
      <FlatList
        data={membersAndScores}
        keyExtractor={m => m[0].get("memberId")}
        renderItem={({ item, index }) => {
          const member = item[0];
          return (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginVertical: 4
              }}
            >
              <Text
                style={{ flex: 1, alignSelf: "stretch", ...fontSizes.large }}
              >
                {index + 1}
              </Text>
              <MemberThumbnail member={member} />
              <Text style={{ margin: 8, flex: 6, alignSelf: "stretch" }}>
                {member.get("fullName")}
              </Text>
              <Text style={{ flex: 1, alignSelf: "stretch" }}>{item[1]}</Text>
            </View>
          );
        }}
      />
    </View>
  );
};

// TODO highlight logged in users place on leaderboard, optionally scroll to it
const mapStateToProps: MapStateToProps<StateProps, {}, RahaState> = state => {
  return {
    loggedInMember: getLoggedInMember(state),
    membersAndScores: getMembersSortedByInvites(state)
  };
};

export const LeaderBoard = connect(mapStateToProps)(LeaderBoardView);
