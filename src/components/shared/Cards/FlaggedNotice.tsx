import * as React from "react";
import { View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { connect, MapStateToProps } from "react-redux";

import { Text } from "../elements";
import { CardStyles } from "./CardStyles";
import { Member } from "../../../store/reducers/members";
import { TextLink, LinkType } from "../elements/TextLink";
import { RouteName } from "../navigation";
import { RahaState } from "../../../store";
import { getLoggedInMember } from "../../../store/selectors/authentication";

interface OwnProps {
  restrictedFrom: string;
}

interface StateProps {
  loggedInMember?: Member;
}

type Props = OwnProps & StateProps;

const FlaggedNoticeComponent: React.StatelessComponent<Props> = ({
  loggedInMember,
  restrictedFrom
}) => {
  if (!loggedInMember) {
    return null;
  }

  if (loggedInMember.get("operationsFlaggingThisMember").size <= 0) {
    return null;
  }

  return (
    <View style={[CardStyles.card, CardStyles.error]}>
      <Icon name="exclamation" size={30} style={CardStyles.cardErrorIcon} />
      <View style={CardStyles.cardBody}>
        <Text>
          You have been restricted from {restrictedFrom} until all flags on your
          profile are resolved.
        </Text>
        <Text style={CardStyles.cardBodyAction}>
          View{" "}
          <TextLink
            destination={{
              type: LinkType.InApp,
              route: {
                name: RouteName.ProfilePage,
                params: { member: loggedInMember }
              }
            }}
          >
            your profile.
          </TextLink>
        </Text>
      </View>
    </View>
  );
};

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  RahaState
> = state => ({
  loggedInMember: getLoggedInMember(state)
});

export const FlaggedNotice = connect(mapStateToProps)(FlaggedNoticeComponent);
