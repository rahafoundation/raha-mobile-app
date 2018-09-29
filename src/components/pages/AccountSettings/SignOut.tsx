import * as React from "react";
import { connect } from "react-redux";
import { ScrollView } from "react-native";

import { signOut } from "../../../store/actions/authentication";
import { Button, Text } from "../../shared/elements";
import { styles } from "./styles";

interface OwnProps {}

type DispatchProps = {
  signOut: () => void;
};

type Props = DispatchProps & OwnProps;

const SignOutPageView: React.StatelessComponent<Props> = (props: Props) => {
  const { signOut } = props;
  return (
    <ScrollView style={styles.page}>
      <Text style={styles.row}>
        Sign out? You will have to receive an SMS one-time-password to sign in
        to Raha again.
      </Text>
      <Button style={styles.row} title="Sign Out" onPress={signOut} />
    </ScrollView>
  );
};

export const SignOutPage = connect(
  undefined,
  { signOut }
)(SignOutPageView);
