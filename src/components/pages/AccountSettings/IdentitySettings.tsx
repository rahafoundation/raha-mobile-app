import * as React from "react";
import { MapStateToProps, connect } from "react-redux";
import { RahaState } from "../../../store";
import { Member } from "../../../store/reducers/members";
import { getLoggedInMember } from "../../../store/selectors/authentication";
import { KeyboardAwareScrollContainer } from "../../shared/elements/KeyboardAwareScrollContainer";
import { Text } from "../../shared/elements";
import { Loading } from "../../shared/Loading";
import { styles } from "./styles";

interface OwnProps {}

interface StateProps {
  loggedInMember?: Member;
}

type Props = OwnProps & StateProps;

class IdentitySettingsPageView extends React.Component<Props> {
  render() {
    const { loggedInMember } = this.props;
    if (!loggedInMember) {
      return <Loading />;
    }

    return (
      <KeyboardAwareScrollContainer style={styles.page}>
        <Text>Update your identity information</Text>
        <Text>Profile picture</Text>
        <Text>Identity video</Text>
        <Text>Full name</Text>
        <Text>{loggedInMember.get("fullName")}</Text>
      </KeyboardAwareScrollContainer>
    );
  }
}

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  RahaState
> = state => {
  return {
    loggedInMember: getLoggedInMember(state)
  };
};

export const IdentitySettingsPage = connect(mapStateToProps)(
  IdentitySettingsPageView
);
