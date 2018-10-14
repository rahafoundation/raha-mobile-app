import * as React from "react";
import { connect, MapStateToProps } from "react-redux";
import { View, StyleSheet, Dimensions } from "react-native";
import validator from "validator";

import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";
import { OperationType } from "@raha/api-shared/dist/models/Operation";

import { styles as sharedStyles } from "./styles";
import { RahaState } from "../../../store";
import { sendInvite } from "../../../store/actions/members";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../../store/reducers/apiCalls";
import { getStatusOfApiCall } from "../../../store/selectors/apiCalls";
import { Text, Button, TextInput } from "../../shared/elements";
import { colors } from "../../../helpers/colors";
import { EnforcePermissionsButton } from "../../shared/elements/EnforcePermissionsButton";

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
        return <Text style={sharedStyles.paragraph}>Sending invite...</Text>;
      case ApiCallStatusType.SUCCESS:
        return (
          <React.Fragment>
            <Text style={sharedStyles.paragraph}>Invite successful!</Text>
            <Button
              style={sharedStyles.button}
              title="Return"
              onPress={this.props.onExit}
            />
          </React.Fragment>
        );
      case ApiCallStatusType.FAILURE:
        return <Text style={sharedStyles.paragraph}>Invite failed.</Text>;
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
      <View style={[sharedStyles.page, styles.page]}>
        <Text style={sharedStyles.back} onPress={this.props.onBack}>
          Back
        </Text>
        <View style={sharedStyles.body}>
          <View style={styles.card}>
            {/*TODO: Unify email input InputEmail/SendInvite*/}
            <TextInput
              autoFocus={true}
              keyboardType="email-address"
              placeholder="What's your friend's email?"
              onChangeText={text => {
                this.setState({
                  email: text.trim(),
                  enteredInvalidEmail: false
                });
              }}
            />
            {this.state.enteredInvalidEmail && (
              <Text style={sharedStyles.paragraph}>
                Please enter a valid email.
              </Text>
            )}
            <EnforcePermissionsButton
              operationType={OperationType.INVITE}
              title="Invite"
              onPress={this.sendInvite}
              disabled={isRequestSendingOrSent}
              style={sharedStyles.button}
            />
            {this._renderSendingStatus()}
          </View>
        </View>
      </View>
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
  page: {
    backgroundColor: colors.darkBackground
  },
  card: {
    backgroundColor: colors.pageBackground,
    width: Dimensions.get("window").width - 24,
    padding: 12,
    borderRadius: 12
  }
});
