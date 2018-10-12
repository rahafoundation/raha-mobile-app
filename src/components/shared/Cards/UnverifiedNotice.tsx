import * as React from "react";
import { View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

import { Text } from "../elements";
import { styles } from "./styles";
import { Member } from "../../../store/reducers/members";
import { TextLink, LinkType } from "../elements/TextLink";

interface Props {
  loggedInMember: Member | undefined;
}

export const UnverifiedNotice: React.StatelessComponent<Props> = ({
  loggedInMember
}) => {
  if (!loggedInMember) {
    return null;
  }

  return (
    <View style={[styles.card, styles.alert]}>
      <Icon name="exclamation" size={30} style={styles.cardErrorIcon} />
      <View style={styles.cardBody}>
        <Text>
          Get verified to interact with others in the community and begin
          minting your basic income.
        </Text>
        <Text style={styles.cardBodyAction}>
          Ask a Raha friend for help or email us at{" "}
          <TextLink
            destination={{
              type: LinkType.Website,
              url: "mailto:hello@raha.app"
            }}
          >
            hello@raha.app
          </TextLink>
          !
        </Text>
      </View>
    </View>
  );
};
