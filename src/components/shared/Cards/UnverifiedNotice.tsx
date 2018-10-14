import * as React from "react";
import { View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { connect, MapStateToProps } from "react-redux";

import { Text } from "../elements";
import { CardStyles } from "./CardStyles";
import { Member } from "../../../store/reducers/members";
import { TextLink, LinkType } from "../elements/TextLink";
import { RahaState } from "../../../store";
import { getLoggedInMember } from "../../../store/selectors/authentication";

interface OwnProps {}

interface StateProps {
  loggedInMember?: Member;
}

type Props = OwnProps & StateProps;

const UnverifiedNoticeComponent: React.StatelessComponent<Props> = ({
  loggedInMember
}) => {
  if (!loggedInMember) {
    return null;
  }

  if (loggedInMember.get("verifiedBy").size > 0) {
    return null;
  }

  return (
    <View style={[CardStyles.card, CardStyles.alert]}>
      <Icon name="exclamation" size={30} style={CardStyles.cardInfoIcon} />
      <View style={CardStyles.cardBody}>
        <Text>
          Get verified to interact with others in the community and begin
          minting your basic income.
        </Text>
        <Text style={CardStyles.cardBodyAction}>
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

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  RahaState
> = state => ({
  loggedInMember: getLoggedInMember(state)
});

export const UnverifiedNotice = connect(mapStateToProps)(
  UnverifiedNoticeComponent
);
