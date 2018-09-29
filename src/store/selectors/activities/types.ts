import {
  Member,
  RAHA_BASIC_INCOME_MEMBER
} from "../../../store/reducers/members";
import { CurrencyValue } from "../../../components/shared/elements/Currency";
import { Omit } from "../../../../types/omit";
import { LinkDestination } from "../../../components/shared/elements/TextLink";
import { Operation } from "@raha/api-shared/dist/models/Operation";
import { OrderedMap } from "immutable";

/**
 * Represents the direction of the relationship between actors in an activity.
 * Currently only supports onward or bidirectional, since that makes the flow
 * of the application linear and therefore more comprehensible.
 */
export enum ActivityDirection {
  Forward = "Forward",
  // Backward = "Backward",  // I think Backwards messes with the flow of the feed.
  Bidirectional = "Bidirectional",
  NonDirectional = "NonDirectional"
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
 * Types of bodies that the app has built-in logic to display.
 */
export enum BodyType {
  MEDIA,
  TEXT,
  MINT_BASIC_INCOME,
  TRUST_MEMBER
}

/**
 * Reference to a body that the application independently decides how to
 * display, like by displaying an icon.
 */
export interface PredeterminedBody {
  predeterminedBodyType: BodyType;
}

export interface MediaBody {
  type: BodyType.MEDIA;
  media: MediaReference[];
}

export interface TextBody {
  type: BodyType.TEXT;
  text: string;
}

/**
 * Body to display for a given activity.
 */
export type ActivityBody =
  | TextBody
  | MediaBody
  | { type: BodyType.MINT_BASIC_INCOME }
  | { type: BodyType.TRUST_MEMBER };

/**
 * The content of an Activity. Missing some metadata that makes a complete,
 * renderable Activity.
 */
export type ActivityContent = {
  /**
   * What member took action.
   *
   * TODO: potentially support other special members than basic income, treat it
   * as an actual member/variation of it rather than a singleton
   */
  actor: Member | typeof RAHA_BASIC_INCOME_MEMBER;
  /**
   * Description of the action they took. Currently rendered after the actor's
   * display name in the format of a complete sentence.
   */
  description?: (string | CurrencyValue)[];
} & (
  | {}
  // This union type enforces that if a body is present, there must be a next
  // activity in the chain. If this turns out to be too restrictive, we can
  // loosen the requirement.
  | {
      /**
       * A larger, detailed body describing (in text) or representing (visually) the
       * action.
       */
      body: ActivityBody;
      /**
       * If this is a chained activity, the next piece of content that has occurred
       * in the chain.
       */
      nextInChain: {
        direction: ActivityDirection;
        content: ActivityContent;
      };
    });

/**
 * A renderable link that directs a user to an action they can take.
 */
export interface ActionLink {
  text: string;
  destination: LinkDestination;
}

/**
 * An invitation for a member to take action.
 *
 * TODO: don't just ad hoc figure out what the value type is, actually provide a
 * differentiator
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
  operations: OrderedMap<Operation["id"], Operation>;
}
