import { Big } from "big.js";
import * as React from "react";

import { Member } from "../../../store/reducers/members";
import { GiveForm } from "./GiveForm";
import { Success } from "./Success";
import { NavigationScreenProp } from "react-navigation";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../../helpers/colors";

type Props = {
  navigation: NavigationScreenProp<{}>;
};

type State = {
  operationIdentifer: string;
  toMember?: Member;
  amount?: Big;
  memo?: string;
};

/**
 * Return a generally unique identifier.
 */
function getOperationIdentifer(): string {
  return new Date().getTime().toString();
}

export class Give extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = {
      toMember: props.navigation.getParam("toMember", undefined),
      operationIdentifer: getOperationIdentifer()
    };
  }

  onSuccess = (toMember: Member, amount: Big, memo: string) => {
    this.setState({
      toMember,
      amount,
      memo
    });
  };

  onReset = () => {
    this.setState({
      operationIdentifer: getOperationIdentifer(),
      toMember: undefined,
      amount: undefined,
      memo: undefined
    });
  };

  public render() {
    const { operationIdentifer, toMember, amount, memo } = this.state;
    return (
      <View style={styles.page}>
        {toMember && amount ? (
          <Success
            toMember={toMember}
            amount={amount}
            memo={memo}
            onResetCallback={this.onReset}
          />
        ) : (
          <GiveForm
            toMemberId={toMember && toMember.get("memberId")}
            identifier={operationIdentifer}
            onSuccessCallback={this.onSuccess}
          />
        )}
      </View>
    );
  }
}

const pageStyle: ViewStyle = {
  backgroundColor: colors.pageBackground,
  height: "100%"
};

const styles = StyleSheet.create({
  page: pageStyle
});
