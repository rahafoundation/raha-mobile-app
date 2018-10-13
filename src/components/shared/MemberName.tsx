import * as React from "react";
import { StyleSheet, TextStyle, StyleProp } from "react-native";

import {
  Member as MemberData,
  RAHA_BASIC_INCOME_MEMBER
} from "../../store/reducers/members";
import { Text } from "./elements";
import { RouteName } from "./Navigation";
import { TextLink, LinkType } from "./elements/TextLink";
import { fonts, fontSizes } from "../../helpers/fonts";
import { palette } from "../../helpers/colors";
import { MapStateToProps, connect } from "react-redux";
import { RahaState } from "../../store";
import { getLoggedInMemberId } from "../../store/selectors/authentication";

interface OwnProps {
  member: MemberData | typeof RAHA_BASIC_INCOME_MEMBER;
  style?: StyleProp<TextStyle>;
  hideStatusLabels?: boolean;
  unverifiedLabelStyle?: StyleProp<TextStyle>;
  flaggedLabelStyle?: StyleProp<TextStyle>;
}

interface StateProps {
  isOwnProfile: boolean;
}

type MemberNameProps = OwnProps & StateProps;

const MemberNameComponent: React.StatelessComponent<MemberNameProps> = ({
  isOwnProfile,
  member,
  style,
  hideStatusLabels,
  unverifiedLabelStyle,
  flaggedLabelStyle
}) => {
  // TODO: probably make this a real member
  // TODO: make it navigate somewhere meaningful, maybe info about the basic
  // income
  if (member === RAHA_BASIC_INCOME_MEMBER) {
    return <Text style={[styles.memberName, style]}>Raha Basic Income</Text>;
  }

  const isVerified = member.get("isVerified");
  const operationsFlaggingThisMember = member.get(
    "operationsFlaggingThisMember"
  );

  // TODO: make this touchable to navigate to member
  return (
    <Text>
      <TextLink
        style={[styles.memberName, style]}
        colored={false}
        destination={{
          type: LinkType.InApp,
          route: {
            name: isOwnProfile ? RouteName.ProfileTab : RouteName.ProfilePage,
            params: { member }
          }
        }}
      >
        {member.get("fullName")}
      </TextLink>
      {hideStatusLabels || operationsFlaggingThisMember.isEmpty() ? null : (
        <Text style={[styles.flaggedLabel, flaggedLabelStyle]}> (Flagged)</Text>
      )}
      {hideStatusLabels || isVerified ? null : (
        <Text style={[styles.unverifiedLabel, unverifiedLabelStyle]}>
          {" "}
          (Unverified)
        </Text>
      )}
    </Text>
  );
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const { member } = ownProps;
  const loggedInMemberId = getLoggedInMemberId(state);
  return {
    isOwnProfile:
      member === RAHA_BASIC_INCOME_MEMBER
        ? false
        : member.get("memberId") === loggedInMemberId
  };
};

export const MemberName = connect(mapStateToProps)(MemberNameComponent);

const memberName: TextStyle = {
  ...fonts.Lato.Bold,
  ...fontSizes.medium
};

const unverifiedLabel: TextStyle = {
  ...fonts.Lato.Normal,
  ...fontSizes.medium,
  color: palette.purple
};

const flaggedLabel: TextStyle = {
  ...fonts.Lato.Normal,
  ...fontSizes.medium,
  color: palette.red
};

const styles = StyleSheet.create({
  memberName,
  unverifiedLabel,
  flaggedLabel
});
