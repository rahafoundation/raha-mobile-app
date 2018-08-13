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
 * Reference to find and render a video.
 */
interface VideoReference {
  thumbnailUrl: string;
  videoUrl: string;
}

/**
 * Reference to find and render an image.
 */
interface ImageReference {
  imageUrl: string;
}

/**
 * Reference to visual media to dipslay.
 */
export type MediaReference = VideoReference | ImageReference;

/**
 * Reference to an icon to display.
 */
interface IconReference {
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
  actor: Member;
  description: (string | CurrencyValue)[];
  body: ActivityBody;
  chainedActivity?: {
    direction: ActivityDirection;
    content: ActivityContent;
  };
}

/**
 * Reference to another part of the app to redirect to.
 * TODO: make params more specific.
 */
interface RouteDescriptor {
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
export interface Activity extends ActivityContent {
  id: string;
  timestamp: Date;
  content: ActivityContent;
  callToAction?: ActivityCallToAction;
}
