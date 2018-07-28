/**
 * Show a small thumbail of the member's profile along with their name.
 * TODO: show image instead of random colored background with initials
 */
import * as React from "react";
import { TouchableOpacity, View } from "react-native";
import { withNavigation, NavigationInjectedProps } from "react-navigation";

import {
  getInitialsForName,
  getMemberColor
} from "../../helpers/memberDisplay";
import { Member } from "../../store/reducers/members";
import { Text } from "../shared/elements";
import { RouteName } from "../shared/Navigation";

type Props = {
  member: Member;
  score?: Number;
};

export const MemberThumbnailView: React.StatelessComponent<
  Props & NavigationInjectedProps
> = ({ navigation, member, score }) => {
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
        {getInitialsForName(member.get("fullName"))}
      </Text>
      <View
        style={{
          flex: 1,
          alignSelf: "center"
        }}
      >
        <Text
          style={{
            flex: 0,
            margin: 8
          }}
        >
          {member.get("fullName")}
        </Text>
        {score !== undefined && (
          <Text
            style={{
              flex: 0,
              margin: 8
            }}
          >
            {score}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const MemberThumbnail = withNavigation<Props>(MemberThumbnailView);
