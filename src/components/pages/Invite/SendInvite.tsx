import * as React from "react";
import { Button, TextInput } from "react-native";
import { connect, MapStateToProps } from "react-redux";
import validator from "validator";

import { ApiEndpointName } from "@raha/api/dist/shared/types/ApiEndpoint";

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
  email?: string;
  enteredInvalidEmail: boolean;
};

type SendInviteProps = OwnProps &
  ReduxStateProps & {
    sendInvite: (videoToken: string, email: string) => void;
  };

class SendInviteView extends React.Component<SendInviteProps, SendInviteState> {
  constructor(props: SendInviteProps) {
    super(props);
    this.state = {
      enteredInvalidEmail: false
    };
  }

  sendInvite = () => {
    const enteredEmail = this.state.email;
    // TODO: Check if already a member
    if (!enteredEmail || !validator.isEmail(enteredEmail)) {
      this.setState({ enteredInvalidEmail: true });
      return;
    }
    this.props.sendInvite(this.props.videoToken, enteredEmail);
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
          style={{ fontSize: 18, marginTop: 24, textAlign: "center" }}
          placeholder="What's your friend's email?"
          onChangeText={text => {
            this.setState({
              email: text.trim(),
              enteredInvalidEmail: false
            });
          }}
        />
        {this.state.enteredInvalidEmail && (
          <Text>Please enter a valid email.</Text>
        )}
        {<Button title="Invite" onPress={this.sendInvite} />}
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
    ApiEndpointName.SEND_INVITE,
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
