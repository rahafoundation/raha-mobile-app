import { ActionCreator } from "redux";

export enum DropdownActionsType {
  ADD_DROPDOWN_MESSAGE,
  DISMISS_DROPDOWN_MESSAGE
}

export enum DropdownType {
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  SUCCESS = "success"
  // CUSTOM is not currently supported.
}

export interface DropdownMessage {
  type: DropdownType;
  id: string;
  title: string;
  message: string;
}

export interface AddDropdownMessageAction {
  type: DropdownActionsType.ADD_DROPDOWN_MESSAGE;
  message: DropdownMessage;
}

export const addDropdownMessage: ActionCreator<AddDropdownMessageAction> = (
  message: DropdownMessage
) => {
  return {
    type: DropdownActionsType.ADD_DROPDOWN_MESSAGE,
    message
  };
};

export interface DismissDropdownMessageAction {
  type: DropdownActionsType.DISMISS_DROPDOWN_MESSAGE;
  id: string;
}

export const dismissDropdownMessage: ActionCreator<
  DismissDropdownMessageAction
> = (id: string) => {
  return {
    type: DropdownActionsType.DISMISS_DROPDOWN_MESSAGE,
    id
  };
};

export type DropdownAction =
  | AddDropdownMessageAction
  | DismissDropdownMessageAction;
