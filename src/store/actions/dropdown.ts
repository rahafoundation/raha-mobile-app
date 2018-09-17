import { ActionCreator } from "redux";
import { DropdownMessage, DropdownType } from "../reducers/dropdown";
import { generateRandomIdentifier } from "../../helpers/identifiers";

export enum DropdownActionsType {
  ADD_DROPDOWN_MESSAGE,
  DISMISS_DROPDOWN_MESSAGE
}

export interface DisplayDropdownMessageAction {
  type: DropdownActionsType.ADD_DROPDOWN_MESSAGE;
  message: DropdownMessage;
}

export const displayDropdownMessage: ActionCreator<
  DisplayDropdownMessageAction
> = (type: DropdownType, title: string, message: string) => {
  return {
    type: DropdownActionsType.ADD_DROPDOWN_MESSAGE,
    message: {
      id: generateRandomIdentifier(),
      type,
      title,
      message
    }
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
  | DisplayDropdownMessageAction
  | DismissDropdownMessageAction;
