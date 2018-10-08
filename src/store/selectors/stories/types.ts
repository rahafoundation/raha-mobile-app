import {
  Member,
  RAHA_BASIC_INCOME_MEMBER
} from "../../../store/reducers/members";
import { CurrencyValue } from "../../../components/shared/elements/Currency";
import { LinkDestination } from "../../../components/shared/elements/TextLink";
import {
  GiveOperation,
  EditMemberOperation,
  RequestVerificationOperation,
  TrustOperation,
  VerifyOperation
} from "@raha/api-shared/dist/models/Operation";
import { OrderedMap } from "immutable";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";
import {
  NewMemberRelatedOperations,
  MintBasicIncomeOperation,
  NewMemberActivity,
  ActivityType,
  ActivityDefinition
} from "../activities/types";
import { operationsForMember } from "../operations";
import { Activity } from "../activities/types";

/**
 * Represents the direction of the relationship between actors in an story.
 * Currently only supports onward or bidirectional, since that makes the flow
 * of the application linear and therefore more comprehensible.
 */
export enum ChainDirection {
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
 * Body to display for a given story.
 */
export type StoryBody =
  | TextBody
  | MediaBody
  | { type: BodyType.MINT_BASIC_INCOME }
  | { type: BodyType.TRUST_MEMBER };

export interface NextInChain {
  direction: ChainDirection;
  nextStoryContent: StoryContent;
}

/**
 * The content of an Story. Missing some metadata that makes a complete,
 * renderable Story.
 */
export interface StoryContent {
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
    bodyContent: StoryBody;
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

export enum CallToActionDataType {
  TEXT = "TEXT",
  LINK = "LINK"
}

export type CallToActionPiece =
  | {
      type: CallToActionDataType.TEXT;
      data: (string | CurrencyValue)[];
    }
  | {
      type: CallToActionDataType.LINK;
      data: ActionLink;
    };

/**
 * An invitation for a member to take action.
 */
export type CallToAction = CallToActionPiece[];

/**
 * Shape of the possible data that can comprise a story
 */
export interface StoryDataDefinition<
  Type extends StoryType,
  Activities extends Activity[] | Activity
> {
  type: Type;
  activities: Activities;
}

export type NewMemberStoryData = StoryDataDefinition<
  StoryType.NEW_MEMBER,
  NewMemberActivity
>;

type MintBasicIncomeActivity = ActivityDefinition<
  ActivityType.INDEPENDENT_OPERATION,
  MintBasicIncomeOperation
>;

export type MintBasicIncomeStoryData = StoryDataDefinition<
  StoryType.MINT_BASIC_INCOME,
  MintBasicIncomeActivity | MintBasicIncomeActivity[]
>;

export type GiveRahaStoryData = StoryDataDefinition<
  StoryType.GIVE_RAHA,
  ActivityDefinition<ActivityType.INDEPENDENT_OPERATION, GiveOperation>
>;

export type EditMemberStoryData = StoryDataDefinition<
  StoryType.EDIT_MEMBER,
  ActivityDefinition<ActivityType.INDEPENDENT_OPERATION, EditMemberOperation>
>;

export type RequestVerificationStoryData = StoryDataDefinition<
  StoryType.REQUEST_VERIFICATION,
  ActivityDefinition<
    ActivityType.INDEPENDENT_OPERATION,
    RequestVerificationOperation
  >
>;

export type TrustMemberStoryData = StoryDataDefinition<
  StoryType.TRUST_MEMBER,
  ActivityDefinition<ActivityType.INDEPENDENT_OPERATION, TrustOperation>
>;

export type VerifyMemberStoryData = StoryDataDefinition<
  StoryType.VERIFY_MEMBER,
  ActivityDefinition<ActivityType.INDEPENDENT_OPERATION, VerifyOperation>
>;

/**
 * Possible data that can comprise a story
 */
export type StoryData =
  | NewMemberStoryData
  | MintBasicIncomeStoryData
  | GiveRahaStoryData
  | EditMemberStoryData
  | RequestVerificationStoryData
  | TrustMemberStoryData
  | VerifyMemberStoryData;

/**
 * Types of stories shown in the feed.
 */
export enum StoryType {
  // encompasses both individual mints, and bundled ones
  MINT_BASIC_INCOME = "MINT_BASIC_INCOME",

  EDIT_MEMBER = "EDIT_MEMBER",
  VERIFY_MEMBER = "VERIFY_MEMBER",
  TRUST_MEMBER = "TRUST_MEMBER",
  GIVE_RAHA = "GIVE_RAHA",
  REQUEST_VERIFICATION = "REQUEST_VERIFICATION",

  // CREATE_MEMBER + VERIFY + MINT_REFERRAL_BONUS
  NEW_MEMBER = "NEW_MEMBER"
}

/**
 * Describes how to present operations on the Raha feed.
 *
 * id just needs to be unique and deterministically derived from the content.
 */
export interface Story {
  storyData: StoryData;
  id: string;
  timestamp: Date;
  content: StoryContent;
  callsToAction?: CallToAction[];
}
