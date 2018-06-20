import * as React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { Navigation } from "./src/components/shared/Navigation";
import { store, persistor } from "./src/store";
import { refreshMembers } from "./src/store/actions/members";

// refresh the members/operations on app start
const onBeforeLift = async () => {
  await refreshMembers()(store.dispatch, store.getState, undefined);
};

const App: React.StatelessComponent = () => {
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
        <Navigation />
      </PersistGate>
    </Provider>
  );
};

export default App;
