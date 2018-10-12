import * as React from "react";
import { NavigationScreenProps } from "react-navigation";
import { Member } from "../../../store/reducers/members";
import Icon from "react-native-vector-icons/FontAwesome5";
import { View } from "react-native";
import { connect, MapStateToProps } from "react-redux";

import {
  Operation,
  FlagMemberOperation
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

type NavProps = NavigationScreenProps<{
  flagToResolveOperation: Operation;
  apiCallId: string;
}>;

type OwnProps = NavProps;

interface StateProps {
  loggedInMember: Member;
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
          <Button
            title="Continue"
            onPress={this.continue}
            style={sharedStyles.button}
          />
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
            How the issue with{" "}
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
          <Button
            title={resolveFlagButtonTitle}
            disabled={!this.state.reason || disableResolveFlagButton}
            onPress={this.flagMember}
          />
        </View>
        {resolvedFlag && (
          <View style={sharedStyles.section}>
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
