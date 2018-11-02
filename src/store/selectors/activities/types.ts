import {
  Operation,
  CreateMemberOperation,
  VerifyOperation,
  MintOperation,
  MintReferralBonusPayload,
  GiveOperation,
  TrustOperation,
  MintBasicIncomePayload,
  RequestVerificationOperation,
  EditMemberOperation,
  FlagMemberOperation,
  ResolveFlagMemberOperation,
  MintReferralBonusOperation,
  MintBasicIncomeOperation,
  TipGiveOperation
} from "@raha/api-shared/dist/models/Operation";

/**
 * Types of Activities that form conceptually whole events in Raha.
 */
export enum ActivityType {
  INDEPENDENT_OPERATION = "INDEPENDENT_OPERATION",

  // CREATE_MEMBER + VERIFY + MINT_REFERRAL_BONUS
  NEW_MEMBER = "NEW_MEMBER",
  // FLAG_MEMBER + RESOLVE_FLAG_MEMBER
  FLAG_MEMBER = "FLAG_MEMBER"
}

/**
 * Shape of an Activity. Does not enumerate all the truly valid ones.
 */
export interface ActivityDefinition<
  Type extends ActivityType,
  RelatedOps extends Operation | Operation[]
> {
  type: Type;
  operations: RelatedOps;
  childOperations?: ChildOperation[];
}

/**
 * Operations for a NEW_MEMBER activity when a member has joined Raha but is not
 * yet verified.
 */
export type NewMemberUnverifiedOperations = [CreateMemberOperation];

/**
 * Operations for a NEW_MEMBER activity when a member has joined Raha and was
 * verified; either there was no inviter, the one verifying the new member was
 * not their inviter, or the inviter still hasn't claimed their referral bonus
 * yet.
 */
export type NewMemberVerifiedOperations = [
  CreateMemberOperation,
  VerifyOperation
];

/**
 * Operations for a NEW_MEMBER activity when a member has joined Raha, was
 * verified by the inviter and that inviter minted their referral bonus.
 */
export type NewMemberMintedOperations = [
  CreateMemberOperation,
  VerifyOperation,
  MintReferralBonusOperation
];

/**
 * Tuples of related operations that form a complete NEW_MEMBER activity
 */
export type NewMemberRelatedOperations =
  | NewMemberUnverifiedOperations
  | NewMemberVerifiedOperations
  | NewMemberMintedOperations;

/**
 * Tuples of related operations that form a complete FLAG_MEMBER activity
 */
export type FlagMemberRelatedOperations = (
  | FlagMemberOperation
  | ResolveFlagMemberOperation)[];

/**
 * Operations that we consider to represent a complete event on the platform
 * itself.
 */
export type IndependentOperation =
  | MintBasicIncomeOperation
  | EditMemberOperation
  | TrustOperation
  | GiveOperation
  | RequestVerificationOperation
  | VerifyOperation;

/**
 * Operations cannot exist independently and must be attached to another operation.
 */
export type ChildOperation = TipGiveOperation;

/**
 * Activity that corresponds to the process of a new member joining Raha, from
 * creating an account to getting verified and the inviter minting a referral
 * bonus.
 */
export type NewMemberActivity = ActivityDefinition<
  ActivityType.NEW_MEMBER,
  NewMemberRelatedOperations
>;

/**
 * Activity that corresponds to the process of flagging an issue with a Raha member.
 */
export type FlagMemberActivity = ActivityDefinition<
  ActivityType.FLAG_MEMBER,
  FlagMemberRelatedOperations
>;

/**
 * Activity corresponding to a single operation that reflects a conceptually
 * whole event on the system on its own.
 */
export type IndependentOperationActivity = ActivityDefinition<
  ActivityType.INDEPENDENT_OPERATION,
  IndependentOperation
>;

/**
 * Activities are individual operations or sets of operations that together form
 * a conceptually whole event on the Raha platform.
 *
 * In contrast, Stories are the mechanism for how Activities actually get
 * presented to users, which may include aggregating Activities together.
 */
export type Activity =
  | NewMemberActivity
  | FlagMemberActivity
  | IndependentOperationActivity;
