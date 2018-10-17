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
import { Hint } from "../../shared/elements/Hint";

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
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 18, flex: 1 }}>
                  Please enter your full name:
                </Text>
                <Hint
                  style={{ paddingHorizontal: 4 }}
                  text={
                    "Everybody's full names are displayed publicly on their profiles and transactions " +
                    "so that members can check for duplicate or fake accounts."
                  }
                />
              </View>
              <TextInput
                style={styles.input}
                autoCapitalize="words"
                autoFocus={true}
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
