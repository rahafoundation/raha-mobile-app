import {
  Operation,
  OperationType,
  MintType,
  CreateMemberOperation,
  VerifyOperation
} from "@raha/api-shared/dist/models/Operation";

import {
  Activity,
  NewMemberRelatedOperations,
  MintBasicIncomeOperation,
  MintReferralBonusOperation,
  ActivityType,
  IndependentOperation
} from "./types";
import { RahaState } from "../../reducers";
import {
  CurrencyValue,
  CurrencyRole,
  CurrencyType
} from "../../../components/shared/elements/Currency";
import { List, Map } from "immutable";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";

interface NewMemberCacheValues {
  index: number;
}

/**
 * Optional data structure that speeds up creation of Activities from Operations
 */
interface BundlingCache {
  // member id -> index of corresponding NEW_MEMBER activity in the list
  newMember: Map<MemberId, NewMemberCacheValues>;
}

/**
 * Data required when building up activities list.
 */
interface InitialBundlingData {
  activities: List<Activity>;
  bundlingCache?: BundlingCache;
}

type BundlingData = Required<InitialBundlingData>;

/**
 * Adds an independent operation to the existing ones; if an index is specified,
 * overwrites the data at that index rather than pushing to the end.
 */
function addIndependentOperation(
  existingData: BundlingData,
  operation: IndependentOperation,
  index?: number
): BundlingData {
  const newActivity: Activity = {
    type: ActivityType.INDEPENDENT_OPERATION,
    operations: operation
  };

  return {
    activities:
      typeof index === "number"
        ? existingData.activities.set(index, newActivity)
        : existingData.activities.push(newActivity),
    bundlingCache: existingData.bundlingCache
  };
}

/**
 * First tries to search the cache for a NewMember activity; if present in
 * cache, gets it from there; else searches activities list.
 *
 * @returns the index if present, or undefined if not.
 */
function getNewMemberActivityIndexFromData(
  { activities, bundlingCache }: BundlingData,
  memberId: MemberId
): NewMemberCacheValues | undefined {
  const cachedNewMemberActivity = bundlingCache.newMember.get(memberId);

  if (cachedNewMemberActivity) return cachedNewMemberActivity;

  const foundIndex = activities.findIndex(
    a =>
      a.type === ActivityType.NEW_MEMBER &&
      a.operations[0].creator_uid === memberId
  );
  if (foundIndex === -1) return undefined;
  return { index: foundIndex };
}

function addCreateMemberOperation(
  existingData: BundlingData,
  operation: CreateMemberOperation
): BundlingData {
  const { activities, bundlingCache } = existingData;
  const newMemberId = operation.creator_uid;
  const existingNewMemberActivity = getNewMemberActivityIndexFromData(
    existingData,
    newMemberId
  );

  if (existingNewMemberActivity) {
    // TODO: proper logging, alert on this scenario (represents a bug in the
    // form of an unexpected scenario)
    console.warn(
      "Unexpected: while trying to add CREATE_MEMBER operation, found one",
      "corresponding to the same member already. Not adding this operation."
    );
    return existingData;
  }

  const nextIndex = activities.size;
  return {
    activities: activities.push({
      type: ActivityType.NEW_MEMBER,
      operations: [operation]
    }),
    bundlingCache: {
      ...bundlingCache,
      newMember: bundlingCache.newMember.set(newMemberId, { index: nextIndex })
    }
  };
}

/**
 * Adds a VERIFY_MEMBER operation to the in-progress list of Activities.
 *
 * Behavior: An existing NEW_MEMBER operation is expected to exist,
 * since VERIFY_MEMBER operations should only happen for members that already
 * have CREATE_MEMBER operations.
 *
 * Additionally, we prefer the VERIFY_MEMBER operations on NEW_MEMBER activities to be
 * from the inviter, but they can have one from others.
 *
 * So, three scenarios: Corresponding NEW_MEMBER activity...
 * - doesn't have a VERIFY_MEMBER operation yet: Add this one to that NEW_MEMBER
 *   activity
 * - has a VERIFY_MEMBER operation corresponding to the new member's inviter: create
 *   this as an INDEPENDENT_OPERATION activity
 * - has a VERIFY_MEMBER operation, but this new one comes from the inviter: Replace
 *   the previous NEW_MEMBER activity with the old VERIFY_MEMBER operation as an
 *   INDEPENDENT_OPERATION activity, and add a new NEW_MEMBER activity
 *   replacing the previous VERIFY_MEMBER operation with this one from the inviter.
 *   - we don't need to worry about messing up timestamps, since a referral
 *     bonus mint activity also shouldn't exist yet (because this VERIFY_MEMBER
 *     operation comes from the inviter, which should precede the inviter
 *     minting a referral bonus) so the timestamp would already naturally be
 *     that of the previous VERIFY_MEMBER operation
 */
function addVerifyMemberOperation(
  existingData: BundlingData,
  operation: VerifyOperation
): BundlingData {
  const { activities, bundlingCache } = existingData;
  const targetMemberId = operation.data.to_uid;
  const existingNewMemberActivity = getNewMemberActivityIndexFromData(
    existingData,
    targetMemberId
  );

  if (!existingNewMemberActivity) {
    // TODO: proper logging, alert on this scenario (represents a bug in the
    // form of an unexpected scenario)
    console.warn(
      "Unexpected: VERIFY_MEMBER operation found without a corresponding",
      "CREATE_MEMBER operation. Applying as an orphaned VERIFY_MEMBER ",
      "independent Activity."
    );
    return addIndependentOperation(existingData, operation);
  }

  const { index } = existingNewMemberActivity;
  const existingActivity = activities.get(index);

  if (!existingActivity) {
    // TODO: proper logging, alert on this scenario (represents a bug in the
    // form of an unexpected scenario)
    console.warn(
      "Unexpected: when applying VERIFY_MEMBER operation, cached activity at index",
      index,
      "is missing. Applying as an orphaned VERIFY independent Activity."
    );
    return addIndependentOperation(existingData, operation);
  }

  if (existingActivity.type !== ActivityType.NEW_MEMBER) {
    // TODO: proper logging, alert on this scenario (represents a bug in the
    // form of an unexpected scenario)
    console.warn(
      "Unexpected: when applying VERIFY_MEMBER operation, cached activity at index",
      index,
      "was not a NEW_MEMBER activity; actual type:",
      existingActivity.type,
      ". Applying as an orphaned VERIFY independent Activity."
    );
    return addIndependentOperation(existingData, operation);
  }

  const relatedOperations = existingActivity.operations;
  const newMemberActivityMemberId = relatedOperations[0].creator_uid;
  if (newMemberActivityMemberId !== targetMemberId) {
    // TODO: proper logging, alert on this scenario (represents a bug in the
    // form of an unexpected scenario)
    console.warn(
      "Unexpected: when applying VERIFY_MEMBER operation, cached activity at index",
      index,
      "for member",
      targetMemberId,
      "actually was a NEW_MEMBER activity for a different member (id:",
      newMemberActivityMemberId,
      "). Applying as an orphaned VERIFY independent Activity."
    );
    return addIndependentOperation(existingData, operation);
  }

  // scenario: no VERIFY_MEMBER operation for this NEW_MEMBER yet
  if (relatedOperations.length === 1) {
    const newOperations: NewMemberRelatedOperations = [
      existingActivity.operations[0],
      operation
    ];

    const newActivity = {
      ...existingActivity,
      operations: newOperations
    };

    return {
      activities: activities.set(index, newActivity),
      bundlingCache
    };
  }

  const [
    createMemberOperation,
    existingVerifyMemberOperation
  ] = relatedOperations;
  const inviterId = createMemberOperation.data.request_invite_from_member_id;

  // scenario: existing VERIFY_MEMBER operation already comes from the inviter
  if (existingVerifyMemberOperation.creator_uid === inviterId) {
    return addIndependentOperation(existingData, operation);
  }

  // scenario: VERIFY_MEMBER operation doesn't come from the inviter
  if (!inviterId || operation.creator_uid !== inviterId) {
    return addIndependentOperation(existingData, operation);
  }

  // scenario: this VERIFY_MEMBER operation is from the inviter, and as such ought to
  // override the previous one
  const afterNewMemberReplacedWithPrevVerify = addIndependentOperation(
    existingData,
    existingVerifyMemberOperation,
    index
  );
  const nextIndex = afterNewMemberReplacedWithPrevVerify.activities.size;
  const newOperations: NewMemberRelatedOperations = [
    existingActivity.operations[0],
    operation
  ];
  return {
    activities: afterNewMemberReplacedWithPrevVerify.activities.push({
      ...existingActivity,
      operations: newOperations
    }),
    bundlingCache: {
      ...bundlingCache,
      newMember: bundlingCache.newMember.set(newMemberActivityMemberId, {
        index: nextIndex
      })
    }
  };
}

function addMintReferralBonusOperation(
  existingData: BundlingData,
  operation: MintReferralBonusOperation
): BundlingData {
  const { activities, bundlingCache } = existingData;
  const minterId = operation.creator_uid;
  const invitedMemberId = operation.data.invited_member_id;
  const existingNewMemberActivity = getNewMemberActivityIndexFromData(
    existingData,
    invitedMemberId
  );

  if (!existingNewMemberActivity) {
    // TODO: proper logging, alert on this scenario (represents a bug in the
    // form of an unexpected scenario)
    console.warn(
      "Unexpected: MINT_REFERRAL_BONUS operation found without a corresponding",
      "CREATE_MEMBER operation. Applying as an orphaned VERIFY_MEMBER ",
      "independent Activity."
    );
    return existingData;
  }

  const newMemberActivity = activities.get(existingNewMemberActivity.index);
  if (!newMemberActivity) {
    // TODO: proper logging, alert on this scenario (represents a bug in the
    // form of an unexpected scenario)
    console.warn(
      "Unexpected: while applying MINT_REFERRAL_BONUS operation, cached index",
      "of corresponding CREATE_MEMBER operation is out of bounds. Not applying",
      "operation."
    );
    return existingData;
  }

  if (newMemberActivity.type !== ActivityType.NEW_MEMBER) {
    // TODO: proper logging, alert on this scenario (represents a bug in the
    // form of an unexpected scenario)
    console.warn(
      "Unexpected: while applying MINT_REFERRAL_BONUS operation, cached index",
      "of corresponding CREATE_MEMBER operation refers to an operation",
      "of type",
      newMemberActivity.type,
      "(instead of",
      ActivityType.NEW_MEMBER,
      "). Not applying operation."
    );
    return existingData;
  }

  const [
    createMemberOperation,
    verifyMemberOperation
  ] = newMemberActivity.operations;

  if (
    invitedMemberId !== createMemberOperation.creator_uid ||
    minterId !== createMemberOperation.data.request_invite_from_member_id
  ) {
    // TODO: proper logging, alert on this scenario (represents a bug in the
    // form of an unexpected scenario)
    console.warn(
      "Unexpected: while applying MINT_REFERRAL_BONUS operation,",
      "corresponding CREATE_MEMBER operation has mismatched ids. Not applying",
      "operation. CREATE_MEMBER operation:",
      JSON.stringify(createMemberOperation, null, 2),
      " | MINT_REFERRAL_BONUS operation: ",
      JSON.stringify(operation, null, 2)
    );
    return existingData;
  }

  if (newMemberActivity.operations.length !== 2) {
    // TODO: proper logging, alert on this scenario (represents a bug in the
    // form of an unexpected scenario)
    console.warn(
      "Unexpected: while applying MINT_REFERRAL_BONUS operation, expected",
      "corresponding CREATE_MEMBER operation to have CREATE_MEMBER and",
      "VERIFY_MEMBER operations, but instead",
      newMemberActivity.operations.length,
      "operations were present. Not applying operation."
    );
    return existingData;
  }

  return {
    activities: activities.set(existingNewMemberActivity.index, {
      ...newMemberActivity,
      // typescript not smart enough to figure out types
      operations: [
        ...newMemberActivity.operations,
        operation
      ] as NewMemberRelatedOperations
    }),
    bundlingCache
  };
}

/**
 * Add a single operation to a list in progress of activities. Keeps track not
 * just of the final list, but of cached data to optimize the creation of
 * Activities.
 */
function addOperationToActivitiesList(
  existingData: BundlingData,
  operation: Operation
): BundlingData {
  switch (operation.op_code) {
    case OperationType.CREATE_MEMBER: {
      return addCreateMemberOperation(existingData, operation);
    }
    case OperationType.VERIFY: {
      return addVerifyMemberOperation(existingData, operation);
    }
    case OperationType.MINT: {
      switch (operation.data.type) {
        case MintType.BASIC_INCOME:
          return addIndependentOperation(
            existingData,
            // typescript not smart enough to figure this out
            operation as MintBasicIncomeOperation
          );
        case MintType.REFERRAL_BONUS:
          return addMintReferralBonusOperation(
            existingData,
            operation as MintReferralBonusOperation
          );
        default:
          throw new Error(
            `Unexpected MINT operation data type. Operation: ${JSON.stringify(
              operation,
              null,
              2
            )}`
          );
      }
    }
    case OperationType.EDIT_MEMBER:
    case OperationType.REQUEST_VERIFICATION:
    case OperationType.GIVE:
    case OperationType.TRUST:
      return addIndependentOperation(existingData, operation);
    case OperationType.INVITE:
      // We do not display any activity for Invite operations. Whether or not
      // a newly joined member was invited, is retrieved from the
      // `request_invite_from_member_id` field on the `CREATE_MEMBER` operation.
      return existingData;
    default:
      // Shouldn't happen. Type assertion is because TypeScript also thinks
      // this should never happen.
      // TODO: ensure this error gets sent somewhere
      throw new Error(
        `Invalid operation: Unrecognized opcode "${
          (operation as Operation).op_code
        }". Operation: ${JSON.stringify(operation)}`
      );
  }
}

/**
 * Aggregates related operations together into conceptually related groups,
 * packaged as Activities.
 *
 * @param operations All operations, expected in chronological order, oldest
 * first.
 * @param existingData Existing data to start with, i.e. for adding new
 * operations to an existing list of Activities (and associated cache)
 */
function addOperationsToActivities(
  newOperations: List<Operation>,
  existingData?: InitialBundlingData
): List<Activity> {
  const initialBundlingData: BundlingData = existingData
    ? {
        ...existingData,
        bundlingCache: existingData.bundlingCache
          ? existingData.bundlingCache
          : { newMember: Map() }
      }
    : {
        activities: List(),
        bundlingCache: { newMember: Map() }
      };

  return newOperations.reduce((memo, operation) => {
    try {
      return addOperationToActivitiesList(memo, operation);
    } catch (err) {
      console.error(
        err.message,
        "| Operation:",
        JSON.stringify(operation, null, 2)
      );
      return memo;
    }
  }, initialBundlingData).activities;
}

/**
 * Gets all activities.
 */
export function allActivities(state: RahaState): List<Activity> {
  return addOperationsToActivities(state.operations);
}

/**
 * Get all NEW_MEMBER activities where the member has not yet been verified,
 * sorted newest to oldest.
 */
export const createUnverifiedMemberActivities = (
  state: RahaState
): List<Activity> => {
  return allActivities(state).filter(
    activity =>
      activity.type === ActivityType.NEW_MEMBER &&
      // length check sufficient since verified NEW_MEMBER activities have a
      // VERIFY_MEMBER operation at position 2
      activity.operations.length === 1
  );
};
