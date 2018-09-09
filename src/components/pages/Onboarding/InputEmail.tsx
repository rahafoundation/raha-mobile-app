import * as React from "react";
import { View } from "react-native";
import * as validator from "validator";

import {
  Button,
  Text,
  TextInput,
  IndependentPageContainer
} from "../../shared/elements";
import { styles } from "./styles";

/**
 * Page that requests user's email address
 */

type OwnProps = {
  onInputEmail: (emailAddress: string) => any;
  onBack: () => any;
};

type InputEmailProps = OwnProps;

type InputEmailState = {
  emailAddress?: string;
};

export class InputEmail extends React.Component<
  InputEmailProps,
  InputEmailState
> {
  state: InputEmailState = {};

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
                Please enter your email address:
              </Text>
              {/*TODO: Unify email input InputEmail/SendInvite*/}
              <TextInput
                keyboardType="email-address"
                autoFocus={true}
                placeholder="you@gmail.com"
                onChangeText={text =>
                  this.setState({ emailAddress: text ? text.trim() : text })
                }
                value={this.state.emailAddress}
              />
              <Button
                title={`Confirm`}
                disabled={
                  this.state.emailAddress === undefined ||
                  !validator.isEmail(this.state.emailAddress)
                }
                onPress={() => {
                  if (this.state.emailAddress) {
                    const normalizedEmailAddress = validator.normalizeEmail(
                      this.state.emailAddress
                    );
                    if (normalizedEmailAddress) {
                      this.props.onInputEmail(normalizedEmailAddress);
                    }
                  }
                }}
              />
            </View>
          </View>
        </View>
      </IndependentPageContainer>
    );
  }
}
