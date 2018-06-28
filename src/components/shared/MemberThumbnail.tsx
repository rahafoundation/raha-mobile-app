/**
 * Show a small thumbail of the member's profile along with their name.
 * TODO: show image instead of random colored background with initials
 */
import * as React from "react";
import { TouchableOpacity } from "react-native";
import { NavigationScreenProps } from "react-navigation";

import {
  getInitialsForName,
  getMemberColor
} from "../../helpers/memberDisplay";
import { Member } from "../../store/reducers/members";
import { RouteName } from "../shared/Navigation";

import { Text } from "../display/Text";

type Props = NavigationScreenProps<any> & {
  member: Member;
};

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
