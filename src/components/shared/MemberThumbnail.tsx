/**
 * Show a small thumbail of the member's profile along with their name.
 * TODO: show image instead of random colored background with initials
 */
import * as React from "react";
import {
  FlatList,
  View,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";
import { Member } from "../../store/reducers/members";
import { RouteName } from "../shared/Navigation";
import { NavigationScreenProps } from "react-navigation";

type Props = NavigationScreenProps<{}> & {
  member: Member;
};

function getInitialsForName(name: string): string {
  const initials = name.split(" ").map(part => part.charAt(0).toUpperCase());
  return initials[0] + initials[initials.length - 1];
}

function getMemberColor(member: Member) {
  const hue =
    member.memberId
      .split("")
      .map(x => x.charCodeAt(0))
      .reduce((a, b) => a + b, 0) % 360;
  return `hsl(${hue}, 100%, 80%)`;
}

export const MemberThumbnail: React.StatelessComponent<Props> = ({
  navigation,
  member
}) => {
  return (
    <TouchableOpacity
      style={{ height: 75, flex: 1, flexDirection: "row" }}
      delayPressIn={20}
      onPress={() => navigation.push(RouteName.Profile, { member })}
    >
      <Text
        style={{
          backgroundColor: getMemberColor(member),
          fontSize: 30,
          textAlign: "center",
          textAlignVertical: "center",
          height: 75,
          width: 75
        }}
      >
        {getInitialsForName(member.fullName)}
      </Text>
      <Text
        style={{
          height: 75,
          flex: 1
        }}
      >
        {member.fullName}
      </Text>
    </TouchableOpacity>
  );
};
