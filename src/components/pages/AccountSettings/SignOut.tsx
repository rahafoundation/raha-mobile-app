import * as React from "react";
import { connect } from "react-redux";
import { ScrollView, StyleSheet } from "react-native";

import { signOut } from "../../../store/actions/authentication";
import { Button, Text } from "../../shared/elements";
import { styles as sharedStyles } from "./styles";
import { fontSizes } from "../../../helpers/fonts";

interface OwnProps {}

type DispatchProps = {
  signOut: () => void;
};

type Props = DispatchProps & OwnProps;

const SignOutPageView: React.StatelessComponent<Props> = (props: Props) => {
  const { signOut } = props;
  return (
    <ScrollView style={[sharedStyles.page, styles.container]}>
      <Text style={styles.header}>Sign Out?</Text>
      <Text style={styles.body}>
        You will have to receive an SMS one-time-password to sign in again.
      </Text>
      <Button title="Sign Out" onPress={signOut} />
    </ScrollView>
  );
};

export const styles = StyleSheet.create({
  container: {
    padding: 12
  },
  header: {
    marginVertical: 8,
    ...fontSizes.large
  },
  body: {
    marginBottom: 14
  }
});

export const SignOutPage = connect(
  undefined,
  { signOut }
)(SignOutPageView);
