import * as React from "react";
import { View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

import { Text } from "../elements";
import { CardStyles } from "./CardStyles";
import { Member } from "../../../store/reducers/members";
import { TextLink, LinkType } from "../elements/TextLink";
import { RouteName } from "../Navigation";

interface Props {
  loggedInMember: Member | undefined;
}

export const FlaggedNotice: React.StatelessComponent<Props> = ({
  loggedInMember
}) => {
  if (!loggedInMember) {
    return null;
  }

  // if (loggedInMember.get("operationsFlaggingThisMember").size <= 0) {
  //   return null;
  // }

  return (
    <View style={[CardStyles.card, CardStyles.error]}>
      <Icon name="exclamation" size={30} style={CardStyles.cardErrorIcon} />
      <View style={CardStyles.cardBody}>
        <Text>
          You have been restricted from interacting with other members of Raha
          until all flags on your profile are resolved.
        </Text>
        <Text style={CardStyles.cardBodyAction}>
          View{" "}
          <TextLink
            destination={{
              type: LinkType.InApp,
              route: {
                name: RouteName.ProfileTab,
                params: {}
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
