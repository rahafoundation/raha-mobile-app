/**
 * Thumbnail of the member's profile. Always rendered as a circle.
 * TODO: show image instead of random colored background with initials
 */
import * as React from "react";
import { TouchableOpacity, View } from "react-native";
import { withNavigation, NavigationInjectedProps } from "react-navigation";

import {
  getInitialsForName,
  getMemberColor
} from "../../helpers/memberDisplay";
import { Member, RAHA_BASIC_INCOME_MEMBER } from "../../store/reducers/members";
import { Text } from "./elements";
import { RouteName } from "./Navigation";
import { colors } from "../../helpers/colors";

type Props = {
  member: Member | typeof RAHA_BASIC_INCOME_MEMBER;
  diameter?: number;
  score?: number;
};

export const MemberThumbnailView: React.StatelessComponent<
  Props & NavigationInjectedProps
> = ({ navigation, member, diameter }) => {
  const thumbDiameter = diameter ? diameter : 50;
  return (
    <TouchableOpacity
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        width: thumbDiameter,
        height: thumbDiameter,

        backgroundColor:
          member === RAHA_BASIC_INCOME_MEMBER
            ? colors.brandColor
            : getMemberColor(member),
        borderRadius: thumbDiameter / 2,
        overflow: "hidden"
      }}
      delayPressIn={20}
      onPress={() => {
        // TODO: navigate somewhere for raha basic income
        if (member === RAHA_BASIC_INCOME_MEMBER) {
          return;
        }
        navigation.push(RouteName.ProfilePage, { member });
      }}
    >
      <Text
        style={{
          fontSize: thumbDiameter / 3,
          textAlign: "center",
          textAlignVertical: "center"
        }}
      >
        {member === RAHA_BASIC_INCOME_MEMBER
          ? "R"
          : getInitialsForName(member.get("fullName"))}
      </Text>
    </TouchableOpacity>
  );
};

export const MemberThumbnail = withNavigation<Props>(MemberThumbnailView);
