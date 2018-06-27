/**
 * Renders the video camera preview screen after recording an invite video then
 * allows the user the upload it.
 */
import * as firebase from "firebase";
import * as React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect, MapStateToProps, MergeProps } from "react-redux";
import { ApiEndpoint } from "../../../api";
import { getUsername } from "../../../helpers/username";
import { MemberId } from "../../../identifiers";
import { RahaState } from "../../../store";
import { requestInviteFromMember } from "../../../store/actions/members";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../../store/reducers/apiCalls";
import { Member } from "../../../store/reducers/members";
import { getStatusOfApiCall } from "../../../store/selectors/apiCalls";
import { getPrivateVideoInviteRef } from "../../../store/selectors/authentication";
import { RouteName } from "../../shared/Navigation";
import { VideoPreview } from "../Camera/VideoPreview";

type ReduxStateProps = {
  videoUploadRef?: firebase.storage.Reference;
  firebaseMemberId?: MemberId;
  requestInviteStatus?: ApiCallStatus;
  videoDownloadUrl?: string;
};

interface NavParams {
  invitingMember?: Member;
  verifiedName?: string;
  videoUri?: string;
}

type DispatchProps = {
  requestInviteFromMember: typeof requestInviteFromMember;
};

type OwnProps = NavigationScreenProps<NavParams>;

type OnboardingVideoPreviewProps = ReduxStateProps &
  OwnProps & {
    requestInvite: (videoDownloadUrl: string) => void;
  };

type OnboardingVideoState = {
  videoDownloadUrl?: string;
};

class OnboardingVideoPreviewView extends React.Component<
  OnboardingVideoPreviewProps,
  OnboardingVideoState
> {
  videoUri?: string;

  navigateToCamera = () => {
    this.props.navigation.navigate(RouteName.OnboardingCamera, {
      invitingMember: this.props.navigation.getParam("invitingMember"),
      verifiedName: this.props.navigation.getParam("verifiedName")
    });
  };

  sendInviteRequest(videoDownloadUrl: string) {
    this.setState({
      videoDownloadUrl: videoDownloadUrl
    });
    this.props.requestInvite(videoDownloadUrl);
  }

  componentWillMount() {
    this.videoUri = this.props.navigation.getParam("videoUri");

    // Validate video state.
    if (!this.videoUri) {
      console.warn(
        "videoUri missing from navigator when mounting video preview."
      );

      // TODO: Replace with alert
      //   this.setState({
      //     errorMessage: "Invalid video. Please try again."
      //   });
    } else if (!this.props.videoUploadRef) {
      // TODO: Replace with alert
      //   this.setState({
      //     errorMessage:
      //       "Could not find storage to upload video to. Please contact the Raha team."
      //   });
    }
  }

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

  private _renderRequestInviteButton = () => {
    const videoDownloadUrl = this.state
      ? this.state.videoDownloadUrl
      : undefined;
    return (
      (!this.props.requestInviteStatus ||
        this.props.requestInviteStatus.status === ApiCallStatusType.FAILURE) &&
      videoDownloadUrl && (
        <Button
          title="Request Invite"
          onPress={() => {
            this.sendInviteRequest(videoDownloadUrl);
          }}
        />
      )
    );
  };

  render() {
    const videoUploadRef = this.props.videoUploadRef;
    return (
      <View style={styles.container}>
        {videoUploadRef &&
          this.videoUri && (
            <VideoPreview
              videoUri={this.videoUri}
              videoUploadRef={videoUploadRef}
              onVideoUploaded={(videoDownloadUrl: string) =>
                this.sendInviteRequest(videoDownloadUrl)
              }
              onRetakeClicked={this.navigateToCamera}
            />
          )}
        {this._renderRequestingStatus()}
        {this._renderRequestInviteButton()}
      </View>
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
  const inviter = ownProps.navigation.getParam("invitingMember");
  const requestInviteStatus = inviter
    ? getStatusOfApiCall(state, ApiEndpoint.REQUEST_INVITE, inviter.memberId)
    : undefined;
  return {
    videoUploadRef: getPrivateVideoInviteRef(state),
    requestInviteStatus: requestInviteStatus
  };
};

const mergeProps: MergeProps<
  ReduxStateProps,
  DispatchProps,
  OwnProps,
  OnboardingVideoPreviewProps
> = (stateProps, dispatchProps, ownProps) => {
  return {
    ...stateProps,
    requestInvite: (videoUrl: string) => {
      const inviter = ownProps.navigation.getParam("invitingMember");
      const verifiedName = ownProps.navigation.getParam("verifiedName");
      if (inviter && verifiedName) {
        dispatchProps.requestInviteFromMember(
          inviter.memberId,
          verifiedName,
          videoUrl,
          getUsername(verifiedName)
        );
      }
    },
    ...ownProps
  };
};

export const OnboardingVideoPreview = connect(
  mapStateToProps,
  { requestInviteFromMember },
  mergeProps
)(OnboardingVideoPreviewView);
