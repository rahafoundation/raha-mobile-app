import { Big } from "big.js";
import differenceInSeconds from "date-fns/differenceInSeconds";

import {
  Operation,
  OperationType,
  MintType,
  MintOperation,
  CreateMemberOperation,
  RequestVerificationOperation,
  VerifyOperation,
  GiveOperation,
  TrustOperation
} from "@raha/api-shared/dist/models/Operation";

import {
  Activity,
  VideoReference,
  ActivityDirection,
  ActivityContent,
  BodyType
} from "./types";
import { getMemberById, getUnverifiedMembers } from "../members";
import { RahaState } from "../../reducers";
import {
  Member,
  RAHA_BASIC_INCOME_MEMBER,
  GENESIS_MEMBER,
  GENESIS_VERIFY_OPS
} from "../../reducers/members";
import {
  CurrencyValue,
  CurrencyRole,
  CurrencyType
} from "../../../components/shared/elements/Currency";
import { getCreateMemberOperationFor } from "../operations";
import { List, OrderedMap } from "immutable";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";

function videoReferenceForUri(videoUri: string): VideoReference {
  return {
    videoUri,
    thumbnailUri: `${videoUri}.thumb.jpg`
  };
}

function videoReferenceForMember(member: Member): VideoReference {
  return videoReferenceForUri(member.videoUri);
}

/**
 * Get all activities in Raha history.
 * TODO: only get a subset, or at least a paginated list, of activities; this is
 * not scalable.
 * TODO: settle on filtering by either opFilter or activityFilter, both seem unecessary?
 *
 * @returns Activities to render in reverse chronological order (new -> old)
 */
export function activities(
  state: RahaState,
  opFilter?: (operation: Operation) => boolean
): Activity[] {
  const operations = opFilter
    ? state.operations.filter(opFilter)
    : state.operations;
  return convertOperationsToActivities(state, operations).reverse();
}

function getOperationCreator(
  state: RahaState,
  operation: Operation
): Member | typeof GENESIS_MEMBER {
  const member = GENESIS_VERIFY_OPS.includes(operation.id)
    ? GENESIS_MEMBER
    : getMemberById(state, operation.creator_uid);

  if (!member) {
    throw new Error(
      `Operation with missing creator (id: ${operation.creator_uid}), invalid.`
    );
  }

  return member;
}

function addCreateMemberOperationToActivites(
  state: RahaState,
  activities: OrderedMap<Activity["id"], Activity>,
  operation: CreateMemberOperation
): OrderedMap<Activity["id"], Activity> {
  // type suggestion since GENESIS_MEMBER is only possible for
  // VERIFY operations
  const creatorMember = getOperationCreator(state, operation) as Member;
  const inviterId = operation.data.request_invite_from_member_id;
  const inviter = inviterId ? getMemberById(state, inviterId) : undefined;

  const newActivity: Activity = {
    id: operation.id,
    timestamp: operation.created_at,
    content: {
      actors: OrderedMap({ [creatorMember.get("memberId")]: creatorMember }),
      description: ["just joined Raha!"],
      body: {
        bodyContent: {
          type: BodyType.MEDIA,
          media: [videoReferenceForMember(creatorMember)]
        },
        ...(inviter
          ? {
              nextInChain: {
                direction: ActivityDirection.Bidirectional,
                nextActivityContent: {
                  actors: OrderedMap({ [inviter.get("memberId")]: inviter }),
                  description: ["invited them to join Raha."]
                }
              }
            }
          : {})
      }
    },
    sourceOperations: OrderedMap({ [operation.id]: operation })
  };

  return activities.set(newActivity.id, newActivity);
}

function addRequestVerificationOperationToActivites(
  state: RahaState,
  activities: OrderedMap<Activity["id"], Activity>,
  operation: RequestVerificationOperation
): OrderedMap<Activity["id"], Activity> {
  // type suggestion since GENESIS_MEMBER is only possible for
  // VERIFY operations
  const creatorMember = getOperationCreator(state, operation) as Member;
  const requestedMember = getMemberById(state, operation.data.to_uid);
  if (!requestedMember) {
    throw new Error(
      `Request Verification operation with target member (id: ${
        operation.data.to_uid
      }) missing, invalid.`
    );
  }

  const newActivity: Activity = {
    id: operation.id,
    timestamp: operation.created_at,
    content: {
      actors: OrderedMap({ [creatorMember.get("memberId")]: creatorMember }),
      description: ["requested a friend to verify their account."],
      body: {
        bodyContent: {
          type: BodyType.MEDIA,
          media: [videoReferenceForMember(creatorMember)]
        },
        nextInChain: {
          direction: ActivityDirection.NonDirectional,
          nextActivityContent: {
            actors: OrderedMap({
              [requestedMember.get("memberId")]: requestedMember
            })
          }
        }
      }
    },
    sourceOperations: OrderedMap({ [operation.id]: operation })
  };
  return activities.set(newActivity.id, newActivity);
}

function addVerifyOperationToActivities(
  state: RahaState,
  activities: OrderedMap<Activity["id"], Activity>,
  operation: VerifyOperation
): OrderedMap<Activity["id"], Activity> {
  const creatorMember = getOperationCreator(state, operation);
  const verifiedMember = getMemberById(state, operation.data.to_uid);
  if (!verifiedMember) {
    throw new Error(
      `Verify operation with target member (id: ${
        operation.data.to_uid
      } missing, invalid.`
    );
  }

  if (creatorMember === GENESIS_MEMBER) {
    // don't display the genesis verify ops
    return activities;
  }

  const newActivity: Activity = {
    id: operation.id,
    timestamp: operation.created_at,
    content: {
      actors: OrderedMap({ [creatorMember.get("memberId")]: creatorMember }),
      description: ["verified their friend's account!"],
      body: {
        bodyContent: {
          type: BodyType.MEDIA,
          media: [videoReferenceForUri(operation.data.video_url)]
        },

        nextInChain: {
          direction: ActivityDirection.Forward,
          nextActivityContent: {
            actors: OrderedMap({
              [verifiedMember.get("memberId")]: verifiedMember
            })
          }
        }
      }
    },
    sourceOperations: OrderedMap({ [operation.id]: operation })
  };
  return activities.set(newActivity.id, newActivity);
}

function addGiveOperationToActivities(
  state: RahaState,
  activities: OrderedMap<Activity["id"], Activity>,
  operation: GiveOperation
): OrderedMap<Activity["id"], Activity> {
  // type suggestion since GENESIS_MEMBER is only possible for
  // VERIFY operations
  const creatorMember = getOperationCreator(state, operation) as Member;
  const givenToMember = getMemberById(state, operation.data.to_uid);
  if (!givenToMember) {
    console.error(
      `Give operation with target member (id: ${
        operation.data.to_uid
      }) missing, invalid.`
    );
    return activities;
  }

  const amountDonated: CurrencyValue = {
    value: new Big(operation.data.donation_amount),
    role: CurrencyRole.Donation,
    currencyType: CurrencyType.Raha
  };
  const amountGiven: CurrencyValue = {
    value: amountDonated.value.plus(new Big(operation.data.amount)),
    role: CurrencyRole.Transaction,
    currencyType: CurrencyType.Raha
  };
  const newActivity: Activity = {
    id: operation.id,
    timestamp: operation.created_at,
    content: {
      actors: OrderedMap({ [creatorMember.get("memberId")]: creatorMember }),
      description: ["gave", amountGiven, "for"],
      body: {
        bodyContent: {
          type: BodyType.TEXT,
          text: operation.data.memo
        },
        nextInChain: {
          direction: ActivityDirection.Forward,
          nextActivityContent: {
            actors: OrderedMap({
              [givenToMember.get("memberId")]: givenToMember
            }),
            description: ["donated", amountDonated],
            // TODO: make this configurable
            body: {
              bodyContent: {
                type: BodyType.TEXT,
                text: "Because every life has value"
              },
              nextInChain: {
                direction: ActivityDirection.Forward,
                nextActivityContent: {
                  actors: RAHA_BASIC_INCOME_MEMBER
                }
              }
            }
          }
        }
      }
    },
    sourceOperations: OrderedMap({ [operation.id]: operation })
  };
  return activities.set(newActivity.id, newActivity);
}

function addOperationToBundledBasicIncomeMintActivity(
  basicIncomeCache: Required<BundledActivitiesCache>["bundledBasicIncome"],
  existingActivity: Activity,
  operation: MintOperation,
  creatorMember: Member
): {
  bundledActivity: Activity;
  newBasicIncomeCache: typeof basicIncomeCache;
} {
  if (existingActivity.content.actors === RAHA_BASIC_INCOME_MEMBER) {
    throw new Error(
      "Unexpected: RAHA_BASIC_INCOME_MEMBER was minting a basic income?"
    );
  }
  const { runningTotal, operations } = basicIncomeCache;
  const newTotal = runningTotal.add(operation.data.amount);
  const newBasicIncomeCache: typeof basicIncomeCache = {
    ...basicIncomeCache,
    operations: operations.push(operation),
    runningTotal: newTotal
  };

  const totalMinted: CurrencyValue = {
    value: newTotal,
    currencyType: CurrencyType.Raha,
    role: CurrencyRole.Transaction
  };

  const individualMintActivity = createIndividualBasicIncomeMintActivity(
    creatorMember,
    operation
  );
  const bundledActivity: Activity = {
    ...existingActivity,
    // use the newest operation's timestamp
    timestamp:
      existingActivity.timestamp > operation.created_at
        ? existingActivity.timestamp
        : operation.created_at,
    content: {
      ...existingActivity.content,
      description: ["minted a total of", totalMinted, "of basic income."],
      // TODO: show the most relevant members to the logged in member first, not
      // just in the order they're found
      // Only add the actor if they aren't already in the list, to prevent
      // duplicates
      actors: existingActivity.content.actors.set(
        creatorMember.get("memberId"),
        creatorMember
      )
    },
    sourceOperations: existingActivity.sourceOperations.set(
      operation.id,
      operation
    ),
    unbundledActivities: existingActivity.unbundledActivities
      ? existingActivity.unbundledActivities.set(
          operation.id,
          individualMintActivity
        )
      : OrderedMap({ [operation.id]: individualMintActivity })
  };

  return {
    bundledActivity,
    newBasicIncomeCache
  };
}

function createIndividualBasicIncomeMintActivity(
  creatorMember: Member,
  operation: MintOperation
): Activity {
  const amountMinted: CurrencyValue = {
    value: new Big(operation.data.amount),
    currencyType: CurrencyType.Raha,
    role: CurrencyRole.Transaction
  };

  return {
    id: operation.id,
    timestamp: operation.created_at,
    content: {
      actors: OrderedMap({
        [creatorMember.get("memberId")]: creatorMember
      }),
      description: ["minted", amountMinted, "of basic income."],
      body: {
        bodyContent: {
          type: BodyType.MINT_BASIC_INCOME
        },
        nextInChain: {
          direction: ActivityDirection.NonDirectional,
          nextActivityContent: {
            actors: RAHA_BASIC_INCOME_MEMBER
          }
        }
      }
    },
    sourceOperations: OrderedMap({ [operation.id]: operation })
  };
}

function addMintOperationToActivities(
  state: RahaState,
  bundledActivitiesCache: BundledActivitiesCache,
  activities: OrderedMap<Activity["id"], Activity>,
  operation: MintOperation
): {
  activities: OrderedMap<Activity["id"], Activity>;
  bundledActivitiesCache: BundledActivitiesCache;
} {
  // type suggestion since GENESIS_MEMBER is only possible for
  // VERIFY operations
  const creatorMember = getOperationCreator(state, operation) as Member;

  const amountMinted: CurrencyValue = {
    value: new Big(operation.data.amount),
    currencyType: CurrencyType.Raha,
    role: CurrencyRole.Transaction
  };

  switch (operation.data.type) {
    case MintType.BASIC_INCOME: {
      // if cache is present, consider combining this basic income mint
      // operation with existing activity
      if (bundledActivitiesCache.bundledBasicIncome) {
        // check if difference in time is too long before merging
        const bundledActivityId =
          bundledActivitiesCache.bundledBasicIncome.bundledActivityId;
        const bundledActivity = activities.get(bundledActivityId);
        if (!bundledActivity) {
          // TODO: error handling that doesn't just kill the current mint operation?
          throw new Error("Bundling failed; existing activity missing");
        }

        if (
          differenceInSeconds(operation.created_at, bundledActivity.timestamp) <
          MAX_MINT_SECONDS
        ) {
          // difference short enough—merge it
          const newData = addOperationToBundledBasicIncomeMintActivity(
            bundledActivitiesCache.bundledBasicIncome,
            bundledActivity,
            operation,
            creatorMember
          );
          return {
            activities: activities.set(
              bundledActivityId,
              newData.bundledActivity
            ),
            bundledActivitiesCache: {
              ...bundledActivitiesCache,
              bundledBasicIncome: newData.newBasicIncomeCache
            }
          };
        }
      }

      const newActivity = createIndividualBasicIncomeMintActivity(
        creatorMember,
        operation
      );
      // either nothing to merge since cache was empty, or difference was too
      // long. Reset the cache and create a new activity
      const newBasicIncomeCache: typeof bundledActivitiesCache.bundledBasicIncome = {
        bundledActivityId: newActivity.id,
        runningTotal: amountMinted.value,
        operations: List([operation])
      };

      return {
        activities: activities.set(newActivity.id, newActivity),
        bundledActivitiesCache: {
          ...bundledActivitiesCache,
          bundledBasicIncome: newBasicIncomeCache
        }
      };
    }
    case MintType.REFERRAL_BONUS: {
      const invitedMember = getMemberById(
        state,
        operation.data.invited_member_id
      );
      if (!invitedMember) {
        console.error(
          `Mint operation with invited member (id: ${
            operation.data.invited_member_id
          }) missing, invalid.`
        );
        return {
          activities,
          bundledActivitiesCache
        };
      }
      const newActivity: Activity = {
        id: operation.id,
        timestamp: operation.created_at,
        content: {
          actors: OrderedMap({
            [creatorMember.get("memberId")]: creatorMember
          }),
          description: [
            "minted",
            amountMinted,
            "for inviting a friend to Raha!"
          ],
          body: {
            bodyContent: {
              type: BodyType.MEDIA,
              media: [videoReferenceForMember(invitedMember)]
            },
            nextInChain: {
              direction: ActivityDirection.Bidirectional,
              nextActivityContent: {
                actors: OrderedMap({
                  [invitedMember.get("memberId")]: invitedMember
                })
              }
            }
          }
        },
        sourceOperations: OrderedMap({ [operation.id]: operation })
      };
      return {
        activities: activities.set(newActivity.id, newActivity),
        bundledActivitiesCache
      };
    }
    default:
      // Shouldn't happen. Type assertion is because TypeScript also thinks
      // this should never happen.
      // TODO: ensure this error gets sent somewhere
      console.error(
        new Error(
          `Invalid operation: Unrecognized Mint type "${(operation as MintOperation)
            .data.type as MintType}". Operation: ${JSON.stringify(operation)}`
        )
      );
      return {
        activities,
        bundledActivitiesCache
      };
  }
}

function addTrustOperationToActivities(
  state: RahaState,
  activities: OrderedMap<Activity["id"], Activity>,
  operation: TrustOperation
): OrderedMap<Activity["id"], Activity> {
  // type suggestion since GENESIS_MEMBER is only possible for
  // VERIFY operations
  const creatorMember = getOperationCreator(state, operation) as Member;
  const trustedMember = getMemberById(state, operation.data.to_uid);
  if (!trustedMember) {
    console.error(
      `Trust operation with target member (id: ${
        operation.data.to_uid
      }) missing, invalid.`
    );
    return activities;
  }

  const newActivity: Activity = {
    id: operation.id,
    timestamp: operation.created_at,
    content: {
      actors: OrderedMap({ [creatorMember.get("memberId")]: creatorMember }),
      description: ["trusted a new friend"],
      body: {
        bodyContent: {
          type: BodyType.TRUST_MEMBER
        },
        nextInChain: {
          direction: ActivityDirection.Forward,
          nextActivityContent: {
            actors: OrderedMap({
              [trustedMember.get("memberId")]: trustedMember
            })
          }
        }
      }
    },
    sourceOperations: OrderedMap({ [operation.id]: operation })
  };
  return activities.set(newActivity.id, newActivity);
}

function addOperationToActivitiesList(
  state: RahaState,
  bundledActivitiesCache: BundledActivitiesCache,
  activities: OrderedMap<Activity["id"], Activity>,
  operation: Operation
): {
  activities: OrderedMap<Activity["id"], Activity>;
  bundledActivitiesCache: BundledActivitiesCache;
} {
  switch (operation.op_code) {
    case OperationType.CREATE_MEMBER: {
      return {
        activities: addCreateMemberOperationToActivites(
          state,
          activities,
          operation
        ),
        bundledActivitiesCache
      };
    }
    case OperationType.REQUEST_VERIFICATION: {
      return {
        activities: addRequestVerificationOperationToActivites(
          state,
          activities,
          operation
        ),
        bundledActivitiesCache
      };
    }
    case OperationType.VERIFY: {
      return {
        activities: addVerifyOperationToActivities(
          state,
          activities,
          operation
        ),
        bundledActivitiesCache
      };
    }
    case OperationType.GIVE: {
      return {
        activities: addGiveOperationToActivities(state, activities, operation),
        bundledActivitiesCache
      };
    }
    case OperationType.MINT: {
      return addMintOperationToActivities(
        state,
        bundledActivitiesCache,
        activities,
        operation
      );
    }
    case OperationType.TRUST: {
      return {
        activities: addTrustOperationToActivities(state, activities, operation),
        bundledActivitiesCache
      };
    }
    case OperationType.INVITE:
      // We do not display any activity for Invite operations. Whether or not
      // a newly joined member was invited, is retrieved from the
      // `request_invite_from_member_id` field on the `CREATE_MEMBER` operation.
      return { activities, bundledActivitiesCache };
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

const MAX_MINT_SECONDS = 3 * 60 * 60; // 3 hours
interface BundledActivitiesCache {
  // bundling policy: bundle all mint operations whose timestamps are
  // between the first collected one, to the MAX_MINT_SECONDS later.
  bundledBasicIncome?: {
    bundledActivityId: Activity["id"];
    operations: List<MintOperation>;
    runningTotal: Big;
  };
}

/**
 * Interpret a list of operations as a list of activities.
 * TODO: make this more sophisticated, so that it's not just a one-to-one
 * mapping from ops to activities
 * TODO: don't encode the actual string values of activities here; otherwise
 * internationalization and stuff like that gets harder. That's display
 * logic, so just provide blobs with the necessary info to render it in the
 * view layer.
 *
 * @param operations All operations, expected in chronological order, oldest
 * first.
 */
export function convertOperationsToActivities(
  state: RahaState,
  operations: List<Operation>
): Activity[] {
  return operations
    .reduce(
      (memo, operation) => {
        try {
          return addOperationToActivitiesList(
            state,
            memo.bundledActivitiesCache,
            memo.activities,
            operation
          );
        } catch (err) {
          console.error(
            err.message,
            "| Operation:",
            JSON.stringify(operation, null, 2)
          );
          return memo;
        }
      },
      {
        activities: OrderedMap<Activity["id"], Activity>(),
        bundledActivitiesCache: {} as BundledActivitiesCache
      }
    )
    .activities.valueSeq()
    .toArray();
}

/**
 * Get all activities that specifically are pending invites, sorted newest to
 * oldest.
 *
 * DANGER: this filters operations directly and creates a custom list of
 * Activities rather than going through the global activities list, so we should
 * probably ensure that this remains correct once operations and activities are no
 * longer 1:1.
 */
export const pendingInviteActivities = (state: RahaState): Activity[] => {
  return convertOperationsToActivities(
    state,
    (getUnverifiedMembers(state)
      .map(member => getCreateMemberOperationFor(state, member))
      .filter(op => !!op) as List<CreateMemberOperation>).sort(
      (op1, op2) =>
        // hack since API has type bug: dates aren't actually being boxed into
        // Date objects.
        new Date(op2.created_at).getTime() - new Date(op1.created_at).getTime()
    )
  );
};

/**
 * A piece of content is considered relevant to a member if that member is
 * an actor in any part of the action chain.
 */
function activityContentContainsMember(
  content: ActivityContent,
  memberId: MemberId | typeof RAHA_BASIC_INCOME_MEMBER
): boolean {
  if (memberId === RAHA_BASIC_INCOME_MEMBER) {
    if (content.actors === RAHA_BASIC_INCOME_MEMBER) {
      return true;
    }
  } else if (
    content.actors !== RAHA_BASIC_INCOME_MEMBER &&
    content.actors.map(a => (a as Member).get("memberId")).includes(memberId)
  ) {
    return true;
  }

  if (
    content.body &&
    "nextInChain" in content.body &&
    !!content.body.nextInChain
  ) {
    return activityContentContainsMember(
      content.body.nextInChain.nextActivityContent,
      memberId
    );
  }

  return false;
}

/**
 * Get all activities relevant to a member.
 *
 * TODO: make this more efficient.
 * @param options Details: {
 *   unbundleActivities: if an activity is bundled, don't return the bundled
 *   activity, but the unbundled ones that are relevant to that user. Useful for
 *   things like bundled mint activities on the profile page.
 * }
 */
export const activitiesForMember = (
  state: RahaState,
  memberId: MemberId,
  options?: {
    unbundleActivities?: boolean;
  }
): Activity[] => {
  const defaultOptions = {
    unbundleActivities: false
  };
  const resolvedOptions: typeof options = {
    ...defaultOptions,
    ...(options || {})
  };
  const { unbundleActivities } = resolvedOptions;

  const filteredActivities = activities(state).filter(activity =>
    activityContentContainsMember(activity.content, memberId)
  );

  if (!unbundleActivities) {
    return filteredActivities;
  }

  return filteredActivities
    .map(maybeBundledActivity => {
      if (!maybeBundledActivity.unbundledActivities) {
        // not bundled, so just return it
        return maybeBundledActivity;
      }

      // definitely bundled
      return maybeBundledActivity.unbundledActivities
        .valueSeq()
        .filter(activity =>
          activityContentContainsMember(activity.content, memberId)
        )
        .toArray();
    })
    .reduce((memo: Activity[], activity) => {
      if (activity instanceof Array) {
        return [...memo, ...activity];
      }
      return [...memo, activity];
    }, []);
};
