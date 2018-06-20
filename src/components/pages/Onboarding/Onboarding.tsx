import * as React from "react";
import { Member } from "../../../store/reducers/members";
import { View, StyleSheet, TextInput } from "react-native";
import { connect, MapStateToProps } from "react-redux";
import { RahaState } from "../../../store";
import { OnboardingSplash } from "./OnboardingSplash";
import { VerifyName } from "./VerifyName";
import { ChooseInviter } from "./ChooseInviter";

/**
 * Parent component for Onboarding flow.
 */

enum OnboardingStep {
  SPLASH,
  CHOOSE_INVITER,
  VERIFY_NAME,
  CAMERA,
  VIDEO_PREVIEW,
  REQUEST_INVITE
}

type ReduxStateProps = {
  displayName: string | null;
};

type OwnProps = {
  deeplinkInvitingMember?: Member;
  navigation: any;
};

type OnboardingProps = ReduxStateProps & OwnProps;

type OnboardingState = {
  step: OnboardingStep;

  invitingMember?: Member;
  verifiedName?: string;
};

export class OnboardingView extends React.Component<
  OnboardingProps,
  OnboardingState
> {
  state = {
    step: OnboardingStep.SPLASH,
    invitingMember: this.props.deeplinkInvitingMember
  };

  renderOnboardingStep() {
    switch (this.state.step) {
      case OnboardingStep.SPLASH: {
        return (
          <OnboardingSplash
            onSplashCompleted={() => {
              this.setState({
                step: OnboardingStep.VERIFY_NAME
              });
            }}
          />
        );
      }
      case OnboardingStep.VERIFY_NAME: {
        return (
          <VerifyName
            initialDisplayName={
              this.props.displayName ? this.props.displayName : undefined
            }
            onVerifiedName={name => {
              this.setState({
                verifiedName: name,
                step: OnboardingStep.CHOOSE_INVITER
              });
            }}
          />
        );
      }
      case OnboardingStep.CHOOSE_INVITER: {
        return (
          <ChooseInviter
            onInviterSelected={member => {
              this.setState({
                invitingMember: member,
                step: OnboardingStep.CAMERA
              });
            }}
          />
        );
      }
      case OnboardingStep.CAMERA: {
        return (
          <ChooseInviter
            onInviterSelected={member => {
              this.setState({
                invitingMember: member,
                step: OnboardingStep.CAMERA
              });
            }}
          />
        );
      }
      default:
        return undefined;
    }
  }

  render() {
    return <View style={styles.container}>{this.renderOnboardingStep()}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ddd"
  }
});

const mapStateToProps: MapStateToProps<
  ReduxStateProps,
  OwnProps,
  RahaState
> = state => {
  const { firebaseUser } = state.authentication;
  return {
    displayName: firebaseUser ? firebaseUser.displayName : null
  };
};
export const Onboarding = connect(mapStateToProps)(OnboardingView);
