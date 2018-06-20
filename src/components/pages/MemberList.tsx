/**
 * A scrolling list of MemberThumbnail, appropriate for viewing groups
 * of members such as everyone trusted by or who trusts a certain person.
 */
import * as React from "react";
import { FlatList } from "react-native";
import { Member } from "../../store/reducers/members";
import { RahaState } from "../../store";
import { getMembersByIds } from "../../store/selectors/members";
import { MemberThumbnail } from "../shared/MemberThumbnail";
import { MapStateToProps, connect } from "react-redux";

type OwnProps = {
  navigation: any;
};

type StateProps = {
  members: Member[];
};

type Props = OwnProps & StateProps;

function getInitialsForName(name: string): string {
  const initials = name.split(" ").map(part => part.charAt(0).toUpperCase());
  return initials[0] + initials[initials.length - 1];
}

export const MemberListView: React.StatelessComponent<Props> = ({
  navigation,
  members
}) => {
  return (
    <FlatList
      data={members}
      keyExtractor={m => m.memberId}
      renderItem={m => (
        <MemberThumbnail navigation={navigation} member={m.item} />
      )}
    />
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
