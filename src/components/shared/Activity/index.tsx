import { ReactNode } from "react";
import { Member } from "../../../store/reducers/members";
import { CurrencyValue } from "../Currency";
import { RouteName } from "../Navigation";

/**
 * Represents the direction of the relationship between actors in an activity.
 * Currently only supports onward or bidirectional, since that makes the flow
 * of the application linear and therefore more comprehensible.
 */
export enum ActivityDirection {
  Forward = "Forward",
  Bidirectional = "Bidirectional"
}

/**
 * The content of an Activity. Missing some metadata that makes a complete,
 * renderable Activity.
 */
export interface ActivityContent {
  actor: Member;
  description: (string | CurrencyValue)[];
  body: ReactNode;
  chainedActivity?: {
    direction: ActivityDirection;
    content: ActivityContent;
  };
}

/**
 * A renderable link that directs a user to an action they can take.
 */
export interface ActionLink {
  text: string;
  // TODO: We probably need some way of also providing parameters to link to,
  // for example in a "Say Hi" link it should go to a messaging page
  // corresponding to the person you're saying hi to.
  destination: RouteName;
}

/**
 * An invitation for a member to take action.
 */
export interface CallToAction {
  text: (string | CurrencyValue | ActionLink)[];
}

/**
 * Addendum to any Activity that invites a member to take an action.
 */
export interface ActivityCallToAction {
  actor: Member;
  actions: CallToAction[];
}

/**
 * A full description of any conceptually whole activity that happens on Raha.
 *
 * id just needs to be unique and deterministically derived from the content.
 */
export interface Activity extends ActivityContent {
  id: string;
  timestamp: Date;
  content: ActivityContent;
  callToAction?: ActivityCallToAction;
}
