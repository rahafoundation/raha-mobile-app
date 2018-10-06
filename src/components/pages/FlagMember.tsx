import * as React from "react";
import { KeyboardAwareScrollContainer } from "../shared/elements/KeyboardAwareScrollContainer";
import { Text, Button, TextInput } from "../shared/elements";
import { NavigationScreenProps } from "react-navigation";
import { Member } from "../../store/reducers/members";
import Icon from "react-native-vector-icons/FontAwesome5";
import { TextStyle, StyleSheet, ViewStyle, View } from "react-native";
import { colors } from "../../helpers/colors";
import { fonts, fontSizes } from "../../helpers/fonts";
import { connect, MapStateToProps } from "react-redux";
import { RahaState } from "../../store";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../store/reducers/apiCalls";
import { getLoggedInMember } from "../../store/selectors/authentication";
import { getStatusOfApiCall } from "../../store/selectors/apiCalls";
import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";
import { flagMember } from "../../store/actions/members";

type NavProps = NavigationScreenProps<{
  memberToFlag: Member;
  apiCallId: string;
}>;

type OwnProps = NavProps;

interface StateProps {
  loggedInMember: Member;
  memberToFlag: Member;
  apiCallId: string;
  flagApiCallStatus?: ApiCallStatus;
}

interface DispatchProps {
  flagMember: (memberId: MemberId, reason: string, apiCallId: string) => void;
}

type Props = OwnProps & StateProps & DispatchProps;

interface State {
  reviewedInfo: boolean;
  reason?: string;
}

class FlagMemberPageComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      reviewedInfo: false
    };
  }

  continue = () => {
    this.setState({ reviewedInfo: true });
  };

  renderInfo = (memberName: string) => {
    return (
      <React.Fragment>
        <View style={styles.section}>
          <Text style={styles.infoText}>
            Flag <Text style={styles.name}>{memberName}</Text>
            's account to let people know there's an issue with it.{" "}
            <Text style={styles.infoHeader}>They will:</Text>
          </Text>
          <Text style={[styles.infoText, styles.infoListItem]}>
            Be notified that you have flagged their account.{" "}
          </Text>
          <Text style={[styles.infoText, styles.infoListItem]}>
            Show up as flagged to all other Raha members.
          </Text>
          <Text style={[styles.infoText, styles.infoListItem]}>
            Be unable to perform any actions other than editing their account
            until another Raha member marks this issue as resolved.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.infoHeader}>
            Examples of reasons to flag an account:
          </Text>
          <Text style={[styles.infoText, styles.infoListItem]}>
            Their profile name is incorrect.
          </Text>
          <Text style={[styles.infoText, styles.infoListItem]}>
            They do not show their face and state their full name in their
            profile video.
          </Text>
          <Text style={[styles.infoText, styles.infoListItem]}>
            This appears to be a fraudulent or duplicate profile.
          </Text>
        </View>
        <View style={styles.section}>
          <Button
            title="Continue"
            onPress={this.continue}
            style={styles.button}
          />
        </View>
      </React.Fragment>
    );
  };

  flagMember = async () => {
    this.props.flagMember(
      this.props.memberToFlag.get("memberId"),
      this.state.reason as string,
      this.props.apiCallId
    );
  };

  renderFlagForm = (memberName: string) => {
    const { flagApiCallStatus } = this.props;
    const disableFlagButton =
      !!flagApiCallStatus &&
      flagApiCallStatus.status !== ApiCallStatusType.FAILURE;
    const flaggedAccount =
      !!flagApiCallStatus &&
      flagApiCallStatus.status === ApiCallStatusType.SUCCESS;
    const flagButtonTitle = disableFlagButton
      ? flaggedAccount
        ? "Flagged account"
        : "Flagging account"
      : "Flag account";

    return (
      <React.Fragment>
        <View style={styles.section}>
          <Text>
            Reason for flagging <Text style={styles.name}>{memberName}</Text>
            's account:
          </Text>
        </View>
        <View style={styles.section}>
          <TextInput
            autoFocus={true}
            onChangeText={value => this.setState({ reason: value })}
            editable={!flaggedAccount}
            style={styles.textInput}
          />
        </View>
        <View style={styles.section}>
          <Button
            title={flagButtonTitle}
            disabled={!this.state.reason || disableFlagButton}
            onPress={this.flagMember}
          />
        </View>
        {flaggedAccount && (
          <View style={styles.section}>
            <Button
              title="return"
              onPress={() => this.props.navigation.goBack()}
            />
          </View>
        )}
      </React.Fragment>
    );
  };

  render() {
    const memberName = this.props.memberToFlag.get("fullName");
    return (
      <KeyboardAwareScrollContainer style={styles.page}>
        <View style={styles.header}>
          <Icon name="flag" size={50} />
          <Text style={styles.headerText}>
            Flag {memberName}
            's Account
          </Text>
        </View>
        {this.state.reviewedInfo
          ? this.renderFlagForm(memberName)
          : this.renderInfo(memberName)}
      </KeyboardAwareScrollContainer>
    );
  }
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const loggedInMember = getLoggedInMember(state);
  if (!loggedInMember) {
    throw new Error("User must be logged to flag account.");
  }
  const { navigation } = ownProps;
  const memberToFlag = navigation.getParam("memberToFlag");
  if (!memberToFlag) {
    throw new Error("No member was passed to the Flag page.");
  }
  const apiCallId = ownProps.navigation.getParam("apiCallId");
  if (!apiCallId) {
    throw new Error(
      "No apiCallId passed as navigation parameter when flagging account."
    );
  }
  return {
    loggedInMember,
    memberToFlag,
    apiCallId,
    flagApiCallStatus: getStatusOfApiCall(
      state,
      ApiEndpointName.FLAG_MEMBER,
      apiCallId
    )
  };
};

export const FlagMemberPage = connect(
  mapStateToProps,
  { flagMember }
)(FlagMemberPageComponent);

const PageStyle: ViewStyle = {
  backgroundColor: colors.pageBackground,
  padding: 16,
  display: "flex",
  alignContent: "center",
  flexGrow: 1
};

const HeaderStyle: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "wrap"
};

const HeaderTextStyle: TextStyle = {
  marginLeft: 16,
  ...fonts.Lato.Bold,
  ...fontSizes.large
};

const SectionStyle: ViewStyle = {
  marginTop: 16
};

const NameStyle: TextStyle = { ...fonts.Lato.Bold };

const InfoHeaderStyle: TextStyle = {
  ...fonts.Lato.Bold
};

const InfoTextStyle: TextStyle = {
  ...fonts.Lato.Normal,
  ...fontSizes.medium
};

const InfoListItemStyle: TextStyle = {
  marginTop: 4,
  marginLeft: 8
};

const ButtonStyle: ViewStyle = {
  flexShrink: 1
};

const TextInputStyle: TextStyle = {
  borderColor: colors.navFocusTint,
  borderWidth: 1,
  borderRadius: 3,
  flexGrow: 1
};

const styles = StyleSheet.create({
  page: PageStyle,
  header: HeaderStyle,
  headerText: HeaderTextStyle,
  section: SectionStyle,
  name: NameStyle,
  infoHeader: InfoHeaderStyle,
  infoText: InfoTextStyle,
  infoListItem: InfoListItemStyle,
  button: ButtonStyle,
  textInput: TextInputStyle
});
