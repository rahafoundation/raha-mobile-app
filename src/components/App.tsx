import * as React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import codePush from "react-native-code-push";

import { AuthManager } from "./AuthManager";
import { Navigation } from "./shared/Navigation";
import { store, persistor } from "../store";
import { refreshMembers } from "../store/actions/members";
import { MessagingManager } from "./MessagingManager";
import { DropdownWrapper } from "./DropdownWrapper";
import { Loading } from "./shared/Loading";
import { AppState } from "react-native";

// refresh the members/operations on app start
const onBeforeLift = async () => {
  await refreshMembers()(store.dispatch, store.getState, undefined);
};

type AppRootProps = {};

type AppRootState = {
  shouldRefreshOnNextForeground: boolean;
};

class AppRoot extends React.Component<AppRootProps, AppRootState> {
  constructor(props: AppRootProps) {
    super(props);
    this.state = {
      // First refresh is from PersistGate#onBeforeLift
      shouldRefreshOnNextForeground: false
    };
  }

  componentDidMount() {
    AppState.addEventListener("change", this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener("change", this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === "background") {
      this.setState({ shouldRefreshOnNextForeground: true });
    } else if (
      nextAppState === "active" &&
      this.state.shouldRefreshOnNextForeground
    ) {
      this.setState({ shouldRefreshOnNextForeground: false });
      // Refresh every time the app comes into foreground after a background.
      // There's an "inactive" state that we don't want to refresh after, but on
      // Android it doesn't seem to be called...
      refreshMembers()(store.dispatch, store.getState, undefined);
    }
  };

  render() {
    return (
      // TODO: see if there's a better way to make thunk types work properly aside
      // from cast to `any`
      <Provider store={store as any}>
        <PersistGate
          loading={<Loading />}
          persistor={persistor}
          onBeforeLift={onBeforeLift}
        >
          <AuthManager>
            <MessagingManager>
              <DropdownWrapper>
                <Navigation />
              </DropdownWrapper>
            </MessagingManager>
          </AuthManager>
        </PersistGate>
      </Provider>
    );
  }
}

export const App = codePush({
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME
})(AppRoot);
