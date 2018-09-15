import { Reducer } from "redux";

import { List } from "immutable";
import {
  DropdownMessage,
  DropdownAction,
  DropdownActionsType
} from "../actions/dropdown";

export type DropdownState = {
  messages: List<DropdownMessage>;
};

export const reducer: Reducer<DropdownState> = (
  prevState = {
    messages: List()
  },
  untypedAction
) => {
  const action = untypedAction as DropdownAction;
  switch (action.type) {
    case DropdownActionsType.ADD_DROPDOWN_MESSAGE:
      return {
        messages: prevState.messages.push(action.message)
      };
    case DropdownActionsType.DISMISS_DROPDOWN_MESSAGE:
      return {
        messages: prevState.messages.filter(message => message.id !== action.id)
      };
    default:
      return prevState;
  }
};
