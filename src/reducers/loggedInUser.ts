import { Reducer } from "redux";

import { LoggedInUserActions } from "../actions/loggedInUser";

export type State = {
  userId?: string;
};

const initialState = {};
const reducer: Reducer<State> = (prevState = initialState, action) => {
  switch (action.type) {
    case LoggedInUserActions.LOG_IN:
      return {
        ...prevState,
        userId: action.userId
      };
    case LoggedInUserActions.LOG_OUT:
      return {
        ...prevState,
        userId: undefined
      };
    default:
      return prevState;
  }
};

export default reducer;
