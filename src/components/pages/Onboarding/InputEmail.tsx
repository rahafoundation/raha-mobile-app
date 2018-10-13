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
import { CheckBox } from "react-native-elements";
import { palette } from "../../../helpers/colors";
import { fonts } from "../../../helpers/fonts";

/**
 * Page that requests user's email address
 */

type OwnProps = {
  onInputEmail: (emailAddress: string, subscribeToNewsletter: boolean) => any;
  onBack: () => any;
};

type InputEmailProps = OwnProps;

type InputEmailState = {
  emailAddress?: string;
  subscribeToNewsletter: boolean;
};

export class InputEmail extends React.Component<
  InputEmailProps,
  InputEmailState
> {
  state: InputEmailState = {
    subscribeToNewsletter: false
  };

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
              <CheckBox
                title="Sign me up for the monthly newsletter"
                checkedColor={palette.purple}
                checked={this.state.subscribeToNewsletter}
                textStyle={fonts.Lato.Normal}
                onPress={() =>
                  this.setState({
                    subscribeToNewsletter: !this.state.subscribeToNewsletter
                  })
                }
              />
              <Button
                title={`Confirm`}
                style={{ marginTop: 8 }}
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
                      this.props.onInputEmail(
                        normalizedEmailAddress,
                        this.state.subscribeToNewsletter
                      );
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
