import * as React from "react";
import { MapStateToProps, connect } from "react-redux";
import { View, TextStyle, ViewStyle } from "react-native";
import { withNavigation, NavigationInjectedProps } from "react-navigation";

import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";

import { RahaState } from "../../../store";
import { Member } from "../../../store/reducers/members";
import { getLoggedInMember } from "../../../store/selectors/authentication";
import { KeyboardAwareScrollContainer } from "../../shared/elements/KeyboardAwareScrollContainer";
import { Text, Button, TextInput } from "../../shared/elements";
import { Loading } from "../../shared/Loading";
import { styles as commonStyles } from "./styles";
import { getUsername } from "../../../helpers/username";
import { fonts } from "../../../helpers/fonts";
import { colors } from "../../../helpers/colors";
import { editMember } from "../../../store/actions/me";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../../store/reducers/apiCalls";
import { getStatusOfApiCall } from "../../../store/selectors/apiCalls";

interface OwnProps {}

interface StateProps {
  loggedInMember: Member;
  editMemberApiCallStatus?: ApiCallStatus;
}

interface DispatchProps {
  editMember: (
    loggedInMemberId: MemberId,
    fullName?: string,
    username?: string
  ) => void;
}

type Props = OwnProps & StateProps & DispatchProps & NavigationInjectedProps;

interface State {
  username: string;
  fullName: string;
}

class EditMemberPageView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { loggedInMember } = this.props;
    this.state = {
      username: loggedInMember.get("username"),
      fullName: loggedInMember.get("fullName")
    };
  }

  canUpdate() {
    const { loggedInMember } = this.props;
    const currentFullName = loggedInMember.get("fullName");
    const { fullName } = this.state;
    if (!fullName || currentFullName === fullName) {
      return false;
    }
    return true;
  }

  onChangeFullName = (newName: string) => {
    const { loggedInMember } = this.props;
    const currentUsername = loggedInMember.get("username");
    const currentFullName = loggedInMember.get("fullName");

    if (newName === currentFullName) {
      this.setState({
        fullName: newName,
        username: currentUsername
      });
    } else {
      this.setState({
        fullName: newName,
        username: getUsername(newName)
      });
    }
  };

  onSubmitUpdate = () => {
    if (this.canUpdate()) {
      const { loggedInMember, editMember } = this.props;
      const { fullName, username } = this.state;
      editMember(loggedInMember.get("memberId"), fullName, username);
    }
  };

  render() {
    const { loggedInMember, navigation, editMemberApiCallStatus } = this.props;
    if (!loggedInMember) {
      return <Loading />;
    }

    const apiCallStatus =
      editMemberApiCallStatus && editMemberApiCallStatus.status;

    const disableGoBackButton = apiCallStatus === ApiCallStatusType.STARTED;
    const goBackButtonTitle =
      apiCallStatus === ApiCallStatusType.SUCCESS ? "Return" : "Cancel";

    const disableUpdateButton =
      !this.canUpdate() ||
      apiCallStatus === ApiCallStatusType.STARTED ||
      apiCallStatus === ApiCallStatusType.SUCCESS;
    const updateButtonPrefix =
      apiCallStatus === ApiCallStatusType.STARTED
        ? "Updating"
        : apiCallStatus === ApiCallStatusType.SUCCESS
          ? "Updated"
          : "Update";
    const updateButtonTitle = `${updateButtonPrefix} profile details`;

    return (
      <KeyboardAwareScrollContainer style={commonStyles.page}>
        <Text style={[commonStyles.row, styles.header]}>Full name</Text>
        <View style={commonStyles.row}>
          {apiCallStatus === ApiCallStatusType.SUCCESS ? (
            <Text>{this.state.fullName}</Text>
          ) : (
            <TextInput
              value={this.state.fullName}
              onChangeText={this.onChangeFullName}
              style={styles.textBox}
            />
          )}
        </View>
        <Text style={[commonStyles.row, styles.header]}>
          Username (auto-generated from name)
        </Text>
        <View style={commonStyles.row}>
          <Text>{this.state.username}</Text>
        </View>
        <View style={commonStyles.row}>
          <Button
            title={goBackButtonTitle}
            disabled={disableGoBackButton}
            onPress={() => navigation.goBack()}
            style={styles.button}
          />
          <Button
            title={updateButtonTitle}
            disabled={disableUpdateButton}
            onPress={this.onSubmitUpdate}
            style={styles.button}
          />
        </View>
      </KeyboardAwareScrollContainer>
    );
  }
}

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  RahaState
> = state => {
  const loggedInMember = getLoggedInMember(state);
  if (!loggedInMember) {
    throw Error("Attempting to edit member with no logged-in member.");
  }
  return {
    loggedInMember,
    editMemberApiCallStatus: getStatusOfApiCall(
      state,
      ApiEndpointName.EDIT_MEMBER,
      loggedInMember.get("memberId")
    )
  };
};

export const EditMemberPage = connect(
  mapStateToProps,
  { editMember }
)(withNavigation<Props>(EditMemberPageView));

const textBoxStyle: TextStyle = {
  borderColor: colors.navFocusTint,
  borderWidth: 1,
  borderRadius: 3,
  flex: 1
};

const headerStyle: TextStyle = {
  ...fonts.Lato.Bold
};

const buttonStyle: ViewStyle = {
  flexGrow: 1,
  margin: 4
};

const styles = {
  textBox: textBoxStyle,
  header: headerStyle,
  button: buttonStyle
};
