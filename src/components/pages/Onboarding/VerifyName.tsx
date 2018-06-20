import * as React from "react";
import { TextInput } from "react-native";
import { Text, Button } from "react-native-elements";

/**
 * Component that confirms user's full name.
 */
type VerifyNameProps = {
  initialDisplayName?: string;
  onVerifiedName: (name: string) => void;
};

type VerifyNameState = {
  displayName?: string;
};

export class VerifyName extends React.Component<
  VerifyNameProps,
  VerifyNameState
> {
  render() {
    const displayName = this.state.displayName;
    return (
      <React.Fragment>
        <Text>Please enter your full name:</Text>
        <TextInput
          placeholder="What's your full name?"
          defaultValue={this.state.displayName}
          onChangeText={name => {
            this.setState({ displayName: name });
          }}
        />
        {displayName && (
          <Button
            onPress={() => {
              this.props.onVerifiedName(displayName);
            }}
            title="Confirm Name"
          />
        )}
      </React.Fragment>
    );
  }
}
