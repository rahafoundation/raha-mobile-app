import * as React from "react";
import {
  StyleSheet,
  View,
  Image,
  TextStyle,
  ViewStyle,
  ScrollView,
  ImageStyle
} from "react-native";
import { connect, MapStateToProps, MergeProps } from "react-redux";

import { MemberId } from "@raha/api-shared/dist/models/identifiers";

import { Member } from "../../store/reducers/members";
import { RahaState } from "../../store";
import { RouteName } from "../shared/navigation";
import {
  getLoggedInMember,
  getLoggedInMemberId
} from "../../store/selectors/authentication";
import { NavigationScreenProps } from "react-navigation";
import {
  getUnclaimedReferrals,
  getMintableAmount,
  getMintableBasicIncomeAmount,
  getMintableInvitedBonus
} from "../../store/selectors/me";
import { MintButton } from "../shared/MintButton";
import { Button, Text } from "../shared/elements";
import { colors } from "../../helpers/colors";
import {
  Currency,
  CurrencyRole,
  CurrencyType
} from "../shared/elements/Currency";
import { fontSizes, fonts } from "../../helpers/fonts";
import { TextLink, LinkType } from "../shared/elements/TextLink";
import { Big } from "big.js";
import { MixedText } from "../shared/elements/MixedText";
import { FlaggedNotice } from "../shared/Cards/FlaggedNotice";
import { EnforcePermissionsButton } from "../shared/elements/EnforcePermissionsButton";
import { OperationType } from "@raha/api-shared/dist/models/Operation";
import { Config } from "@raha/api-shared/dist/helpers/Config";
import { mintBasicIncome } from "../../store/actions/wallet";
import { getStatusOfApiCall } from "../../store/selectors/apiCalls";
import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../store/reducers/apiCalls";

type OwnProps = NavigationScreenProps<{}>;
type StateProps = {
  loggedInMember: Member;
  mintableBasicIncome: Big;
  mintableInvitedBonus: Big;
  unclaimedReferralIds?: MemberId[];
  mintApiCallStatus?: ApiCallStatus;
};
interface DispatchProps {
  mintBasicIncome: typeof mintBasicIncome;
}
interface MergedProps {
  mint: () => void;
}
type Props = OwnProps & StateProps & MergedProps;

type MoneyProps = {
  mintInProgress: boolean;
  totalDonated: Big;
  balance: Big;
};

const MoneySection: React.StatelessComponent<MoneyProps> = ({
  mintInProgress,
  totalDonated,
  balance
}) => {
  return (
    <React.Fragment>
      <View style={styles.financesSection}>
        <View>
          <Currency
            style={[styles.balanceValue, mintInProgress && { opacity: 0.5 }]}
            currencyValue={{
              value: balance,
              role: CurrencyRole.Transaction,
              currencyType: CurrencyType.Raha
            }}
          />
          <Text style={styles.numberLabel}>balance</Text>
        </View>
        <View style={styles.donationSection}>
          <View>
            <Currency
              style={styles.donationValue}
              currencyValue={{
                value: totalDonated,
                role: CurrencyRole.Donation,
                currencyType: CurrencyType.Raha
              }}
            />
            <Text style={styles.numberLabel}>donated</Text>
          </View>
        </View>
      </View>
    </React.Fragment>
  );
};

type ActionProps = Props & {
  mintAndStartAnim: () => void;
  mintingProgress: Big;
  animInProgress: boolean;
  mintableInvitedBonus: Big;
};

const Actions: React.StatelessComponent<ActionProps> = props => {
  const {
    animInProgress,
    loggedInMember,
    mintableBasicIncome,
    unclaimedReferralIds,
    navigation,
    mintingProgress,
    mintableInvitedBonus,
    mintAndStartAnim
  } = props;
  if (!loggedInMember.get("isVerified")) {
    return (
      <View style={[styles.actionsSection, { justifyContent: "center" }]}>
        <Text style={styles.actionsSectionGetVerifiedTextBlock}>
          You must be verified before you can mint Raha or invite new people.
        </Text>
        <Text style={styles.actionsSectionGetVerifiedTextBlock}>
          If you already know someone else in the Raha network, ask them to
          verify your account.
        </Text>
        <Text style={styles.actionsSectionGetVerifiedTextBlock}>
          Otherwise, the Raha team is currently helping those who aren't
          connected to other people in the network get verified. Email us at{" "}
          <TextLink
            destination={{
              type: LinkType.Website,
              url: "mailto:hello@raha.app"
            }}
          >
            hello@raha.app
          </TextLink>
          !
        </Text>
      </View>
    );
  }

  const hasUnclaimedReferrals = unclaimedReferralIds
    ? unclaimedReferralIds.length > 0
    : false;

  // Show one action at a time: Mint or Invite.
  const canMint = mintableBasicIncome && mintableBasicIncome.gt(0);
  return (
    <View style={styles.actionsSection}>
      <FlaggedNotice restrictedFrom="minting" />
      {canMint ? (
        <MintButton
          mintInProgress={animInProgress}
          displayAmount={mintableBasicIncome.minus(mintingProgress)}
          mintableInvitedBonus={mintableInvitedBonus}
          mintAndStartAnim={mintAndStartAnim}
          style={styles.mintButton}
        />
      ) : (
        <Invite {...props} />
      )}
      {hasUnclaimedReferrals && (
        <EnforcePermissionsButton
          operationType={OperationType.MINT}
          style={styles.button}
          title={"Mint Invite Bonuses!"}
          onPress={() => {
            navigation.push(RouteName.ReferralBonusPage, {
              unclaimedReferralIds
            });
          }}
        />
      )}
      <View style={styles.pushDownSpacer} />
      <Image
        resizeMode="contain"
        style={styles.actionImage}
        source={require("../../assets/img/Mint.png")}
      />
    </View>
  );
};

const Invite: React.StatelessComponent<Props> = props => {
  const { navigation } = props;

  return (
    <React.Fragment>
      <View style={styles.section}>
        <Button
          style={styles.button}
          disabled={true}
          onPress={() => {}}
          title={"Come back soon to mint your basic income"}
        />
      </View>
      <View style={[styles.section, styles.sectionSpacer]}>
        <Text style={styles.header}>Want to mint more Raha?</Text>
        <MixedText
          content={[
            "Earn",
            {
              currencyType: CurrencyType.Raha,
              value: Config.getReferralBonus(),
              role: CurrencyRole.Transaction
            },
            "when friends you invite join Raha."
          ]}
        />
        <EnforcePermissionsButton
          operationType={OperationType.INVITE}
          style={styles.button}
          title="Invite a Friend"
          onPress={() => {
            navigation.push(RouteName.InvitePage);
          }}
        />
      </View>
    </React.Fragment>
  );
};

// function nextApiCallHasChanged(
//   nextApiCallStatus: ApiCallStatus,
//   currApiCallStatus?: ApiCallStatus
// ) {}
const MINTING_ANIM_DURATION_MS = 1800;

class WalletView extends React.Component<
  Props,
  { mintingProgress: Big; animInProgress: boolean }
> {
  state = {
    mintingProgress: Big(0),
    animInProgress: false
  };

  _animationFrame = 0;
  _animationStart = null as number | null;

  static easeInOutQuad(t: number) {
    return t < 0.5 ? 0.1 * t * t * t : -1 + (4 - 2 * t) * t;
  }

  // componentDidMount() {
  //   this._mintingAnim.addListener(progress => {
  //     const mintingProgress = Big(progress.value).round(2);
  //     if (!this.state.mintingProgress.eq(mintingProgress)) {
  //       this.setState({ mintingProgress });
  //     }
  //   });
  // }
  mintAndStartAnim = () => {
    this.props.mint();
    requestAnimationFrame(this.animationCallback);
  };

  animationCallback = (timeMillis: number) => {
    if (this._animationStart === null) {
      this._animationStart = timeMillis;
      this.setState({ animInProgress: true });
    }
    const progress =
      (timeMillis - this._animationStart) / MINTING_ANIM_DURATION_MS;
    if (progress >= 1.0) {
      this._animationStart = null;
      this.setState({ mintingProgress: Big(0), animInProgress: false });
      return;
    }
    const mintingProgress = this.props.mintableBasicIncome
      .times(WalletView.easeInOutQuad(progress))
      .round(2);
    console.log("minting prog:", mintingProgress);
    if (!this.state.mintingProgress.eq(mintingProgress)) {
      this.setState({ mintingProgress });
    }
    this._animationFrame = requestAnimationFrame(this.animationCallback);
  };

  // componentDidUpdate(prevProps: Props) {
  //   const mintApiCallStatus = this.props.mintApiCallStatus;
  //   if (
  //     !mintApiCallStatus ||
  //     mintApiCallStatus === prevProps.mintApiCallStatus
  //   ) {
  //     return;
  //   }
  //   if (mintApiCallStatus.status === ApiCallStatusType.STARTED) {
  //     this._animationFrame = requestAnimationFrame(this.animationCallback);
  //   }
  // }

  componentWillUnmount() {
    cancelAnimationFrame(this._animationFrame);
  }

  render() {
    const { mintingProgress, animInProgress } = this.state;
    const actionProps = {
      ...this.props,
      animInProgress,
      mintingProgress,
      mintAndStartAnim: this.mintAndStartAnim
    };
    return (
      <ScrollView bounces={false} contentContainerStyle={styles.page}>
        <MoneySection
          balance={this.props.loggedInMember
            .get("balance")
            .plus(mintingProgress)}
          mintInProgress={animInProgress || mintingProgress.gt(0)}
          totalDonated={this.props.loggedInMember.get("totalDonated")}
        />
        <Actions {...actionProps} />
      </ScrollView>
    );
  }
}

const donationTextStyle: TextStyle = {
  ...fontSizes.xlarge
};

const balanceTextStyle: TextStyle = {
  ...fontSizes.xlarge
};

const numberLabelStyle: TextStyle = {
  color: colors.bodyText,
  ...fontSizes.small
};

const buttonStyle: ViewStyle = {
  marginVertical: 12
};

const sectionStyle: ViewStyle = {
  flexDirection: "column",
  alignItems: "stretch"
};

// shared to create consistent spacing
const sectionSpacerStyle: ViewStyle = {
  marginTop: 15
};

// pushes content on mint page down so image shows up on bottom rather than
// right after mint button.
const pushDownSpacerStyle: ViewStyle = {
  flex: 1
};

const financesSectionStyle: ViewStyle = {
  flex: 0, // don't expand to fill space
  alignSelf: "stretch", // take full width
  marginBottom: 10,

  // balance on left side, other financial info pushed to right.
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"
};

const donationSectionStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center"
};
const mintButtonStyle: ViewStyle = { ...sectionSpacerStyle, ...buttonStyle };

const pageStyle: ViewStyle = {
  backgroundColor: colors.pageBackground,
  minHeight: "100%",
  padding: 20,
  flexDirection: "column",
  alignItems: "center"
};

const actionsSectionStyle: ViewStyle = {
  ...sectionSpacerStyle,
  ...sectionStyle,
  flex: 1
};

const actionsSectionGetVerifiedTextBlockStyle: TextStyle = {
  textAlign: "center",
  margin: 12
};

const actionImageStyle: ImageStyle = {
  marginTop: 8,
  flex: -1, // allow the image to shrink up to the min height
  flexBasis: 200,
  maxHeight: 200,
  minHeight: 150,
  maxWidth: "100%"
};

const headerStyle: TextStyle = {
  ...fonts.Lato.Semibold,
  ...fontSizes.large,
  textAlign: "center",
  marginBottom: 14
};

const styles = StyleSheet.create({
  page: pageStyle,
  sectionSpacer: sectionSpacerStyle,
  section: sectionStyle,
  mintButton: mintButtonStyle,
  financesSection: financesSectionStyle,
  donationSection: donationSectionStyle,
  actionImage: actionImageStyle,
  actionsSection: actionsSectionStyle,
  actionsSectionGetVerifiedTextBlock: actionsSectionGetVerifiedTextBlockStyle,
  balanceValue: balanceTextStyle,
  donationValue: donationTextStyle,
  numberLabel: numberLabelStyle,
  header: headerStyle,
  pushDownSpacer: pushDownSpacerStyle,
  button: buttonStyle
});

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  RahaState
> = state => {
  const loggedInMember = getLoggedInMember(state);
  if (!loggedInMember) {
    // TODO: gracefully deal with this situation.
    throw Error("Member not logged in, should not have gotten here.");
  }
  const loggedInMemberId = loggedInMember.get("memberId");
  return {
    loggedInMember,
    mintableBasicIncome: Big(40), //getMintableBasicIncomeAmount(state, loggedInMemberId),
    unclaimedReferralIds: getUnclaimedReferrals(state, loggedInMemberId),
    mintableInvitedBonus: getMintableInvitedBonus(state, loggedInMember),
    mintApiCallStatus: getStatusOfApiCall(
      state,
      ApiEndpointName.MINT,
      loggedInMemberId
    )
  };
};

const mergeProps: MergeProps<
  StateProps,
  DispatchProps,
  OwnProps,
  MergedProps
> = (stateProps, dispatchProps, ownProps) => {
  const { loggedInMember, mintableBasicIncome } = stateProps;
  return {
    ...stateProps,
    mint: () =>
      loggedInMember
        ? dispatchProps.mintBasicIncome(
            loggedInMember.get("memberId"),
            mintableBasicIncome
          )
        : {},
    ...ownProps
  };
};

export const Wallet = connect(
  mapStateToProps,
  { mintBasicIncome },
  mergeProps
)(WalletView);
