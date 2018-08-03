import * as React from "react";
import { connect, MapStateToProps } from "react-redux";
import validator from "validator";

import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";

import { RahaState } from "../../../store";
import { sendInvite } from "../../../store/actions/members";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../../store/reducers/apiCalls";
import { getStatusOfApiCall } from "../../../store/selectors/apiCalls";
import { Text, Button, TextInput } from "../../shared/elements";

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
    sendInvite: (email: string, videoToken: string) => void;
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
    if (!enteredEmail || !validator.isEmail(enteredEmail)) {
      this.setState({ enteredInvalidEmail: true });
      return;
    }
    this.props.sendInvite(enteredEmail, this.props.videoToken);
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
    const status = this.props.sendInviteStatus
      ? this.props.sendInviteStatus.status
      : undefined;
    const isRequestSendingOrSent =
      status &&
      (status === ApiCallStatusType.STARTED ||
        status === ApiCallStatusType.SUCCESS);
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
        {
          <Button
            title="Invite"
            onPress={this.sendInvite}
            disabled={isRequestSendingOrSent}
          />
        }
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
