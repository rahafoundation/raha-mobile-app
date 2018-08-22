import * as React from "react";
import { connect, MapStateToProps } from "react-redux";
import { View, StyleSheet, Dimensions } from "react-native";
import validator from "validator";

import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";

import { RahaState } from "../../../store";
import { sendInvite } from "../../../store/actions/members";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../../store/reducers/apiCalls";
import { getStatusOfApiCall } from "../../../store/selectors/apiCalls";
import { Text, Button, TextInput, Container } from "../../shared/elements";
import { colors } from "../../../helpers/colors";

type ReduxStateProps = {
  sendInviteStatus?: ApiCallStatus;
};

type OwnProps = {
  videoToken: string;
  isJointVideo: boolean;
  onBack: () => void;
  onExit: () => void;
};

type SendInviteState = {
  email?: string;
  enteredInvalidEmail: boolean;
};

type SendInviteProps = OwnProps &
  ReduxStateProps & {
    sendInvite: (
      email: string,
      videoToken: string,
      isJointVideo: boolean
    ) => void;
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
    this.props.sendInvite(
      enteredEmail,
      this.props.videoToken,
      this.props.isJointVideo
    );
  };

  private _renderSendingStatus = () => {
    const statusType = this.props.sendInviteStatus
      ? this.props.sendInviteStatus.status
      : undefined;
    switch (statusType) {
      case ApiCallStatusType.STARTED:
        return <Text style={styles.text}>Sending invite...</Text>;
      case ApiCallStatusType.SUCCESS:
        return (
          <React.Fragment>
            <Text style={styles.text}>Invite successful!</Text>
            <Button
              style={styles.button}
              title="Return"
              onPress={this.props.onExit}
            />
          </React.Fragment>
        );
      case ApiCallStatusType.FAILURE:
        return <Text style={styles.text}>Invite failed.</Text>;
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
      <Container style={styles.container}>
        <Text style={styles.back} onPress={this.props.onBack}>
          Back
        </Text>
        <View style={styles.card}>
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
            <Text style={styles.text}>Please enter a valid email.</Text>
          )}
          <Button
            title="Invite"
            onPress={this.sendInvite}
            disabled={isRequestSendingOrSent}
            style={styles.button}
          />
          {this._renderSendingStatus()}
        </View>
      </Container>
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.darkBackground,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  card: {
    backgroundColor: colors.pageBackground,
    width: Dimensions.get("window").width - 24,
    padding: 12,
    borderRadius: 12
  },
  text: {
    fontSize: 18,
    marginVertical: 4,
    marginHorizontal: 40,
    textAlign: "center"
  },
  button: {
    margin: 12
  },
  back: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: 12
  }
});
