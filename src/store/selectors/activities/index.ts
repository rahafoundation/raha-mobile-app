import { Big } from "big.js";

import {
  Operation,
  OperationType,
  MintType,
  MintOperation,
  CreateMemberOperation,
  RequestVerificationOperation,
  VerifyOperation,
  GiveOperation,
  TrustOperation,
  EditMemberOperation
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
  let operations = state.operations;
  if (opFilter) {
    operations = operations.filter(opFilter);
  }
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
  activities: Activity[],
  operation: CreateMemberOperation
): Activity[] {
  const creatorMember = getOperationCreator(state, operation);
  const newActivity: Activity = {
    id: operation.id,
    timestamp: operation.created_at,
    content: {
      // type suggestions since GENESIS_MEMBER is only possible for
      // VERIFY operations
      actor: creatorMember as Member,
      description: ["just joined Raha!"],
      body: {
        type: BodyType.MEDIA,
        media: [videoReferenceForMember(creatorMember as Member)]
      }
    },
    operations: OrderedMap({ [operation.id]: operation })
  };

  return [...activities, newActivity];
}

function addEditMemberOperationToActivities(
  state: RahaState,
  activities: Activity[],
  operation: EditMemberOperation
): Activity[] {
  const creatorMember = getOperationCreator(state, operation);
  const newActivity: Activity = {
    id: operation.id,
    timestamp: operation.created_at,
    content: {
      // type suggestions since GENESIS_MEMBER is only possible for
      // VERIFY operations
      actor: creatorMember as Member,
      description: ["edited their profile information."]
    },
    operations: OrderedMap({ [operation.id]: operation })
  };

  return [...activities, newActivity];
}

function addRequestVerificationOperationToActivites(
  state: RahaState,
  activities: Activity[],
  operation: RequestVerificationOperation
): Activity[] {
  const creatorMember = getOperationCreator(state, operation);
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
      // type suggestions since GENESIS_MEMBER is only possible for
      // VERIFY operations
      actor: creatorMember as Member,
      description: ["requested a friend to verify their account."],
      body: {
        type: BodyType.MEDIA,
        media: [videoReferenceForMember(creatorMember as Member)]
      },
      nextInChain: {
        direction: ActivityDirection.NonDirectional,
        content: {
          actor: requestedMember
        }
      }
    },
    operations: OrderedMap({ [operation.id]: operation })
  };
  return [...activities, newActivity];
}

function addVerifyOperationToActivities(
  state: RahaState,
  activities: Activity[],
  operation: VerifyOperation
): Activity[] {
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
      actor: creatorMember,
      description: ["verified their friend's account!"],
      body: {
        type: BodyType.MEDIA,
        media: [videoReferenceForUri(operation.data.video_url)]
      },
      nextInChain: {
        direction: ActivityDirection.Forward,
        content: {
          actor: verifiedMember
        }
      }
    },
    operations: OrderedMap({ [operation.id]: operation })
  };
  return [...activities, newActivity];
}

function addGiveOperationToActivities(
  state: RahaState,
  activities: Activity[],
  operation: GiveOperation
): Activity[] {
  const creatorMember = getOperationCreator(state, operation);
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
      // type suggestions since GENESIS_MEMBER is only possible for
      // VERIFY operations
      actor: creatorMember as Member,
      description: ["gave", amountGiven, "for"],
      body: { type: BodyType.TEXT, text: operation.data.memo },
      nextInChain: {
        direction: ActivityDirection.Forward,
        content: {
          actor: givenToMember,
          description: ["donated", amountDonated],
          // TODO: make this configurable
          body: {
            type: BodyType.TEXT,
            text: "Because every life has value"
          },
          nextInChain: {
            direction: ActivityDirection.Forward,
            content: {
              actor: RAHA_BASIC_INCOME_MEMBER
            }
          }
        }
      }
    },
    operations: OrderedMap({ [operation.id]: operation })
  };
  return [...activities, newActivity];
}

function addMintOperationToActivities(
  state: RahaState,
  activities: Activity[],
  operation: MintOperation
): Activity[] {
  const creatorMember = getOperationCreator(state, operation);

  const amountMinted: CurrencyValue = {
    value: new Big(operation.data.amount),
    currencyType: CurrencyType.Raha,
    role: CurrencyRole.Transaction
  };

  switch (operation.data.type) {
    case MintType.BASIC_INCOME: {
      const newActivity: Activity = {
        id: operation.id,
        timestamp: operation.created_at,
        content: {
          // type suggestions since GENESIS_MEMBER is only possible for
          // VERIFY operations
          actor: creatorMember as Member,
          description: ["minted", amountMinted, "of basic income."],
          body: {
            type: BodyType.MINT_BASIC_INCOME
          },
          nextInChain: {
            direction: ActivityDirection.NonDirectional,
            content: {
              actor: RAHA_BASIC_INCOME_MEMBER
            }
          }
        },
        operations: OrderedMap({ [operation.id]: operation })
      };
      return [...activities, newActivity];
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
        return activities;
      }
      const newActivity: Activity = {
        id: operation.id,
        timestamp: operation.created_at,
        content: {
          // type suggestions since GENESIS_MEMBER is only possible for
          // VERIFY operations
          actor: creatorMember as Member,
          description: [
            "minted",
            amountMinted,
            "for inviting a friend to Raha!"
          ],
          body: {
            type: BodyType.MEDIA,
            media: [videoReferenceForMember(invitedMember)]
          },
          nextInChain: {
            direction: ActivityDirection.Bidirectional,
            content: {
              actor: invitedMember
            }
          }
        },
        operations: OrderedMap({ [operation.id]: operation })
      };
      return [...activities, newActivity];
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
      return activities;
  }
}

function addTrustOperationToActivities(
  state: RahaState,
  activities: Activity[],
  operation: TrustOperation
): Activity[] {
  const creatorMember = getOperationCreator(state, operation);

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
      // type suggestions since GENESIS_MEMBER is only possible for
      // VERIFY operations
      actor: creatorMember as Member,
      description: ["trusted a new friend"],
      body: {
        type: BodyType.TRUST_MEMBER
      },
      nextInChain: {
        direction: ActivityDirection.Forward,
        content: {
          actor: trustedMember
        }
      }
    },
    operations: OrderedMap({ [operation.id]: operation })
  };
  return [...activities, newActivity];
}

function addOperationToActivitiesList(
  state: RahaState,
  activities: Activity[],
  operation: Operation
): Activity[] {
  switch (operation.op_code) {
    case OperationType.CREATE_MEMBER: {
      return addCreateMemberOperationToActivites(state, activities, operation);
    }
    case OperationType.REQUEST_VERIFICATION: {
      return addRequestVerificationOperationToActivites(
        state,
        activities,
        operation
      );
    }
    case OperationType.VERIFY: {
      return addVerifyOperationToActivities(state, activities, operation);
    }
    case OperationType.GIVE: {
      return addGiveOperationToActivities(state, activities, operation);
    }
    case OperationType.MINT: {
      return addMintOperationToActivities(state, activities, operation);
    }
    case OperationType.TRUST: {
      return addTrustOperationToActivities(state, activities, operation);
    }
    case OperationType.INVITE:
      // We do not display any activity for Invite operations.
      return activities;
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
  return operations.reduce(
    (memo, operation) => {
      try {
        return addOperationToActivitiesList(state, memo, operation);
      } catch (err) {
        console.error(
          err.message,
          "| Operation:",
          JSON.stringify(operation, null, 2)
        );
        return memo;
      }
    },
    [] as Activity[]
  );
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
  if (content.actor === RAHA_BASIC_INCOME_MEMBER) {
    if (memberId === RAHA_BASIC_INCOME_MEMBER) {
      return true;
    }
  } else if (content.actor.get("memberId") === memberId) {
    return true;
  }

  if ("nextInChain" in content && !!content.nextInChain) {
    return activityContentContainsMember(content.nextInChain.content, memberId);
  }

  return false;
}

/**
 * Get all activities relevant to a member.
 *
 * TODO: make this more efficient.
 */
export const activitiesForMember = (state: RahaState, memberId: MemberId) => {
  return activities(state).filter(activity =>
    activityContentContainsMember(activity.content, memberId)
  );
};
