import * as React from "react";
import { StyleSheet, Text, Button } from "react-native";
import { connect, MapStateToProps, MergeProps } from "react-redux";
import { ApiEndpoint } from "../../../api";
import { getUsername } from "../../../helpers/username";
import { RahaState } from "../../../store";
import { requestInviteFromMember } from "../../../store/actions/members";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../../store/reducers/apiCalls";
import { Member } from "../../../store/reducers/members";
import { getStatusOfApiCall } from "../../../store/selectors/apiCalls";

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

type OnboardingRequestInviteProps = OwnProps &
  ReduxStateProps & {
    requestInvite: (videoDownloadUrl: string) => void;
  };

class OnboardingRequestInviteView extends React.Component<
  OnboardingRequestInviteProps
> {
  constructor(props: OnboardingRequestInviteProps) {
    super(props);
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
        <Text>
          By pressing submit, I agree that this is my real identity, my full
          name, and the only time I have joined Raha. I understand that creating
          duplicate or fake accounts may result in me and people I have invited
          losing access to our accounts.
        </Text>
        <Button title="Submit" onPress={this.sendInviteRequest} />
        {this._renderRequestingStatus()}
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

const mapStateToProps: MapStateToProps<ReduxStateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const requestInviteStatus = getStatusOfApiCall(
    state,
    ApiEndpoint.REQUEST_INVITE,
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
