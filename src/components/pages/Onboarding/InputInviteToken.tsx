import * as React from "react";
import { View, ViewStyle } from "react-native";

import {
  Button,
  Text,
  TextInput,
  IndependentPageContainer
} from "../../shared/elements";
import { styles } from "./styles";
import { connect, MapStateToProps } from "react-redux";
import { RahaState } from "../../../store";
import { styles as sharedStyles } from "./styles";
import { colors } from "react-native-elements";

/**
 * Page that requests an invite token
 */

type OwnProps = {
  onInputInviteToken: (inviteToken: string) => any;
  onContinueWithoutToken: () => any;
  onBack: () => any;
};

type ReduxStateProps = {
  doesInviteTokenExist: (t: string) => boolean;
};

type InputInviteTokenProps = OwnProps & ReduxStateProps;

type InputInviteTokenState = {
  inviteToken?: string;
  errorMessage?: string;
};

const mapStateToProps: MapStateToProps<
  ReduxStateProps,
  OwnProps,
  RahaState
> = state => {
  return {
    doesInviteTokenExist: (token: string) =>
      state.invitations.byInviteToken.has(token)
  };
};

class InputInviteTokenView extends React.Component<
  InputInviteTokenProps,
  InputInviteTokenState
> {
  state: InputInviteTokenState = {};

  validateInviteToken() {
    const token = this.state.inviteToken;
    if (!token) {
      return;
    }

    if (!this.props.doesInviteTokenExist(token)) {
      this.setState({
        errorMessage: "This code is invalid or has expired."
      });
      return;
    }

    this.props.onInputInviteToken(token);
  }

  render() {
    return (
      <IndependentPageContainer containerStyle={styles.cardPageContainer}>
        <View style={styles.page}>
          <Text style={styles.back} onPress={this.props.onBack}>
            Back
          </Text>
          <View style={styles.body}>
            <View style={styles.card}>
              <Text style={{ fontSize: 18 }}>
                If you were invited by an existing Raha member, please enter the
                invite token you received in your invite email:
              </Text>
              <TextInput
                autoFocus={true}
                placeholder={"abcxyz123"}
                onChangeText={text =>
                  this.setState({
                    inviteToken: text ? text.trim() : undefined,
                    errorMessage: undefined
                  })
                }
                value={this.state.inviteToken}
                style={styles.input}
              />
              {this.state.errorMessage && (
                <Text style={[{ color: colors.error }, sharedStyles.paragraph]}>
                  {this.state.errorMessage}
                </Text>
              )}
              <Button
                title={`Confirm invite token`}
                disabled={this.state.inviteToken === undefined}
                style={styles.button}
                onPress={() => {
                  this.validateInviteToken();
                }}
              />
              <Button
                title={`Continue without invite token`}
                disabled={this.state.inviteToken !== undefined}
                style={styles.button}
                onPress={this.props.onContinueWithoutToken}
              />
            </View>
          </View>
        </View>
      </IndependentPageContainer>
    );
  }
}

export const InputInviteToken = connect(mapStateToProps)(InputInviteTokenView);

const RowStyle: ViewStyle = {
  marginTop: 8
};
