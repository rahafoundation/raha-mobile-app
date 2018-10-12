import * as React from "react";
import { NavigationScreenProps } from "react-navigation";
import { Member } from "../../../store/reducers/members";
import Icon from "react-native-vector-icons/FontAwesome5";
import { View } from "react-native";
import { connect, MapStateToProps } from "react-redux";

import {
  Operation,
  FlagMemberOperation,
  OperationType
} from "@raha/api-shared/dist/models/Operation";
import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";
import {
  MemberId,
  OperationId
} from "@raha/api-shared/dist/models/identifiers";

import { RahaState } from "../../../store";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../../store/reducers/apiCalls";
import { getLoggedInMember } from "../../../store/selectors/authentication";
import { getStatusOfApiCall } from "../../../store/selectors/apiCalls";
import { resolveFlagMember } from "../../../store/actions/members";
import { getMemberById } from "../../../store/selectors/members";
import { KeyboardAwareScrollContainer } from "../../shared/elements/KeyboardAwareScrollContainer";
import { Text, Button, TextInput } from "../../shared/elements";
import { styles as sharedStyles } from "./styles";
import { canFlag } from "../../../store/selectors/abilities";
import { CreateRahaOperationButton } from "../../shared/elements/CreateRahaOperationButton";

type NavProps = NavigationScreenProps<{
  flagToResolveOperation: Operation;
  apiCallId: string;
}>;

type OwnProps = NavProps;

interface StateProps {
  loggedInMember: Member;
  isOwnProfile: boolean;
  canFlag: boolean;
  memberOnWhichToResolveFlag: Member;
  flagToResolveOperation: FlagMemberOperation;
  flaggingMember: Member;
  apiCallId: string;
  resolveFlagApiCallStatus?: ApiCallStatus;
}

interface DispatchProps {
  resolveFlagMember: (
    memberId: MemberId,
    flagOperationId: OperationId,
    reason: string,
    apiCallId: string
  ) => void;
}

type Props = OwnProps & StateProps & DispatchProps;

interface State {
  reviewedInfo: boolean;
  reason?: string;
}

class ResolveFlagMemberPageComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      reviewedInfo: false
    };
  }

  continue = () => {
    this.setState({ reviewedInfo: true });
  };

  renderInfo = () => {
    return (
      <React.Fragment>
        <View style={sharedStyles.section}>
          <Text style={sharedStyles.infoText}>
            Resolving this flag will indicate that you believe this issue has
            been fixed.
          </Text>
        </View>
        <View style={sharedStyles.section}>
          {this.props.isOwnProfile ? (
            <Text style={sharedStyles.error}>
              You cannot resolve a flag on your own profile. Make sure you've
              addressed the issue, and then ask another Raha member to resolve
              the flag for you.
            </Text>
          ) : this.props.canFlag ? (
            <Button
              title="Continue"
              onPress={this.continue}
              style={sharedStyles.button}
            />
          ) : (
            <Text style={sharedStyles.error}>
              You must be verified by at least 5 other Raha members to resolve
              this flag, and your own account cannot currently be flagged.
            </Text>
          )}
        </View>
      </React.Fragment>
    );
  };

  flagMember = async () => {
    this.props.resolveFlagMember(
      this.props.memberOnWhichToResolveFlag.get("memberId"),
      this.props.flagToResolveOperation.id,
      this.state.reason as string,
      this.props.apiCallId
    );
  };

  renderResolveFlagForm = (flaggedMemberName: string) => {
    const { resolveFlagApiCallStatus } = this.props;
    const disableResolveFlagButton =
      !!resolveFlagApiCallStatus &&
      resolveFlagApiCallStatus.status !== ApiCallStatusType.FAILURE;
    const resolvedFlag =
      !!resolveFlagApiCallStatus &&
      resolveFlagApiCallStatus.status === ApiCallStatusType.SUCCESS;
    const resolveFlagButtonTitle = disableResolveFlagButton
      ? resolvedFlag
        ? "Resolved flag"
        : "Resolving flag"
      : "Resolve flag";

    return (
      <React.Fragment>
        <View style={sharedStyles.section}>
          <Text style={sharedStyles.infoHeader}>
            How has this issue with{" "}
            <Text style={sharedStyles.name}>{flaggedMemberName}</Text>
            's account been fixed?
          </Text>
        </View>
        <View style={sharedStyles.section}>
          <TextInput
            autoFocus={true}
            onChangeText={value => this.setState({ reason: value })}
            editable={!resolvedFlag}
            style={sharedStyles.textInput}
          />
        </View>
        <View style={sharedStyles.section}>
          <CreateRahaOperationButton
            operationType={OperationType.RESOLVE_FLAG_MEMBER}
            title={resolveFlagButtonTitle}
            disabled={!this.state.reason || disableResolveFlagButton}
            onPress={this.flagMember}
          />
        </View>
        {resolvedFlag && (
          <View style={sharedStyles.section}>
            <Button
              title="Return"
              onPress={() => this.props.navigation.goBack()}
            />
          </View>
        )}
      </React.Fragment>
    );
  };

  render() {
    const {
      flaggingMember,
      memberOnWhichToResolveFlag,
      flagToResolveOperation
    } = this.props;
    const flaggingMemberName = flaggingMember.get("fullName");
    const flaggedMemberName = memberOnWhichToResolveFlag.get("fullName");
    return (
      <KeyboardAwareScrollContainer style={sharedStyles.page}>
        <View style={sharedStyles.header}>
          <Icon name="flag" size={50} />
          <Text style={sharedStyles.headerText}>
            Resolve flag on {flaggedMemberName}
            's Account
          </Text>
        </View>
        <View style={sharedStyles.section}>
          <Text style={sharedStyles.infoText}>
            <Text style={sharedStyles.name}>{flaggingMemberName}</Text> flagged{" "}
            <Text style={sharedStyles.name}>{flaggedMemberName}</Text>
            's account for the following reason:
          </Text>
        </View>
        <View style={[sharedStyles.section, sharedStyles.flagNotice]}>
          <Text style={[sharedStyles.infoText]}>
            {flagToResolveOperation.data.reason}
          </Text>
        </View>
        {this.state.reviewedInfo
          ? this.renderResolveFlagForm(flaggedMemberName)
          : this.renderInfo()}
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
    throw new Error("User must be logged to ResolveFlagMember page.");
  }
  const loggedInMemberId = loggedInMember.get("memberId");
  const { navigation } = ownProps;
  const flagToResolveOperation = navigation.getParam(
    "flagToResolveOperation"
  ) as FlagMemberOperation | undefined;
  if (!flagToResolveOperation) {
    throw new Error(
      "No flagToResolveOperation was passed to ResolveFlagMember page."
    );
  }
  const memberOnWhichToResolveFlag = getMemberById(
    state,
    flagToResolveOperation.data.to_uid,
    { throwIfMissing: true }
  );
  const flaggingMember = getMemberById(
    state,
    flagToResolveOperation.creator_uid,
    { throwIfMissing: true }
  );
  const apiCallId = ownProps.navigation.getParam("apiCallId");
  if (!apiCallId) {
    throw new Error(
      "No apiCallId passed as navigation parameter to ResolveFlagMember page."
    );
  }
  return {
    loggedInMember,
    isOwnProfile: loggedInMemberId === flagToResolveOperation.data.to_uid,
    canFlag: canFlag(state, loggedInMemberId),
    flaggingMember,
    memberOnWhichToResolveFlag,
    flagToResolveOperation,
    apiCallId,
    resolveFlagApiCallStatus: getStatusOfApiCall(
      state,
      ApiEndpointName.RESOLVE_FLAG_MEMBER,
      apiCallId
    )
  };
};

export const ResolveFlagMemberPage = connect(
  mapStateToProps,
  { resolveFlagMember }
)(ResolveFlagMemberPageComponent);
