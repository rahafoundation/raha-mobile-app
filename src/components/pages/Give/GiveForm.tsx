import { Big } from "big.js";
import * as React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import {
  FormLabel,
  FormInput,
  FormValidationMessage
} from "react-native-elements";
import { connect, MapStateToProps, MergeProps } from "react-redux";

import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";

import { RahaState } from "../../../store";
import { give } from "../../../store/actions/wallet";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../../store/reducers/apiCalls";
import { Member } from "../../../store/reducers/members";
import { getStatusOfApiCall } from "../../../store/selectors/apiCalls";
import { getLoggedInMember } from "../../../store/selectors/authentication";
import { getMemberById } from "../../../store/selectors/members";
import { MemberSearchBar } from "../../shared/MemberSearchBar";
import { Button, Text } from "../../shared/elements";
import { colors } from "../../../helpers/colors";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const MAX_MEMO_LENGTH = 140;
// Donation rate is currently constant.
const DONATION_RATE = 3;

type OwnProps = {
  toMemberId?: MemberId;
  // Identifier for the Give API Operation created by this form.
  identifier: string;
  // Callback once the Give API Operation created by this form is successful.
  onSuccessCallback: (toMember: Member, amount: Big, memo: string) => any;
};

type StateProps = {
  loggedInMember?: Member;
  getMemberById: (memberId: MemberId) => Member | undefined;
  apiCallStatus: ApiCallStatus | undefined;
};
type DispatchProps = {
  give: typeof give;
};
type MergedProps = StateProps & {
  give: (amount: Big, memo: string, toMemberId: MemberId) => void;
};

type Props = OwnProps & MergedProps;

interface FormFields {
  amount?: Big;
  memo: string;
}
type FormState = { readonly [field in keyof FormFields]: FormFields[field] };

type State = {
  toMember?: Member;
} & FormState;

class GiveFormView extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    const toMemberId = props.toMemberId;
    this.state = {
      toMember: toMemberId ? props.getMemberById(toMemberId) : undefined,
      memo: ""
    };
  }

  private validateAmount: (amount: Big | undefined) => boolean = amount => {
    return (
      !!amount &&
      amount.gt(0) &&
      !!this.props.loggedInMember &&
      amount.lte(this.props.loggedInMember.get("balance"))
    );
  };
  private onChangeAmount = (amount: string) => {
    if (amount.length === 0) {
      this.setState({ amount: undefined });
    } else {
      try {
        // Rounding Mode half-up
        const bigAmount = new Big(amount).round(2, 1);
        if (this.validateAmount(bigAmount)) {
          this.setState({
            amount: bigAmount
          });
        }
      } catch {}
    }
  };

  private validateMemo: (memo: string) => boolean = memo => {
    return memo.length <= MAX_MEMO_LENGTH;
  };
  private onChangeMemo = (memo: string) => {
    if (this.validateMemo(memo)) {
      this.setState({ memo });
    }
  };

  private clearTo: () => void = () => {
    this.setState({
      toMember: undefined
    });
  };
  private onMemberSelected: (member: Member) => void = member => {
    this.setState({
      toMember: member
    });
  };
  private validateTo: () => boolean = () => {
    return (
      !!this.props.loggedInMember &&
      !!this.state.toMember &&
      this.props.loggedInMember.get("memberId") !==
        this.state.toMember.get("memberId")
    );
  };

  private validateForm = () => {
    return (
      this.validateAmount(this.state.amount) &&
      this.validateMemo(this.state.memo) &&
      this.validateTo()
    );
  };

  private giveRaha = () => {
    const { amount, memo, toMember } = this.state;
    if (amount && toMember && this.validateForm()) {
      this.props.give(amount, memo, toMember.get("memberId"));
    }
  };

  public componentDidUpdate(prevProps: Props, prevState: State) {
    if (
      this.props.apiCallStatus &&
      prevProps.apiCallStatus !== this.props.apiCallStatus &&
      this.props.apiCallStatus.status === ApiCallStatusType.SUCCESS &&
      this.state.toMember &&
      this.state.amount
    ) {
      this.props.onSuccessCallback(
        this.state.toMember,
        this.state.amount,
        this.state.memo
      );
    }
  }
  flag?: boolean;

  public render() {
    return (
      <KeyboardAwareScrollView
        enableAutomaticScroll
        bounces={false}
        enableOnAndroid
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.toRow}>
          {this.state.toMember ? (
            <React.Fragment>
              <FormLabel>To:</FormLabel>
              <View style={styles.selectedMember}>
                <Text onPress={this.clearTo}>
                  {this.state.toMember.get("fullName")} (
                  {this.state.toMember.get("username")})
                </Text>
              </View>
            </React.Fragment>
          ) : (
            <View style={styles.searchBar}>
              <MemberSearchBar
                lightTheme
                onMemberSelected={this.onMemberSelected}
                excludeMembers={
                  this.props.loggedInMember ? [this.props.loggedInMember] : []
                }
                placeholderText="To..."
              />
            </View>
          )}
        </View>
        {this.state.toMember ? (
          <FormValidationMessage
            labelStyle={styles.helper}
            containerStyle={styles.section}
          >
            {this.state.toMember.get("fullName")} is currently donating{" "}
            {DONATION_RATE}% of all Raha they receive back to the Raha basic
            income pool. This donation will be used to fund future basic income
            distributions for everyone in the Raha network.
          </FormValidationMessage>
        ) : (
          <React.Fragment />
        )}
        <View>
          <FormLabel>Amount</FormLabel>
          <FormInput
            keyboardType="numeric"
            value={this.state.amount && this.state.amount.toString()}
            onChangeText={this.onChangeAmount}
            placeholder="0.00"
          />
          <FormValidationMessage labelStyle={styles.helper}>
            Your balance:{" "}
            {this.props.loggedInMember
              ? this.props.loggedInMember.get("balance").toString()
              : 0}{" "}
            Raha
          </FormValidationMessage>
        </View>
        <View>
          <FormLabel>Given for...</FormLabel>
          <FormInput
            value={this.state.memo}
            onChangeText={this.onChangeMemo}
            multiline={true}
            placeholder="...being so amazing!"
            autoCapitalize="none"
          />
          <FormValidationMessage labelStyle={styles.helper}>
            {MAX_MEMO_LENGTH - this.state.memo.length} characters remaining
          </FormValidationMessage>
        </View>
        {this.state.toMember && this.state.amount ? (
          <FormValidationMessage
            labelStyle={styles.helper}
            containerStyle={styles.section}
          >
            You will publicly give {this.state.amount.toString()} Raha to{" "}
            {this.state.toMember.get("fullName")} for "
            {this.state.memo ? `${this.state.memo}` : ""}
            ".
          </FormValidationMessage>
        ) : (
          <React.Fragment />
        )}
        <View style={[styles.section, styles.giveButtonRow]}>
          <Button
            title="Give"
            onPress={this.giveRaha}
            disabled={
              !this.validateForm() ||
              (this.props.apiCallStatus &&
                this.props.apiCallStatus.status === ApiCallStatusType.STARTED)
            }
          />
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const loggedInMember = getLoggedInMember(state);
  const apiCallStatus = getStatusOfApiCall(
    state,
    ApiEndpointName.GIVE,
    ownProps.identifier
  );
  return {
    toMemberId: ownProps.toMemberId,
    loggedInMember,
    getMemberById: (memberId: MemberId) => {
      return getMemberById(state, memberId);
    },
    apiCallStatus
  };
};

const mergeProps: MergeProps<
  StateProps,
  DispatchProps,
  OwnProps,
  MergedProps
> = (stateProps, dispatchProps, ownProps) => {
  return {
    ...stateProps,
    give: (amount: Big, memo: string, toMemberId: string) =>
      dispatchProps.give(ownProps.identifier, toMemberId, amount, memo),
    ...ownProps
  };
};

export const GiveForm = connect(
  mapStateToProps,
  { give },
  mergeProps
)(GiveFormView);

const containerStyle: ViewStyle = {
  flex: 1 // grow to maximum size
};

const giveButtonRowStyle: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  marginBottom: 16
};

const styles = StyleSheet.create({
  container: containerStyle,
  section: {
    marginTop: 16
  },

  toRow: {
    flexDirection: "row",
    alignItems: "baseline"
  },

  searchBar: {
    flexGrow: 1
  },

  selectedMember: {
    backgroundColor: colors.lightAccent,
    padding: 4,
    borderRadius: 3
  },

  helper: {
    color: "gray"
  },
  giveButtonRow: giveButtonRowStyle
});
