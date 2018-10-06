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
  EditMemberOperation
} from "@raha/api-shared/dist/models/Operation";

/**
 * Types of Activities that form conceptually whole events in Raha.
 */
export enum ActivityType {
  INDEPENDENT_OPERATION = "INDEPENDENT_OPERATION",

  // CREATE_MEMBER + VERIFY + MINT_REFERRAL_BONUS
  NEW_MEMBER = "NEW_MEMBER"
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
}

/**
 * TODO: just expose these from @raha/api-shared
 */
export interface MintReferralBonusOperation extends MintOperation {
  data: MintReferralBonusPayload;
}

export interface MintBasicIncomeOperation extends MintOperation {
  data: MintBasicIncomePayload;
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
 * Activity that corresponds to the process of a new member joining Raha, from
 * creating an account to getting verified and the inviter minting a referral
 * bonus.
 */
export type NewMemberActivity = ActivityDefinition<
  ActivityType.NEW_MEMBER,
  NewMemberRelatedOperations
>;

/**
 * Activity corresponding to a single operation that reflects a conceptually
 * whole event on the system on its own.
 */
<<<<<<< HEAD
export type IndependentOperationActivity = ActivityDefinition<
  ActivityType.INDEPENDENT_OPERATION,
  IndependentOperation
>;
=======
export enum ActivityType {
  // encompasses both individual mints, and bundled ones
  MINT_BASIC_INCOME = "MINT_BASIC_INCOME",

  MINT_REFERRAL_BONUS = "MINT_REFERRAL_BONUS",
  VERIFY_MEMBER = "VERIFY_MEMBER",
  TRUST_MEMBER = "TRUST_MEMBER",
  GIVE_RAHA = "GIVE_RAHA",
  REQUEST_VERIFICATION = "REQUEST_VERIFICATION",
  FLAG_MEMBER = "FLAG_MEMBER",

  // will encompass CREATE_MEMBER + VERIFY + MINT_REFERRAL_BONUS bundles
  NEW_MEMBER = "NEW_MEMBER",
  EDIT_MEMBER = "EDIT_MEMBER"
}
>>>>>>> Add activity for flagging.

/**
 * Activities are individual operations or sets of operations that together form
 * a conceptually whole event on the Raha platform.
 *
 * In contrast, Stories are the mechanism for how Activities actually get
 * presented to users, which may include aggregating Activities together.
 */
export type Activity = NewMemberActivity | IndependentOperationActivity;
