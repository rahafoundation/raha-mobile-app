import {
  Member,
  RAHA_BASIC_INCOME_MEMBER
} from "../../../store/reducers/members";
import { CurrencyValue } from "../../../components/shared/Currency";
import { RouteName } from "../../../components/shared/Navigation";

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
 * Reference to find and render a video.
 */
export interface VideoReference {
  thumbnailUri: string;
  videoUri: string;
}

/**
 * Reference to find and render an image.
 */
export interface ImageReference {
  imageUri: string;
}

/**
 * Reference to visual media to dipslay.
 */
export type MediaReference = VideoReference | ImageReference;

/**
 * Reference to an icon to display.
 * TODO: actually limit iconName to available icons
 * TODO: this is a display concern, not a data one. We should make this just
 * refer to the type of activity and let the rendering logic decide to use these
 * icons instead.
 */
export interface IconReference {
  iconName: string;
}

/**
 * Body to display for a given activity.
 */
export type ActivityBody =
  | {
      text: string;
    }
  | MediaReference[]
  | IconReference;

/**
 * The content of an Activity. Missing some metadata that makes a complete,
 * renderable Activity.
 */
export interface ActivityContent {
  // TODO: potentially support other special members than basic income, treat it
  // as an actual member/variation of it rather than a singleton
  actor: Member | typeof RAHA_BASIC_INCOME_MEMBER;
  description?: (string | CurrencyValue)[];
  body?: ActivityBody;
  nextInChain?: {
    direction: ActivityDirection;
    content: ActivityContent;
  };
}

/**
 * Reference to another part of the app to redirect to.
 * TODO: make params more specific.
 * TODO: move this out of activities; colocate with RouteName
 */
export interface RouteDescriptor {
  routeName: RouteName;
  params: any;
}

/**
 * A renderable link that directs a user to an action they can take.
 */
export interface ActionLink {
  text: string;
  destination: RouteDescriptor;
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
export interface Activity {
  id: string;
  timestamp: Date;
  content: ActivityContent;
  callToAction?: ActivityCallToAction;
}
