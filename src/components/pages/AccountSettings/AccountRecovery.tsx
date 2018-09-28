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

interface OwnProps {}

type StateProps = {
  loggedInMember: Member;
  trustedForRecovery: Member;
};

type Props = OwnProps & StateProps;

const AccountRecoveryPageView: React.StatelessComponent<Props> = (
  props: Props
) => {
  const { trustedForRecovery } = props;
  return (
    <ScrollView style={styles.page}>
      <View style={styles.row}>
        <Text>Trusted for account recovery:</Text>
      </View>
      <View style={styles.memberRow}>
        <MemberThumbnail
          style={styles.memberThumbnail}
          member={trustedForRecovery}
        />
        <MemberName member={trustedForRecovery} />
      </View>
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
  return { loggedInMember, trustedForRecovery };
};

export const AccountRecoveryPage = connect(mapStateToProps)(
  AccountRecoveryPageView
);
