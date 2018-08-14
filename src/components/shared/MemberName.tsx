import * as React from "react";
import {
  StyleSheet,
  TextStyle,
  TextProps,
  TouchableOpacity
} from "react-native";
import { withNavigation, NavigationInjectedProps } from "react-navigation";

import {
  Member as MemberData,
  RAHA_BASIC_INCOME_MEMBER
} from "../../store/reducers/members";
import { Text } from "./elements";
import { RouteName } from "./Navigation";
import { TextLink } from "./elements/TextLink";

interface OwnProps {
  member: MemberData | typeof RAHA_BASIC_INCOME_MEMBER;
  textStyle?: TextProps["style"];
}
type MemberNameProps = OwnProps & NavigationInjectedProps;

export const MemberNameView: React.StatelessComponent<MemberNameProps> = ({
  member,
  textStyle,
  navigation
}) => {
  // TODO: probably make this a real member
  // TODO: make it navigate somewhere meaningful, maybe info about the basic
  // income
  if (member === RAHA_BASIC_INCOME_MEMBER) {
    return (
      <Text style={[styles.memberName, textStyle]}>Raha Basic Income</Text>
    );
  }

  // TODO: make this touchable to navigate to member
  return (
    <TextLink
      textStyle={[styles.memberName, textStyle]}
      destination={{
        routeName: RouteName.Profile,
        params: { member }
      }}
    >
      {member.get("fullName")}
    </TextLink>
  );
};

export const MemberName = withNavigation(MemberNameView);

const memberName: TextStyle = {
  fontWeight: "700"
};

const styles = StyleSheet.create({
  memberName
});
