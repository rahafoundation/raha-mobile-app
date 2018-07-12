import * as React from "react";
import { Button, TextInput } from "react-native";
import { connect, MapStateToProps, MergeProps } from "react-redux";
import { ApiEndpoint } from "../../../api";
import { RahaState } from "../../../store";
import { sendInvite } from "../../../store/actions/members";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../../store/reducers/apiCalls";
import { getStatusOfApiCall } from "../../../store/selectors/apiCalls";
import { Text } from "../../shared/elements";

type ReduxStateProps = {
  sendInviteStatus?: ApiCallStatus;
};

type OwnProps = {
  videoToken: string;
};

type SendInviteState = {
  email: string;
};

type SendInviteProps = OwnProps &
  ReduxStateProps & {
    sendInvite: (videoToken: string, email: string) => void;
  };

class SendInviteView extends React.Component<SendInviteProps, SendInviteState> {
  constructor(props: SendInviteProps) {
    super(props);
  }

  sendInvite = () => {
    console.log(
      "sending invite with " +
        this.props.videoToken +
        " and " +
        this.state.email
    );
    // TODO: Validate email
    this.props.sendInvite(this.props.videoToken, this.state.email);
  };

  private _renderSendingStatus = () => {
    const statusType = this.props.sendInviteStatus
      ? this.props.sendInviteStatus.status
      : undefined;
    switch (statusType) {
      case ApiCallStatusType.STARTED:
        return <Text>Sending invite...</Text>;
      case ApiCallStatusType.SUCCESS:
        return <Text>Invite successful!</Text>;
      case ApiCallStatusType.FAILURE:
        return <Text>Invite failed.</Text>;
      default:
        return undefined;
    }
  };

  render() {
    return (
      <React.Fragment>
        <TextInput
          placeholder="What's your friend's email?"
          onChangeText={text => this.setState({ email: text.trim() })}
        />
        <Button
          title="Invite"
          onPress={this.sendInvite}
          // disabled={
          //   this.props.sendInviteStatus &&
          //   this.props.sendInviteStatus.status !== ApiCallStatusType.FAILURE
          // }
        />
        {this._renderSendingStatus()}
      </React.Fragment>
    );
  }
}

const mapStateToProps: MapStateToProps<ReduxStateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const sendInviteStatus = getStatusOfApiCall(
    state,
    ApiEndpoint.SEND_INVITE,
    ownProps.videoToken
  );
  return {
    sendInviteStatus: sendInviteStatus
  };
};

export const SendInvite = connect(
  mapStateToProps,
  { sendInvite }
)(SendInviteView);
