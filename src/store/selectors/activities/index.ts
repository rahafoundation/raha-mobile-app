import {
  Operation,
  OperationType,
  MintType,
  CreateMemberOperation,
  VerifyOperation,
  FlagMemberOperation,
  ResolveFlagMemberOperation,
  TipGiveOperation,
  GiveType,
  DirectGiveOperation
} from "@raha/api-shared/dist/models/Operation";

import {
  Activity,
  NewMemberRelatedOperations,
  MintBasicIncomeOperation,
  MintReferralBonusOperation,
  ActivityType,
  IndependentOperation,
  ChildOperation
} from "./types";
import { RahaState } from "../../reducers";
import { List, Map } from "immutable";
import {
  MemberId,
  OperationId
} from "@raha/api-shared/dist/models/identifiers";
import { GENESIS_VERIFY_OPS } from "../../reducers/members";

interface NewMemberCacheValues {
  index: number;
}

interface FlagMemberCacheValues {
  index: number;
}

/**
 * Optional data structure that speeds up creation of Activities from Operations
 */
interface ActivityBundlingCache {
  // member id -> index of corresponding NEW_MEMBER activity in the list
  newMember: Map<MemberId, NewMemberCacheValues>;
  flagMember: Map<OperationId, FlagMemberCacheValues>;

  // operation id -> list of children ops for that operation
  childrenOps: Map<OperationId, ChildOperation[]>;
}

/**
 * Data required when building up activities list.
 */
interface InitialActivityBundlingData {
  activities: List<Activity>;
  bundlingCache?: ActivityBundlingCache;
}

type ActivityBundlingData = Required<InitialActivityBundlingData>;

/**
 * Adds an independent operation to the existing ones; if an index is specified,
 * overwrites the data at that index rather than pushing to the end.
 */
function addIndependentOperation(
  existingData: ActivityBundlingData,
  operation: IndependentOperation,
  index?: number
): ActivityBundlingData {
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
  { activities, bundlingCache }: ActivityBundlingData,
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
  existingData: ActivityBundlingData,
  operation: CreateMemberOperation
): ActivityBundlingData {
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

function addDirectGiveOperation(
  existingData: ActivityBundlingData,
  operation: DirectGiveOperation
): ActivityBundlingData {
  const newActivity: Activity = {
    type: ActivityType.GIVE,
    operations: operation
  };

  return {
    activities: existingData.activities.push(newActivity),
    bundlingCache: existingData.bundlingCache
  };
}

/**
 * Adds a VERIFY_MEMBER operation to the in-progress list of Activities.
 *
 * Behavior: An existing NEW_MEMBER operation is expected to exist,
 * since VERIFY_MEMBER operations should only happen for members that already
 * have CREATE_MEMBER operations.
 *
 * Additionally, we prefer the VERIFY_MEMBER operations on NEW_MEMBER activities
 * to be from the inviter, but they can have one from others.
 *
 * So, three scenarios: Corresponding NEW_MEMBER activity...
 * - doesn't have a VERIFY_MEMBER operation yet: Add this one to that NEW_MEMBER
 *   activity
 * - has a VERIFY_MEMBER operation corresponding to the new member's inviter:
 *   create this as an INDEPENDENT_OPERATION activity
 * - has a VERIFY_MEMBER operation, but this new one comes from the inviter:
 *   Replace the previous NEW_MEMBER activity with the old VERIFY_MEMBER
 *   operation as an INDEPENDENT_OPERATION activity, and add a new NEW_MEMBER
 *   activity replacing the previous VERIFY_MEMBER operation with this one from
 *   the inviter.
 *   - we don't need to worry about messing up timestamps, since a referral
 *     bonus mint activity also shouldn't exist yet (because this VERIFY_MEMBER
 *     operation comes from the inviter, which should precede the inviter
 *     minting a referral bonus) so the timestamp would already naturally be
 *     that of the previous VERIFY_MEMBER operation
 */
function addVerifyMemberOperation(
  existingData: ActivityBundlingData,
  operation: VerifyOperation
): ActivityBundlingData {
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
  existingData: ActivityBundlingData,
  operation: MintReferralBonusOperation
): ActivityBundlingData {
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

  const [createMemberOperation] = newMemberActivity.operations;

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

function addFlagMemberOperation(
  existingData: ActivityBundlingData,
  operation: FlagMemberOperation
): ActivityBundlingData {
  const { activities, bundlingCache } = existingData;

  const nextIndex = activities.size;
  return {
    activities: activities.push({
      type: ActivityType.FLAG_MEMBER,
      operations: [operation]
    }),
    bundlingCache: {
      ...bundlingCache,
      flagMember: bundlingCache.flagMember.set(operation.id, {
        index: nextIndex
      })
    }
  };
}

function addResolveFlagMemberOperation(
  existingData: ActivityBundlingData,
  operation: ResolveFlagMemberOperation
): ActivityBundlingData {
  const { activities, bundlingCache } = existingData;

  const existingActivityCacheData = bundlingCache.flagMember.get(
    operation.data.flag_operation_id
  );

  if (!existingActivityCacheData) {
    // Could this actually be a normal situation? Maybe if we only load "most-recent" operations? I think we should load "most-recent" activities instead of raw operations.
    console.warn(
      "Could not find an existing FLAG_MEMBER activity for RESOLVE_FLAG_MEMBER operation. Not applying operation."
    );
    return existingData;
  }

  const existingActivity = activities.get(existingActivityCacheData.index);
  if (!existingActivity) {
    console.warn(
      "The activity indicated by the cache does not exist. Not applying operation."
    );
    return existingData;
  }
  if (existingActivity.type !== ActivityType.FLAG_MEMBER) {
    console.warn(
      "The activity indicated by the cache for this ResolveMemberFlag operation does not have the expected FLAG_MEMBER activity type. Not applying operation."
    );
    return existingData;
  }

  // We need to remove and re-add the existing activity to update its
  // chronoligical position in the activities list.
  const activitiesWithExistingActivityRemoved = activities.remove(
    existingActivityCacheData.index
  );
  const newIndex = activitiesWithExistingActivityRemoved.size;

  return {
    activities: activitiesWithExistingActivityRemoved.push({
      ...existingActivity,
      operations: [...existingActivity.operations, operation]
    }),
    bundlingCache: {
      ...bundlingCache,
      flagMember: bundlingCache.flagMember.set(
        operation.data.flag_operation_id,
        { index: newIndex }
      )
    }
  };
}

/**
 * Adds a tip operation, which is a child operation that cannot existing on its own.
 * Saves the tips in a child operations map which gets processed after the
 * creation of all activities so that we don't have to rely on processing order
 * of activities to attach them.
 */
function addTipOperation(
  existingData: ActivityBundlingData,
  operation: TipGiveOperation
): ActivityBundlingData {
  const { activities, bundlingCache } = existingData;
  const target_operation_id = operation.data.metadata.target_operation;
  if (!target_operation_id) {
    throw new Error(
      `Unexpected tip operation without a parent ID: ${JSON.stringify(
        operation,
        null,
        2
      )}`
    );
  }

  const existingArray = bundlingCache.childrenOps.get(target_operation_id);
  const newChildOps = existingArray
    ? existingArray.concat(operation)
    : [operation];
  return {
    activities: activities,
    bundlingCache: {
      ...bundlingCache,
      childrenOps: bundlingCache.childrenOps.set(
        target_operation_id,
        newChildOps
      )
    }
  };
}

/**
 * Add a single operation to a list in progress of activities. Keeps track not
 * just of the final list, but of cached data to optimize the creation of
 * Activities.
 */
function addOperationToActivitiesList(
  existingData: ActivityBundlingData,
  operation: Operation
): ActivityBundlingData {
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
    case OperationType.FLAG_MEMBER:
      return addFlagMemberOperation(existingData, operation);
    case OperationType.RESOLVE_FLAG_MEMBER:
      return addResolveFlagMemberOperation(existingData, operation);
    case OperationType.GIVE:
      if (operation.data.metadata) {
        switch (operation.data.metadata.type) {
          case GiveType.DIRECT_GIVE:
            return addDirectGiveOperation(
              existingData,
              operation as DirectGiveOperation
            );
          case GiveType.TIP:
            return addTipOperation(existingData, operation as TipGiveOperation);
          default:
            throw new Error(
              `Unexpected GIVE operation data type. Operation: ${JSON.stringify(
                operation,
                null,
                2
              )}`
            );
        }
      }
    case OperationType.EDIT_MEMBER:
    case OperationType.REQUEST_VERIFICATION:
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
  existingData?: InitialActivityBundlingData
): List<Activity> {
  const initialBundlingData: ActivityBundlingData = existingData
    ? {
        ...existingData,
        bundlingCache: existingData.bundlingCache
          ? existingData.bundlingCache
          : { newMember: Map(), flagMember: Map(), childrenOps: Map() }
      }
    : {
        activities: List(),
        bundlingCache: {
          newMember: Map(),
          flagMember: Map(),
          childrenOps: Map()
        }
      };

  const result = newOperations.reduce((memo, operation) => {
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
  }, initialBundlingData);

  if (result.bundlingCache.childrenOps) {
    // Add all children operations to the associated activity
    const merged = result.activities.map(activity => {
      if (activity.type === ActivityType.GIVE) {
        return {
          ...activity,
          childOperations: mergeChildOpsForOps(
            Array.isArray(activity.operations)
              ? activity.operations
              : [activity.operations],
            result.bundlingCache.childrenOps
          )
        };
      } else {
        return activity;
      }
    });
    return merged;
  } else {
    return result.activities;
  }
}

function mergeChildOpsForOps(
  ops: Operation[],
  childOps: Map<OperationId, ChildOperation[]>
): ChildOperation[] {
  // for each op, add up all the child ops
  return ops.reduce(
    (allChildOps, op) => {
      const children = childOps.get(op.id);
      if (children) {
        return allChildOps.concat(children);
      } else {
        return allChildOps;
      }
    },
    [] as ChildOperation[]
  );
}

interface InitialActivityBundlingData {
  activities: List<Activity>;
  bundlingCache?: ActivityBundlingCache;
}

/**
 * Gets all activities in chronological order (old -> new).
 *
 * TODO: make this more efficient. May naturally happen as we move this
 * functionality to backend.
 * - don't recreate the history every time (memoize the selector)
 * - don't return all of them, probably paginate
 */
export function allActivities(state: RahaState): List<Activity> {
  return addOperationsToActivities(state.operations);
}

/**
 * Gets all activities that involve a set of specified members, in chronological
 * order (old -> new).
 *
 * TODO: make this more efficient
 */
export function activitiesInvolvingMembers(
  state: RahaState,
  members: MemberId[]
): List<Activity> {
  // search all activities
  return allActivities(state).filter(activity => {
    const operations: Operation[] = Array.isArray(activity.operations)
      ? activity.operations
      : [activity.operations];

    // if can find matching member in an operation, accept this activity
    return !!operations.find(operation => {
      if (members.includes(operation.creator_uid)) {
        return true;
      }

      // search all the fields in `operation.data` for member ID
      // this is a blunt tool, because we don't have consistency on where member
      // IDs are stored in operations. Consider reworking operations to be more
      // consistent, to make this more straightforward.
      const operationDataKeys = Object.keys(
        operation.data
      ) as (keyof typeof operation.data)[];

      return !!operationDataKeys.find(key =>
        members.includes(operation.data[key])
      );
    });
  });
}

/**
 * Get all Verify Member activities; Also extracts bundled VERIFY operations
 * from NEW_MEMBER activities into INDEPENDENT_OPERATIONs. Useful for profile
 * verified members list.
 */
export function filterVerifyMemberActivities(
  activities: List<Activity>
): List<Activity> {
  return activities
    .filter(
      a =>
        a.type === ActivityType.NEW_MEMBER ||
        (a.type === ActivityType.INDEPENDENT_OPERATION &&
          a.operations.op_code === OperationType.VERIFY)
    )
    .reduce((newList, a) => {
      if (a.type === ActivityType.INDEPENDENT_OPERATION) {
        return newList.push(a);
      }
      const verifyOperation = (a.operations as Operation[]).find(
        o => o.op_code === OperationType.VERIFY
      ) as VerifyOperation | undefined;
      if (!verifyOperation) {
        return newList;
      }
      const verifyActivity: Activity = {
        type: ActivityType.INDEPENDENT_OPERATION,
        operations: verifyOperation
      };
      return newList.push(verifyActivity);
    }, List<Activity>());
}

export function isGenesisVerificationActivity(activity: Activity): boolean {
  if (activity.type === ActivityType.INDEPENDENT_OPERATION) {
    return GENESIS_VERIFY_OPS.includes(activity.operations.id);
  }

  return !!(activity.operations as Operation[]).find(o =>
    GENESIS_VERIFY_OPS.includes(o.id)
  );
}
/**
 * Get all NEW_MEMBER activities where the member has not yet been verified,
 * sorted newest to oldest.
 */
export function unverifiedCreateMemberActivities(
  state: RahaState
): List<Activity> {
  return allActivities(state).filter(
    activity =>
      activity.type === ActivityType.NEW_MEMBER &&
      // length check sufficient since verified NEW_MEMBER activities have a
      // VERIFY_MEMBER operation at position 2
      activity.operations.length === 1
  );
}
