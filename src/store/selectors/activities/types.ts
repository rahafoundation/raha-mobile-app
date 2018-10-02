import {
  Member,
  RAHA_BASIC_INCOME_MEMBER
} from "../../../store/reducers/members";
import { CurrencyValue } from "../../../components/shared/elements/Currency";
import { LinkDestination } from "../../../components/shared/elements/TextLink";
import { Operation } from "@raha/api-shared/dist/models/Operation";
import { OrderedMap } from "immutable";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";

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

export interface NextInChain {
  direction: ActivityDirection;
  nextActivityContent: ActivityContent;
}

/**
 * The content of an Activity. Missing some metadata that makes a complete,
 * renderable Activity.
 */
export interface ActivityContent {
  /**
   * What members took action. Stored as an OrderedMap in order to not keep
   * duplicates. Would use an OrderedSet, but Immutable.JS doesn't support
   * custom equality functions, so Map simulates equality by id.
   *
   * TODO: potentially support other special members than basic income, treat it
   * as an actual member/variation of it rather than a singleton
   */
  actors: OrderedMap<MemberId, Member> | typeof RAHA_BASIC_INCOME_MEMBER;
  /**
   * Description of the action they took. Currently rendered after the actor's
   * display name in the format of a complete sentence.
   */
  description?: (string | CurrencyValue)[];
  /**
   * A larger, detailed body describing (in text) or representing (visually) the
   * action.
   *
   * Currently, a body is required if there is to be further chained content. If
   * that is too restrictive, we can relax that restriction, but it will likely
   * require a visual redesign as well.
   */
  body?: {
    bodyContent: ActivityBody;
    /**
     * The next piece of content in the chain of activities.
     */
    nextInChain?: NextInChain;
  };
}

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
 * Types of activities shown in the feed.
 */
export enum ActivityType {
  // encompasses both individual mints, and bundled ones
  MINT_BASIC_INCOME = "MINT_BASIC_INCOME",

  MINT_REFERRAL_BONUS = "MINT_REFERRAL_BONUS",
  VERIFY_MEMBER = "VERIFY_MEMBER",
  TRUST_MEMBER = "TRUST_MEMBER",
  GIVE_RAHA = "GIVE_RAHA",
  REQUEST_VERIFICATION = "REQUEST_VERIFICATION",

  // will encompass CREATE_MEMBER + VERIFY + MINT_REFERRAL_BONUS bundles
  NEW_MEMBER = "NEW_MEMBER",
  EDIT_MEMBER = "EDIT_MEMBER"
}

/**
 * A full description of any conceptually whole activity that happens on Raha.
 *
 * id just needs to be unique and deterministically derived from the content.
 */
export interface Activity {
  type: ActivityType;
  id: string;
  timestamp: Date;
  content: ActivityContent;
  callToAction?: ActivityCallToAction;
  /**
   * Operations involved in this activity, ordered by how they were ingested to
   * create this activity (should generally be chronological, since that's how
   * we receive operations; but this may change). Stored as a Map to allow quick
   * retrieval of relevant operations.
   */
  sourceOperations: OrderedMap<Operation["id"], Operation>;

  /**
   * Activities corresponding to individual operations before they've been
   * bundled. Present only if a relevant one ought to exist, which is dependent
   * on the semantics of the particular operation type.
   *
   * The presence of this key indicates that the Activity in question is
   * an bundled one.
   */
  unbundledActivities?: OrderedMap<Operation["id"], Activity>;
}
