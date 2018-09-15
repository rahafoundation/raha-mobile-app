import * as React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import codePush from "react-native-code-push";

import { AuthManager } from "./AuthManager";
import { Navigation } from "./shared/Navigation";
import { store, persistor } from "../store";
import { refreshMembers } from "../store/actions/members";
import { MessagingManager } from "./MessagingManager";

// refresh the members/operations on app start
const onBeforeLift = async () => {
  await refreshMembers()(store.dispatch, store.getState, undefined);
};

const AppRoot: React.StatelessComponent = () => {
  return (
    // TODO: see if there's a better way to make thunk types work properly aside
    // from cast to `any`
    <Provider store={store as any}>
      {/* TODO: decide if we should show a loading indicator here. */}
      <PersistGate
        loading={null}
        persistor={persistor}
        onBeforeLift={onBeforeLift}
      >
        <AuthManager>
          <MessagingManager>
            <Navigation />
          </MessagingManager>
        </AuthManager>
      </PersistGate>
    </Provider>
  );
};

export const App = codePush({
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.ON_NEXT_RESUME
})(AppRoot);
