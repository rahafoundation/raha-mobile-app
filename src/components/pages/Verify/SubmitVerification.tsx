import * as React from "react";
import { connect, MapStateToProps } from "react-redux";
import { View, StyleSheet, Dimensions } from "react-native";

import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";

import { RahaState } from "../../../store";
import { verify } from "../../../store/actions/members";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../../store/reducers/apiCalls";
import { getStatusOfApiCall } from "../../../store/selectors/apiCalls";
import { Text, Button, IndependentPageContainer } from "../../shared/elements";
import { colors } from "../../../helpers/colors";

type ReduxStateProps = {
  submitVerificationStatus?: ApiCallStatus;
};

type OwnProps = {
  videoToken: string;
  toMemberId: MemberId;
  toMemberFullName: string;
  onBack: () => void;
  onExit: () => void;
};

type SubmitVerificationProps = OwnProps &
  ReduxStateProps & {
    verify: (memberId: MemberId, videoToken: string) => void;
  };

class SubmitVerificationView extends React.Component<SubmitVerificationProps> {
  constructor(props: SubmitVerificationProps) {
    super(props);
  }

  submitVerification = () => {
    this.props.verify(this.props.toMemberId, this.props.videoToken);
  };

  private _renderSubmittingStatus = () => {
    const statusType = this.props.submitVerificationStatus
      ? this.props.submitVerificationStatus.status
      : undefined;
    switch (statusType) {
      case ApiCallStatusType.STARTED:
        return <Text style={styles.text}>Submitting verification...</Text>;
      case ApiCallStatusType.SUCCESS:
        return (
          <React.Fragment>
            <Text style={styles.text}>Verification successful!</Text>
            <Button
              style={styles.button}
              title="Return"
              onPress={this.props.onExit}
            />
          </React.Fragment>
        );
      case ApiCallStatusType.FAILURE:
        return <Text style={styles.text}>Verification failed.</Text>;
      default:
        return undefined;
    }
  };

  render() {
    const status = this.props.submitVerificationStatus
      ? this.props.submitVerificationStatus.status
      : undefined;
    const isRequestSendingOrSent =
      status &&
      (status === ApiCallStatusType.STARTED ||
        status === ApiCallStatusType.SUCCESS);
    return (
      <IndependentPageContainer style={styles.container}>
        <Text style={styles.back} onPress={this.props.onBack}>
          Back
        </Text>
        <View style={styles.card}>
          <Text style={styles.text}>
            By clicking the "Verify" button below, you are confirming that you
            believe that this account belongs to{" "}
            <Text style={styles.name}>{this.props.toMemberFullName}</Text> and
            this is the only time they have joined Raha.
          </Text>
          <Button
            title="Verify"
            onPress={this.submitVerification}
            disabled={isRequestSendingOrSent}
            style={styles.button}
          />
          {this._renderSubmittingStatus()}
        </View>
      </IndependentPageContainer>
    );
  }
}

const mapStateToProps: MapStateToProps<ReduxStateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => ({
  submitVerificationStatus: getStatusOfApiCall(
    state,
    ApiEndpointName.VERIFY_MEMBER,
    ownProps.toMemberId
  )
});

export const SubmitVerification = connect(
  mapStateToProps,
  { verify }
)(SubmitVerificationView);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.darkBackground,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  card: {
    backgroundColor: colors.pageBackground,
    width: Dimensions.get("window").width - 24,
    padding: 12,
    borderRadius: 12
  },
  text: {
    fontSize: 18,
    marginVertical: 4,
    marginHorizontal: 40,
    textAlign: "center"
  },
  name: {
    fontWeight: "bold"
  },
  button: {
    margin: 12
  },
  back: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: 12
  }
});
