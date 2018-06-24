import * as React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { AuthManager } from "./AuthManager";
import { Navigation } from "./shared/Navigation";
import { store, persistor } from "../store";
import { refreshMembers } from "../store/actions/members";
import { Text } from "react-native";

// refresh the members/operations on app start
const onBeforeLift = async () => {
  await refreshMembers()(store.dispatch, store.getState, undefined);
};

export const App: React.StatelessComponent = () => {
  return (
    // <Text> hi</Text>
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
          <Navigation />
        </AuthManager>
      </PersistGate>
    </Provider>
  );
};
