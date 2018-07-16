import * as React from "react";
import { Button, TextInput, View } from "react-native";
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
import validator from "validator";

const ENABLE_SEND_INVITE = false;

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

  private _renderTemporaryPage = () => {
    return (
      <Text>
        We're working on an easier way to invite your friends! For now, please
        send invites through the web app.
      </Text>
    );
  };

  render() {
    if (!ENABLE_SEND_INVITE) {
      return this._renderTemporaryPage();
    }

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
