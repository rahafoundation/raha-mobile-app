import * as React from "react";
import { StyleSheet, Button, Linking } from "react-native";
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
import { Text } from "../../shared/elements";

type ReduxStateProps = {
  requestInviteStatus?: ApiCallStatus;
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

type OnboardingCreateAccountState = {
  uniqueIdentity: boolean;
  accountInactivity: boolean;
  validAge: boolean;
  privacyPolicy: boolean;
  termsOfService: boolean;
  codeOfConduct: boolean;
};

type OnboardingCreateAccountProps = OwnProps & ReduxStateProps & DispatchProps;

class OnboardingCreateAccountView extends React.Component<
  OnboardingCreateAccountProps,
  OnboardingCreateAccountState
> {
  constructor(props: OnboardingCreateAccountProps) {
    super(props);
    this.state = {
      uniqueIdentity: false,
      accountInactivity: false,
      validAge: false,
      privacyPolicy: false,
      termsOfService: false,
      codeOfConduct: false
    };
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
    const statusType = this.props.requestInviteStatus
      ? this.props.requestInviteStatus.status
      : undefined;
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
      <React.Fragment>
        <Text style={styles.text}>
          By clicking Join, I agree that this is my real identity, my full name,
          and the only time I have joined Raha. I am at least 13 years old. I
          understand that creating duplicate or fake accounts may result in me
          and people I have invited losing access to our accounts.
        </Text>
        <Text style={styles.text}>
          I understand and agree that after 1 year of inactivity, all of my Raha
          will be irrevocably and irretrievably donated to fund basic income,
          with 80% going directly to members and 20% to the member-owned Raha
          Parliament.
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
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  linkText: {
    color: "#0074D9"
  },
  text: {
    margin: 12
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
  return { requestInviteStatus };
};

export const OnboardingCreateAccount = connect(
  mapStateToProps,
  { requestInviteFromMember, createMember }
)(OnboardingCreateAccountView);
