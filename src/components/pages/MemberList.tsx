/**
 * A scrolling list of MemberThumbnail, appropriate for viewing groups
 * of members such as everyone trusted by or who trusts a certain person.
 */
import * as React from "react";
import { MapStateToProps, connect } from "react-redux";
import { NavigationScreenProps } from "react-navigation";
import { FlatList, View, StyleSheet, ViewStyle, TextStyle } from "react-native";

import { MemberId } from "@raha/api-shared/dist/models/identifiers";

import { Member } from "../../store/reducers/members";
import { RahaState } from "../../store";
import { getMembersByIds } from "../../store/selectors/members";
import { MemberThumbnail } from "../shared/MemberThumbnail";
import { MemberName } from "../shared/MemberName";

interface NavParams {
  memberIds: MemberId[];
}

type OwnProps = NavigationScreenProps<NavParams>;

type StateProps = {
  members: Member[];
};

type Props = OwnProps & StateProps;

export const MemberListView: React.StatelessComponent<Props> = ({
  members
}) => {
  return (
    <View>
      <FlatList
        data={members}
        keyExtractor={m => m.get("memberId")}
        renderItem={m => (
          <View style={styles.memberEntry}>
            <MemberThumbnail style={styles.memberThumbnail} member={m.item} />
            <MemberName member={m.item} />
          </View>
        )}
      />
    </View>
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

const memberEntryStyle: ViewStyle = {

  flexDirection: "row",
  justifyContent: "flex-start",
  alignItems: "center",
  marginTop: 12,
  marginLeft: 12
};

const memberThumbnailStyle: ViewStyle = {
  marginRight: 12
};

const styles = StyleSheet.create({
  memberEntry: memberEntryStyle,
  memberThumbnail: memberThumbnailStyle
});

export const MemberList = connect(mapStateToProps)(MemberListView);
