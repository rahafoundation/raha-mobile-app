/**
 * Thumbnail of the member's profile. Always rendered as a circle.
 * TODO: show image instead of random colored background with initials
 */
import * as React from "react";
import {
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  StyleSheet,
  TextStyle
} from "react-native";
import { withNavigation, NavigationInjectedProps } from "react-navigation";

import {
  getInitialsForName,
  getMemberColor
} from "../../helpers/memberDisplay";
import { Member, RAHA_BASIC_INCOME_MEMBER } from "../../store/reducers/members";
import { Text } from "./elements";
import { RouteName } from "./Navigation";
import { colors } from "../../helpers/colors";

type MemberThumbnailProps = {
  member: Member | typeof RAHA_BASIC_INCOME_MEMBER;
  diameter?: number;
  style?: StyleProp<ViewStyle>;
  score?: number; // Currently not used
};

export const MemberThumbnailView: React.StatelessComponent<
  MemberThumbnailProps & NavigationInjectedProps
> = ({ navigation, member, diameter, style }) => {
  const styles = getStyles(diameter ? diameter : 50, member);
  return (
    <TouchableOpacity
      style={[styles.touchableWrapper, style]}
      delayPressIn={20}
      onPress={() => {
        // TODO: navigate somewhere for raha basic income
        if (member === RAHA_BASIC_INCOME_MEMBER) {
          return;
        }
        navigation.push(RouteName.ProfilePage, { member });
      }}
    >
      <Text style={styles.thumbnailText}>
        {member === RAHA_BASIC_INCOME_MEMBER
          ? "R"
          : getInitialsForName(member.get("fullName"))}
      </Text>
    </TouchableOpacity>
  );
};

export const MemberThumbnail = withNavigation<MemberThumbnailProps>(
  MemberThumbnailView
);

const getStyles = (
  diameter: number,
  member: Member | typeof RAHA_BASIC_INCOME_MEMBER
) => {
  const touchableWrapperStyle: ViewStyle = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    width: diameter,
    height: diameter,
    borderRadius: diameter / 2,

    backgroundColor:
      member === RAHA_BASIC_INCOME_MEMBER
        ? colors.brandColor
        : getMemberColor(member),
    overflow: "hidden"
  };

  const thumbnailTextStyle: TextStyle = {
    fontSize: diameter / 3,
    textAlign: "center",
    textAlignVertical: "center"
  };

  return StyleSheet.create({
    touchableWrapper: touchableWrapperStyle,
    thumbnailText: thumbnailTextStyle
  });
};
