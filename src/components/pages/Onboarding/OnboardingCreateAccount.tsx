import * as React from "react";
import { View, ScrollView } from "react-native";
import { connect, MapStateToProps } from "react-redux";

import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";
import { OperationType } from "@raha/api-shared/dist/models/Operation";

import { getUsername } from "../../../helpers/username";
import { RahaState } from "../../../store";
import { createMember } from "../../../store/actions/members";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../../store/reducers/apiCalls";
import { getStatusOfApiCall } from "../../../store/selectors/apiCalls";
import { Text, IndependentPageContainer } from "../../shared/elements";
import { styles } from "./styles";
import { TextLink, LinkType } from "../../shared/elements/TextLink";
import { EnforcePermissionsButton } from "../../shared/elements/EnforcePermissionsButton";

type ReduxStateProps = {
  createMemberStatus?: ApiCallStatus;
};

type DispatchProps = {
  createMember: (
    fullName: string,
    emailAddress: string,
    username: string,
    videoToken: string,
    inviteToken?: string,
    subscribeToNewsletter?: boolean
  ) => void;
};

type OwnProps = {
  verifiedName: string;
  emailAddress: string;
  videoToken: string;
  inviteToken?: string;
  subscribeToNewsletter: boolean;
};

type OnboardingCreateAccountProps = OwnProps & ReduxStateProps & DispatchProps;

class OnboardingCreateAccountView extends React.Component<
  OnboardingCreateAccountProps
> {
  constructor(props: OnboardingCreateAccountProps) {
    super(props);
  }

  createAccount = () => {
    const username = getUsername(this.props.verifiedName);
    this.props.createMember(
      this.props.verifiedName,
      this.props.emailAddress,
      username,
      this.props.videoToken,
      this.props.inviteToken,
      this.props.subscribeToNewsletter
    );
  };

  private _renderRequestingStatus = () => {
    const status = this.props.createMemberStatus;
    const statusType = status ? status.status : undefined;
    switch (statusType) {
      case ApiCallStatusType.STARTED:
        return <Text style={styles.paragraph}>Creating account...</Text>;
      case ApiCallStatusType.SUCCESS:
        return (
          <Text style={styles.paragraph}>Account creation successful!</Text>
        );
      case ApiCallStatusType.FAILURE:
        return <Text style={styles.paragraph}>Account creation failed.</Text>;
      default:
        return undefined;
    }
  };

  render() {
    const disableJoinButton =
      !!this.props.createMemberStatus &&
      this.props.createMemberStatus.status !== ApiCallStatusType.FAILURE;

    return (
      <IndependentPageContainer containerStyle={styles.cardPageContainer}>
        <ScrollView style={styles.page}>
          <View style={styles.body}>
            <View style={styles.card}>
              <Text style={styles.paragraph}>
                By clicking Join, I agree that this is my real identity, my full
                name, and the only time I have joined Raha. I am at least 13
                years old. I understand that creating duplicate or fake accounts
                may result in me and people I have invited losing access to our
                accounts.
              </Text>
              <Text style={styles.paragraph}>
                I understand and agree that after 1 year of inactivity, all of
                my Raha will be irrevocably and irretrievably donated to fund
                basic income, with 80% going directly to members and 20% to the
                member-owned Raha Parliament.
              </Text>
              <Text style={styles.paragraph}>
                I have also read and agree to the{" "}
                <TextLink
                  destination={{
                    type: LinkType.Website,
                    url: "https://web.raha.app/terms-of-service"
                  }}
                >
                  Terms of Service
                </TextLink>
                ,{" "}
                <TextLink
                  destination={{
                    type: LinkType.Website,
                    url: "https://web.raha.app/privacy-policy"
                  }}
                >
                  Privacy Policy
                </TextLink>
                , and{" "}
                <TextLink
                  destination={{
                    type: LinkType.Website,
                    url: "https://web.raha.app/code-of-conduct"
                  }}
                >
                  Code of Conduct
                </TextLink>
                .
              </Text>

              <EnforcePermissionsButton
                disabled={disableJoinButton}
                operationType={OperationType.CREATE_MEMBER}
                title="Join"
                onPress={this.createAccount}
              />
              {this._renderRequestingStatus()}
            </View>
          </View>
        </ScrollView>
      </IndependentPageContainer>
    );
  }
}

const mapStateToProps: MapStateToProps<ReduxStateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const createMemberStatus = getStatusOfApiCall(
    state,
    ApiEndpointName.CREATE_MEMBER,
    ownProps.verifiedName
  );
  return { createMemberStatus };
};

export const OnboardingCreateAccount = connect(
  mapStateToProps,
  { createMember }
)(OnboardingCreateAccountView);
