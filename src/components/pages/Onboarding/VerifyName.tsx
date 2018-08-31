import * as React from "react";
import { Member } from "../../../store/reducers/members";
import { View } from "react-native";

import {
  Button,
  Text,
  TextInput,
  IndependentPageContainer
} from "../../shared/elements";
import { styles } from "./styles";

/**
 * Page that confirms user's full name
 */

type OwnProps = {
  initialDisplayName?: string;
  onVerifiedName: (verifiedName: string) => any;
  onBack: () => any;
};

type VerifyNameProps = OwnProps;

type VerifyNameState = {
  invitingMember?: Member;
  verifiedName?: string;
};

export class VerifyName extends React.Component<
  VerifyNameProps,
  VerifyNameState
> {
  state = {
    verifiedName: this.props.initialDisplayName
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
                Please confirm your full name:
              </Text>
              <TextInput
                placeholder="What's your full name?"
                onChangeText={text => this.setState({ verifiedName: text })}
                value={this.state.verifiedName}
              />
              <Button
                title={`Confirm`}
                disabled={
                  this.state.verifiedName === undefined ||
                  this.state.verifiedName.length === 0
                }
                onPress={() => {
                  const verifiedName = this.state.verifiedName;
                  if (verifiedName) {
                    this.props.onVerifiedName(verifiedName.trim());
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
