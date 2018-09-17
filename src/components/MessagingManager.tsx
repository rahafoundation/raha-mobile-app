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
import { displayDropdownMessage } from "../store/actions/dropdown";
import { DropdownType } from "../store/reducers/dropdown";

interface OwnProps {
  children: React.ReactNode;
}
interface ReduxStateProps {
  loggedInMemberId?: MemberId;
}
interface DispatchProps {
  clearFcmToken: (fcmToken: string) => void;
  setFcmToken: (fcmToken: string) => void;
  displayDropdownMessage: (
    type: DropdownType,
    title: string,
    message: string
  ) => void;
}

type Props = OwnProps & ReduxStateProps & DispatchProps;

class MessagingManagerComponent extends React.Component<Props> {
  unsubscribeTokenRefreshListener?: () => void;
  unsubscribeNotificationListener?: () => void;

  constructor(props: Props) {
    super(props);
    this._updateMemberFcmToken();
  }

  componentWillMount() {
    this.unsubscribeTokenRefreshListener = firebase
      .messaging()
      .onTokenRefresh(this._updateMemberFcmToken);
    this._setNotificationsListener();
  }

  componentWillUnmount() {
    if (this.unsubscribeTokenRefreshListener) {
      this.unsubscribeTokenRefreshListener();
      this.unsubscribeTokenRefreshListener = undefined;
    }
    if (this.unsubscribeNotificationListener) {
      this.unsubscribeNotificationListener();
      this.unsubscribeNotificationListener = undefined;
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.loggedInMemberId != this.props.loggedInMemberId) {
      this._updateMemberFcmToken();
      this._setNotificationsListener();
    }
  }

  _checkPermissions = async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      return true;
    } else {
      try {
        // This promise resolves if the permission is granted, otherwise throws an error.
        // https://rnfirebase.io/docs/v4.3.x/messaging/reference/Messaging#requestPermission.
        await firebase.messaging().requestPermission();
        return true;
      } catch (exception) {
        // User rejected permissions.
        return false;
      }
    }
  };

  _updateMemberFcmToken = async (newToken?: string) => {
    const fcmToken = newToken || (await messaging.getToken());
    if (fcmToken) {
      if (this.props.loggedInMemberId) {
        this.props.setFcmToken(fcmToken);
      } else {
        this.props.clearFcmToken(fcmToken);
      }
    }
  };

  /**
   * Displays an in-app dropdown message in response to a
   * received remote push notification. Remote notifications are
   * not displayed automatically when the app is in the foreground.
   *
   * Opted for this instead of building and displaying a standard OS
   * notification since I couldn't figure out how to get the standard
   * OS notification to work on Android after a couple hours of trying,
   * and at I don't think the in-app dropdown is a bad experience.
   */
  _displayPushNotification = async (remoteNotification: any) => {
    this.props.displayDropdownMessage(
      DropdownType.INFO,
      remoteNotification.title,
      remoteNotification.body
    );
  };

  /**
   * Register for push notifications if the user is logged in. This will also trigger
   * a permissions check.
   *
   * Unregister for push notifications if the user is not logged in.
   */
  _setNotificationsListener = async () => {
    if (this.props.loggedInMemberId && !this.unsubscribeNotificationListener) {
      if (await this._checkPermissions()) {
        // Triggered when a notification is received and the app is in the foreground.
        // TODO: Uncomment out the below once the linked bug is fixed. The alternative was to downgrade
        // to RNFirebase 4.3, which we'd prefer not to do.
        // https://github.com/invertase/react-native-firebase/issues/1481
        // this.unsubscribeNotificationListener = firebase
        //   .notifications()
        //   .onNotification(this._displayPushNotification);
      }
    } else if (this.unsubscribeNotificationListener) {
      this.unsubscribeNotificationListener();
      this.unsubscribeNotificationListener = undefined;
    }
  };

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
  { clearFcmToken, setFcmToken, displayDropdownMessage }
)(MessagingManagerComponent);
