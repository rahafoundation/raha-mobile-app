import { Big } from "big.js";

import {
  Operation,
  OperationType,
  MintType,
  MintOperation
} from "@raha/api-shared/dist/models/Operation";

import {
  Activity,
  VideoReference,
  ActivityDirection,
  ActivityContent,
  BodyType
} from "./types";
import { getMemberById } from "../members";
import { RahaState } from "../../reducers";
import {
  Member,
  RAHA_BASIC_INCOME_MEMBER,
  GENESIS_MEMBER,
  GENESIS_TRUST_OPS,
  GENESIS_REQUEST_INVITE_OPS
} from "../../reducers/members";
import {
  CurrencyValue,
  CurrencyRole,
  CurrencyType
} from "../../../components/shared/Currency";
import { isUnconfirmedRequestInvite } from "../operations";
import { List } from "immutable";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";

function videoReferenceForMember(member: Member): VideoReference {
  return {
    videoUri: member.videoUri,
    thumbnailUri: `${member.videoUri}.thumb.jpg`
  };
}

/**
 * Get all activities in Raha history.
 * TODO: only get a subset, or at least a paginated list, of activities; this is
 * not scalable.
 *
 * @returns Activities to render in reverse chronological order (new -> old)
 */
export function allActivities(state: RahaState): Activity[] {
  return convertOperationsToActivities(state, state.operations).reverse();
}

/**
 * Interpret a list of operations as a list of activities.
 * TODO: make this more sophisticated, so that it's not just a one-to-one
 * mapping from ops to activities
 *
 * @param operations All operations, expected in chronological order, oldest
 * first.
 */
function convertOperationsToActivities(
  state: RahaState,
  operations: List<Operation>
): Activity[] {
  return operations.reduce(
    (memo, operation) => {
      const creatorMember = GENESIS_TRUST_OPS.includes(operation.id)
        ? GENESIS_MEMBER
        : getMemberById(state, operation.creator_uid);
      if (!creatorMember) {
        console.error(
          `Operation with missing creator (id: ${
            operation.creator_uid
          }), invalid.`,
          JSON.stringify(operation)
        );
        return memo;
      }

      switch (operation.op_code) {
        case OperationType.CREATE_MEMBER: {
          const newActivity: Activity = {
            id: operation.id,
            timestamp: operation.created_at,
            content: {
              // type suggestions since GENESIS_MEMBER is only possible for
              // TRUST operations
              actor: creatorMember as Member,
              description: ["just joined Raha!"],
              body: {
                type: BodyType.MEDIA,
                media: [videoReferenceForMember(creatorMember as Member)]
              }
            }
          };

          return [...memo, newActivity];
        }
        case OperationType.REQUEST_VERIFICATION: {
          const requestedMember = getMemberById(state, operation.data.to_uid);
          if (!requestedMember) {
            console.error(
              `Request Verification operation with target member (id: ${
                operation.data.to_uid
              }) missing, invalid.`
            );
            return memo;
          }

          const newActivity: Activity = {
            id: operation.id,
            timestamp: operation.created_at,
            content: {
              // type suggestions since GENESIS_MEMBER is only possible for
              // TRUST operations
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
            }
          };
          return [...memo, newActivity];
        }
        case OperationType.VERIFY: {
          const verifiedMember = getMemberById(state, operation.data.to_uid);
          if (!verifiedMember) {
            console.error(
              `Verify operation with target member (id: ${
                operation.data.to_uid
              } missing, invalid.`
            );
            return memo;
          }

          const newActivity: Activity = {
            id: operation.id,
            timestamp: operation.created_at,
            content: {
              // type suggestions since GENESIS_MEMBER is only possible for
              // TRUST operations
              actor: creatorMember as Member,
              description: ["verified their friend's account!"],
              body: {
                type: BodyType.MEDIA,
                media: [videoReferenceForMember(creatorMember as Member)]
              },
              nextInChain: {
                direction: ActivityDirection.Forward,
                content: {
                  actor: verifiedMember
                }
              }
            }
          };
          return [...memo, newActivity];
        }
        case OperationType.GIVE: {
          const givenToMember = getMemberById(state, operation.data.to_uid);
          if (!givenToMember) {
            console.error(
              `Give operation with target member (id: ${
                operation.data.to_uid
              }) missing, invalid.`
            );
            return memo;
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
              // TRUST operations
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
            }
          };
          return [...memo, newActivity];
        }
        case OperationType.MINT: {
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
                  // TRUST operations
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
                }
              };
              return [...memo, newActivity];
            }
            case MintType.REFERRAL_BONUS: {
              const invitedMember = getMemberById(
                state,
                operation.data.invited_member_id
              );
              if (!invitedMember) {
                console.error(
                  `Mint operation with invted member (id: ${
                    operation.data.invited_member_id
                  }) missing, invalid.`
                );
                return memo;
              }
              const newActivity: Activity = {
                id: operation.id,
                timestamp: operation.created_at,
                content: {
                  // type suggestions since GENESIS_MEMBER is only possible for
                  // TRUST operations
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
                }
              };
              return [...memo, newActivity];
            }
            default:
              // Shouldn't happen. Type assertion is because TypeScript also thinks
              // this should never happen.
              // TODO: ensure this error gets sent somewhere
              console.error(
                new Error(
                  `Invalid operation: Unrecognized Mint type "${(operation as MintOperation)
                    .data.type as MintType}". Operation: ${JSON.stringify(
                    operation
                  )}`
                )
              );
              return memo;
          }
        }

        case OperationType.REQUEST_INVITE: {
          // genesis member case
          const requestedMember = GENESIS_REQUEST_INVITE_OPS.includes(
            operation.id
          )
            ? GENESIS_MEMBER
            : getMemberById(state, operation.data.to_uid);

          if (!requestedMember) {
            console.error(
              `RequestInvite operation with missing inviter (id: ${
                operation.creator_uid
              }), invalid.`
            );
            return memo;
          }

          const newActivity: Activity = {
            id: operation.id,
            timestamp: operation.created_at,
            content: {
              // type suggestions since GENESIS_MEMBER is only possible for
              // TRUST operations
              actor: creatorMember as Member,
              description:
                requestedMember === GENESIS_MEMBER
                  ? ["joined Raha!"]
                  : ["just requested a friend to join Raha!"],
              body: {
                type: BodyType.MEDIA,
                media: [videoReferenceForMember(creatorMember as Member)]
              },
              // only show a member in the chain if one will be present, i.e.
              // if this is not one of the first members of Raha.
              ...(requestedMember === GENESIS_MEMBER
                ? {}
                : {
                    nextInChain: {
                      direction: ActivityDirection.NonDirectional,
                      content: {
                        actor: requestedMember
                      }
                    }
                  })
            }
          };

          return [...memo, newActivity];
        }
        case OperationType.TRUST: {
          if (creatorMember === GENESIS_MEMBER) {
            // don't display the genesis trust ops
            return memo;
          }

          const trustedMember = getMemberById(state, operation.data.to_uid);
          if (!trustedMember) {
            console.error(
              `Trust operation with target member (id: ${
                operation.data.to_uid
              }) missing, invalid.`
            );
            return memo;
          }

          const newActivity: Activity = {
            id: operation.id,
            timestamp: operation.created_at,
            content: {
              actor: creatorMember,
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
            }
          };
          return [...memo, newActivity];
        }
        default:
          // Shouldn't happen. Type assertion is because TypeScript also thinks
          // this should never happen.
          // TODO: ensure this error gets sent somewhere
          console.error(
            new Error(
              `Invalid operation: Unrecognized opcode "${
                (operation as Operation).op_code
              }". Operation: ${JSON.stringify(operation)}`
            )
          );
          return memo;
      }
    },
    [] as Activity[]
  );
}

/**
 * Get all activities that specifically are pending invites.
 *
 * DANGER: this filters operations directly and creates a custom list of
 * Activities rather than going through the global activities list, so we should
 * probably ensure that this remains correct once options and activities are no
 * longer 1:1.
 */
export const pendingInviteActivities = (state: RahaState): Activity[] => {
  return convertOperationsToActivities(
    state,
    state.operations.filter(op => {
      if (op.op_code !== OperationType.REQUEST_INVITE) {
        return false;
      }
      return isUnconfirmedRequestInvite(state, op);
    })
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

  if (content.nextInChain) {
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
  return allActivities(state).filter(activity =>
    activityContentContainsMember(activity.content, memberId)
  );
};
