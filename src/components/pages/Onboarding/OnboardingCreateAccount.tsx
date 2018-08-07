import * as React from "react";
import { View, StyleSheet, Linking, Dimensions } from "react-native";
import { connect, MapStateToProps } from "react-redux";

import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";

import { getUsername } from "../../../helpers/username";
import { RahaState } from "../../../store";
import {
  requestInviteFromMember,
  createMember
} from "../../../store/actions/members";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../../store/reducers/apiCalls";
import { Member } from "../../../store/reducers/members";
import { getStatusOfApiCall } from "../../../store/selectors/apiCalls";
import { Text, Button } from "../../shared/elements";
import { colors } from "../../../helpers/colors";

type ReduxStateProps = {
  requestInviteStatus?: ApiCallStatus;
  createMemberStatus?: ApiCallStatus;
};

type DispatchProps = {
  requestInviteFromMember: typeof requestInviteFromMember;
  createMember: typeof createMember;
};

type OwnProps = {
  invitingMember?: Member;
  isJointVideo: boolean;
  verifiedName: string;
  videoToken?: string;
};

type OnboardingCreateAccountProps = OwnProps & ReduxStateProps & DispatchProps;

class OnboardingCreateAccountView extends React.Component<
  OnboardingCreateAccountProps
> {
  constructor(props: OnboardingCreateAccountProps) {
    super(props);
  }

  createAccount = () => {
    const username = getUsername(this.props.verifiedName);
    if (this.props.invitingMember) {
      if (this.props.isJointVideo) {
        this.props.requestInviteFromMember(
          this.props.invitingMember.get("memberId"),
          this.props.verifiedName,
          username,
          this.props.videoToken
        );
      } else {
        // Create member with identifying video and inviter
        this.props.createMember(
          this.props.verifiedName,
          username,
          this.props.videoToken,
          this.props.invitingMember.get("memberId")
        );
      }
    } else {
      // Create member with identifying video and no inviter
      this.props.createMember(
        this.props.verifiedName,
        username,
        this.props.videoToken,
        undefined
      );
    }
  };

  private _renderRequestingStatus = () => {
    const status =
      this.props.requestInviteStatus || this.props.createMemberStatus;
    const statusType = status ? status.status : undefined;
    switch (statusType) {
      case ApiCallStatusType.STARTED:
        return <Text>Creating account...</Text>;
      case ApiCallStatusType.SUCCESS:
        return <Text>Account creation successful!</Text>;
      case ApiCallStatusType.FAILURE:
        return <Text>Account creation failed.</Text>;
      default:
        return undefined;
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.text}>
            By clicking Join, I agree that this is my real identity, my full
            name, and the only time I have joined Raha. I am at least 13 years
            old. I understand that creating duplicate or fake accounts may
            result in me and people I have invited losing access to our
            accounts.
          </Text>
          <Text style={styles.text}>
            I understand and agree that after 1 year of inactivity, all of my
            Raha will be irrevocably and irretrievably donated to fund basic
            income, with 80% going directly to members and 20% to the
            member-owned Raha Parliament.
          </Text>
          <Text style={styles.text}>
            I have also read and agree to the{" "}
            <Text
              style={styles.linkText}
              onPress={() =>
                Linking.openURL("https://web.raha.app/terms-of-service")
              }
            >
              Terms of Service
            </Text>,{" "}
            <Text
              style={styles.linkText}
              onPress={() =>
                Linking.openURL("https://web.raha.app/privacy-policy")
              }
            >
              Privacy Policy
            </Text>, and{" "}
            <Text
              style={styles.linkText}
              onPress={() =>
                Linking.openURL("https://web.raha.app/code-of-conduct")
              }
            >
              Code of Conduct
            </Text>.
          </Text>

          <Button title="Join" onPress={this.createAccount} />
          {this._renderRequestingStatus()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  linkText: {
    color: "#0074D9"
  },
  container: {
    flex: 1,
    backgroundColor: colors.darkBackground,
    alignItems: "center",
    justifyContent: "center"
  },
  card: {
    backgroundColor: colors.lightBackground,
    width: Dimensions.get("window").width - 24,
    padding: 12,
    borderRadius: 12
  },
  text: {
    marginBottom: 12
  }
});

const mapStateToProps: MapStateToProps<ReduxStateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const requestInviteStatus = ownProps.invitingMember
    ? getStatusOfApiCall(
        state,
        ApiEndpointName.REQUEST_INVITE,
        ownProps.invitingMember.get("memberId")
      )
    : undefined;
  const createMemberStatus = getStatusOfApiCall(
    state,
    ApiEndpointName.CREATE_MEMBER,
    ownProps.verifiedName
  );
  return { requestInviteStatus, createMemberStatus };
};

export const OnboardingCreateAccount = connect(
  mapStateToProps,
  { requestInviteFromMember, createMember }
)(OnboardingCreateAccountView);
