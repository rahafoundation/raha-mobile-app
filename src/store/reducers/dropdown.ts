import { Reducer } from "redux";

import { List } from "immutable";
import { DropdownAction, DropdownActionsType } from "../actions/dropdown";

export enum DropdownType {
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  SUCCESS = "success"
  // CUSTOM is not currently supported.
}

export interface DropdownMessage {
  type: DropdownType;
  id: string; // autogenerated
  title: string;
  message: string;
}

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
      // Don't push malformed messages.
      if (action.message.title && action.message.message) {
        return {
          messages: prevState.messages.push(action.message)
        };
      }
      return prevState;
    case DropdownActionsType.DISMISS_DROPDOWN_MESSAGE:
      return {
        messages: prevState.messages.filter(message => message.id !== action.id)
      };
    default:
      return prevState;
  }
};
