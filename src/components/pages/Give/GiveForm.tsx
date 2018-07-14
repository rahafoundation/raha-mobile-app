import { Big } from "big.js";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import {
  FormLabel,
  FormInput,
  FormValidationMessage
} from "react-native-elements";
import { connect, MapStateToProps, MergeProps } from "react-redux";

import { ApiEndpointName } from "@raha/api/dist/shared/types/ApiEndpoint";
import { MemberId } from "@raha/api/dist/shared/models/identifiers";

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
import { Button, Container, Text } from "../../shared/elements";

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
      amount.lte(this.props.loggedInMember.balance)
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
      this.props.loggedInMember.memberId !== this.state.toMember.memberId
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
      this.props.give(amount, memo, toMember.memberId);
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

  public render() {
    return (
      <Container style={styles.container}>
        <View style={styles.toRow}>
          {this.state.toMember ? (
            <React.Fragment>
              <FormLabel>To:</FormLabel>
              <View style={styles.selectedMember}>
                <Text onPress={this.clearTo}>
                  {this.state.toMember.fullName} ({this.state.toMember.username})
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
            {this.state.toMember.fullName} is currently donating {DONATION_RATE}%
            of all Raha they receive back to the Raha basic income pool. This
            donation will be used to fund future basic income distributions for
            everyone in the Raha network.
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
              ? this.props.loggedInMember.balance.toString()
              : 0}{" "}
            Raha
          </FormValidationMessage>
        </View>
        <View>
          <FormLabel>Message</FormLabel>
          <FormInput
            value={this.state.memo}
            onChangeText={this.onChangeMemo}
            multiline={true}
            placeholder="for being so amazing!"
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
            You will give {this.state.amount.toString()} Raha to{" "}
            {this.state.toMember.fullName}
            {this.state.memo ? ` ${this.state.memo}` : ""}.
          </FormValidationMessage>
        ) : (
          <React.Fragment />
        )}
        <View style={styles.section}>
          <Button
            title="Give"
            onPress={this.giveRaha}
            disabled={
              !this.validateForm() ||
              (this.props.apiCallStatus &&
                this.props.apiCallStatus.status === ApiCallStatusType.STARTED)
            }
            buttonStyle={{ backgroundColor: "#2196F3" }}
            //@ts-ignore Because Button does have a rounded property
            rounded
          />
        </View>
      </Container>
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

const styles = StyleSheet.create({
  container: {
    padding: 8
  },

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
    backgroundColor: "#64B5F6",
    padding: 4,
    borderRadius: 3
  },

  helper: {
    color: "gray"
  }
});
