/**
 * A scrolling list of MemberThumbnail, appropriate for viewing groups
 * of members such as everyone trusted by or who trusts a certain person.
 */
import * as React from "react";
import { MapStateToProps, connect } from "react-redux";
import { NavigationScreenProps } from "react-navigation";
import { FlatList } from "react-native";

import { MemberId } from "@raha/api-shared/models/identifiers";

import { Member } from "../../store/reducers/members";
import { RahaState } from "../../store";
import { getMembersByIds } from "../../store/selectors/members";
import { MemberThumbnail } from "../shared/MemberThumbnail";
import { Container } from "../shared/elements";

interface NavParams {
  memberIds: MemberId[];
}

type OwnProps = NavigationScreenProps<NavParams>;

type StateProps = {
  members: Member[];
};

type Props = OwnProps & StateProps;

export const MemberListView: React.StatelessComponent<Props> = ({
  navigation,
  members
}) => {
  return (
    <Container>
      <FlatList
        data={members}
        keyExtractor={m => m.memberId}
        renderItem={m => (
          <MemberThumbnail member={m.item} />
        )}
      />
    </Container>
  );
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  props
) => {
  const members = getMembersByIds(
    state,
    props.navigation.getParam("memberIds", [])
  );
  return {
    members: members.filter(x => x !== undefined) as Member[]
  };
};

export const MemberList = connect(mapStateToProps)(MemberListView);
