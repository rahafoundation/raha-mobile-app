import * as React from "react";
import { StyleSheet, TextStyle, TextProps, StyleProp } from "react-native";

import {
  Member as MemberData,
  RAHA_BASIC_INCOME_MEMBER
} from "../../store/reducers/members";
import { Text } from "./elements";
import { RouteName } from "./Navigation";
import { TextLink, LinkType } from "./elements/TextLink";
import { fonts, fontSizes } from "../../helpers/fonts";

interface OwnProps {
  member: MemberData | typeof RAHA_BASIC_INCOME_MEMBER;
  style?: StyleProp<TextStyle>;
}
type MemberNameProps = OwnProps;

export const MemberName: React.StatelessComponent<MemberNameProps> = ({
  member,
  style
}) => {
  // TODO: probably make this a real member
  // TODO: make it navigate somewhere meaningful, maybe info about the basic
  // income
  if (member === RAHA_BASIC_INCOME_MEMBER) {
    return <Text style={[styles.memberName, style]}>Raha Basic Income</Text>;
  }

  // TODO: make this touchable to navigate to member
  return (
    <TextLink
      style={[styles.memberName, style]}
      destination={{
        type: LinkType.InApp,
        route: {
          name: RouteName.ProfilePage,
          params: { member }
        }
      }}
    >
      {member.get("fullName")}
    </TextLink>
  );
};

const memberName: TextStyle = {
  ...fonts.Lato.Bold,
  ...fontSizes.medium
};

const styles = StyleSheet.create({
  memberName
});
