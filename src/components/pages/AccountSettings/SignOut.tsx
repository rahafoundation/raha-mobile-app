import * as React from "react";
import { connect } from "react-redux";
import { ScrollView } from "react-native";

import { signOut } from "../../../store/actions/authentication";
import { Button } from "../../shared/elements";
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
      <Button style={styles.row} title="Sign Out" onPress={signOut} />
    </ScrollView>
  );
};

export const SignOutPage = connect(
  undefined,
  { signOut }
)(SignOutPageView);
