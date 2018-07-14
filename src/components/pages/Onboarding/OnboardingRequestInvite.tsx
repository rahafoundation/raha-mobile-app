import * as React from "react";
import { StyleSheet, Button, Linking } from "react-native";
import { connect, MapStateToProps, MergeProps } from "react-redux";

import { ApiEndpointName } from "@raha/api/dist/shared/types/ApiEndpoint";

import { getUsername } from "../../../helpers/username";
import { RahaState } from "../../../store";
import { requestInviteFromMember } from "../../../store/actions/members";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../../store/reducers/apiCalls";
import { Member } from "../../../store/reducers/members";
import { getStatusOfApiCall } from "../../../store/selectors/apiCalls";
import { Text } from "../../shared/elements";

type ReduxStateProps = {
  requestInviteStatus?: ApiCallStatus;
  videoDownloadUrl?: string;
};

type DispatchProps = {
  requestInviteFromMember: typeof requestInviteFromMember;
};

type OwnProps = {
  invitingMember: Member;
  verifiedName: string;
  videoDownloadUrl: string;
};

type OnboardingRequestInviteState = {
  uniqueIdentity: boolean;
  accountInactivity: boolean;
  validAge: boolean;
  privacyPolicy: boolean;
  termsOfService: boolean;
  codeOfConduct: boolean;
};

type OnboardingRequestInviteProps = OwnProps &
  ReduxStateProps & {
    requestInvite: (videoDownloadUrl: string) => void;
  };

class OnboardingRequestInviteView extends React.Component<
  OnboardingRequestInviteProps,
  OnboardingRequestInviteState
> {
  constructor(props: OnboardingRequestInviteProps) {
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

  sendInviteRequest = () => {
    this.props.requestInvite(this.props.videoDownloadUrl);
  };

  private _renderRequestingStatus = () => {
    const statusType = this.props.requestInviteStatus
      ? this.props.requestInviteStatus.status
      : undefined;
    switch (statusType) {
      case ApiCallStatusType.STARTED:
        return <Text>Requesting invite...</Text>;
      case ApiCallStatusType.SUCCESS:
        return <Text>Request successful!</Text>;
      case ApiCallStatusType.FAILURE:
        return <Text>Invite request failed.</Text>;
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

        <Button title="Join" onPress={this.sendInviteRequest} />
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
  const requestInviteStatus = getStatusOfApiCall(
    state,
    ApiEndpointName.REQUEST_INVITE,
    ownProps.invitingMember.memberId
  );
  return {
    requestInviteStatus: requestInviteStatus
  };
};

const mergeProps: MergeProps<
  ReduxStateProps,
  DispatchProps,
  OwnProps,
  OnboardingRequestInviteProps
> = (stateProps, dispatchProps, ownProps) => {
  return {
    ...stateProps,
    requestInvite: (videoUrl: string) => {
      dispatchProps.requestInviteFromMember(
        ownProps.invitingMember.memberId,
        ownProps.verifiedName,
        videoUrl,
        getUsername(ownProps.verifiedName)
      );
    },
    ...ownProps
  };
};

export const OnboardingRequestInvite = connect(
  mapStateToProps,
  { requestInviteFromMember },
  mergeProps
)(OnboardingRequestInviteView);
