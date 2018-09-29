import * as React from "react";
import { connect, MapStateToProps } from "react-redux";
import { View, ScrollView } from "react-native";

import { Member } from "../../../store/reducers/members";
import { RahaState } from "../../../store";
import { getLoggedInMember } from "../../../store/selectors/authentication";
import { Text } from "../../shared/elements";
import {
  getAncestorsArray,
  getValidMemberById
} from "../../../store/selectors/members";
import { MemberThumbnail } from "../../shared/MemberThumbnail";
import { MemberName } from "../../shared/MemberName";
import { styles } from "./styles";
import { TextLink, LinkType } from "../../shared/elements/TextLink";

interface OwnProps {}

type StateProps = {
  loggedInMember: Member;
  votingDirectlyFor: Member;
};

type Props = OwnProps & StateProps;

const GovernancePageView: React.StatelessComponent<Props> = (props: Props) => {
  const { votingDirectlyFor } = props;
  return (
    <ScrollView style={styles.page}>
      <Text style={styles.row}>Your Raha Parliament vote goes to:</Text>
      <View style={styles.memberRow}>
        <MemberThumbnail
          style={styles.memberThumbnail}
          member={votingDirectlyFor}
        />
        <MemberName member={votingDirectlyFor} />
      </View>
      <Text style={[styles.row]}>
        Learn more about Raha's proposed governance model on our{" "}
        <TextLink
          destination={{
            type: LinkType.Website,
            url: "https://raha.app/why-values/"
          }}
        >
          website
        </TextLink>
        .
      </Text>
      <Text style={[styles.row, styles.comingSoon]}>
        Coming soon - the ability to change your vote.
      </Text>
    </ScrollView>
  );
};

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  RahaState
> = state => {
  const loggedInMember = getLoggedInMember(state);
  if (!loggedInMember) {
    throw Error("Cannot show Account, not logged in");
  }
  const ancestorsArray = getAncestorsArray(
    loggedInMember,
    state.members.byMemberId
  );
  // TODO this should be a set of people you have explicitly trusted to help recover your account
  const trustedForRecoveryIndex = ancestorsArray.length > 1 ? 1 : 0;
  const trustedForRecovery = getValidMemberById(
    state,
    ancestorsArray[trustedForRecoveryIndex]
  );
  // TODO need ability to change your vote, and to view who
  // your vote finally ends up with assuming the member
  // you are directly voting keeps their current preference (and ideally the full chain)
  const votingDirectlyFor = trustedForRecovery;
  // const finalVoteIsfor = getValidMemberById(
  //   state,
  //   ancestorsArray[ancestorsArray.length - 1]
  // );
  return { loggedInMember, votingDirectlyFor };
};

export const GovernancePage = connect(mapStateToProps)(GovernancePageView);
