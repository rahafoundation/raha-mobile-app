/**
 * Handles updating user's FirebaseCloudMessaging token.
 *
 * Updates the user's token every time the user logs in and
 * subsequently whenever the token changes.
 */

import * as React from "react";
import firebase from "react-native-firebase";
import { MapStateToProps, connect } from "react-redux";

import { MemberId } from "@raha/api-shared/dist/models/identifiers";

import { RahaState } from "../store";
import { getLoggedInFirebaseUserId } from "../store/selectors/authentication";
import { getMemberById } from "../store/selectors/members";
import { clearFcmToken, setFcmToken } from "../store/actions/messaging";
import { messaging } from "../firebaseInit";

interface OwnProps {
  children: React.ReactNode;
}
interface ReduxStateProps {
  loggedInMemberId?: MemberId;
}
interface DispatchProps {
  clearFcmToken: (fcmToken: string) => void;
  setFcmToken: (fcmToken: string) => void;
}

type Props = OwnProps & ReduxStateProps & DispatchProps;

class MessagingManagerComponent extends React.Component<Props> {
  unsubscribe?: () => void;

  constructor(props: Props) {
    super(props);
    this.updateMemberFcmToken();
  }

  componentWillMount() {
    this.unsubscribe = firebase
      .messaging()
      .onTokenRefresh(this.updateMemberFcmToken);
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  updateMemberFcmToken = async (newToken?: string) => {
    const fcmToken = newToken || (await messaging.getToken());
    if (fcmToken) {
      if (this.props.loggedInMemberId) {
        this.props.setFcmToken(fcmToken);
      } else {
        this.props.clearFcmToken(fcmToken);
      }
    }
  };

  async componentDidUpdate(prevProps: Props) {
    if (prevProps.loggedInMemberId != this.props.loggedInMemberId) {
      this.updateMemberFcmToken();
    }
  }

  render() {
    return this.props.children;
  }
}

const mapStateToProps: MapStateToProps<
  ReduxStateProps,
  OwnProps,
  RahaState
> = state => {
  const loggedInUid = getLoggedInFirebaseUserId(state);
  if (!loggedInUid) {
    return {};
  }

  const loggedInMember = getMemberById(state, loggedInUid);
  if (!loggedInMember) {
    return {};
  }

  return {
    loggedInMemberId: loggedInMember.get("memberId")
  };
};

export const MessagingManager = connect(
  mapStateToProps,
  { clearFcmToken, setFcmToken }
)(MessagingManagerComponent);
