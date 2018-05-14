import { ActionCreator } from 'react-redux';

export enum LoggedInUserActions {
  LOG_IN = "LOG_IN",
  LOG_OUT = "LOG_OUT"
}
type LogInAction = {
  type: LoggedInUserActions.LOG_IN,
  userId: string;
}

export const logIn: ActionCreator<LogInAction> = (userId: string) => ({
  type: LoggedInUserActions.LOG_IN,
  userId
})