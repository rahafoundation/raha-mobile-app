import {
  Operation,
  OperationType,
  MintType,
  MintOperation
} from "@raha/api-shared/dist/models/Operation";

import { Activity, VideoReference, ActivityDirection } from "./types";
import { getMemberById } from "../members";
import { RahaState } from "../../reducers";
import {
  Member,
  RAHA_BASIC_INCOME_MEMBER,
  GENESIS_MEMBER
} from "../../reducers/members";
import {
  CurrencyValue,
  CurrencyRole,
  CurrencyType
} from "../../../components/shared/Currency";

function videoReferenceForMember(member: Member): VideoReference {
  return {
    videoUrl: member.videoUri,
    thumbnailUrl: `${member.videoUri}.thumb.jpg`
  };
}

/**
 * Interpret a list of operations as a list of activities.
 * TODO: make this more sophisticated, so that it's not just a one-to-one
 * mapping from ops to activities
 *
 * @param operations All operations, expected in chronological order, oldest
 * first.
 * @returns Activities to render in reverse chronological order (new -> old)
 */
export function operationsAsActivities(state: RahaState): Activity[] {
  return state.operations
    .reduce(
      (memo, operation) => {
        const creatorMember = getMemberById(state, operation.creator_uid);
        if (!creatorMember) {
          console.error(
            `Operation with missing creator (id: ${
              operation.creator_uid
            }), invalid.`
          );
          return memo;
        }

        switch (operation.op_code) {
          case OperationType.CREATE_MEMBER: {
            const newActivity: Activity = {
              id: operation.id,
              timestamp: operation.created_at,
              content: {
                actor: creatorMember,
                description: ["just joined Raha!"],
                body: [videoReferenceForMember(creatorMember)]
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
                actor: creatorMember,
                description: ["requested a friend to verify their account."],
                body: [videoReferenceForMember(creatorMember)],
                nextInChain: {
                  direction: ActivityDirection.Forward,
                  actor: requestedMember
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
                actor: creatorMember,
                description: ["verified their friend's account!"],
                body: [videoReferenceForMember(creatorMember)],
                nextInChain: {
                  direction: ActivityDirection.Forward,
                  actor: verifiedMember
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
              role: CurrencyRole.Positive,
              currencyType: CurrencyType.Raha
            };
            const amountGiven: CurrencyValue = {
              value: amountDonated.value.plus(new Big(operation.data.amount)),
              role: CurrencyRole.Positive,
              currencyType: CurrencyType.Raha
            };
            const newActivity: Activity = {
              id: operation.id,
              timestamp: operation.created_at,
              content: {
                actor: creatorMember,
                description: ["gave", amountGiven, "for"],
                body: { text: operation.data.memo },
                nextInChain: {
                  direction: ActivityDirection.Forward,
                  content: {
                    actor: givenToMember,
                    description: ["donated", amountDonated, "to"],
                    // TODO: make this configurable
                    body: { text: "Because every life has value" },
                    nextInChain: {
                      direction: ActivityDirection.Forward,
                      actor: RAHA_BASIC_INCOME_MEMBER
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
              role: CurrencyRole.Positive
            };

            switch (operation.data.type) {
              case MintType.BASIC_INCOME: {
                const newActivity: Activity = {
                  id: operation.id,
                  timestamp: operation.created_at,
                  content: {
                    actor: creatorMember,
                    description: ["minted", amountMinted, "of basic income."],
                    nextInChain: {
                      direction: ActivityDirection.Forward,
                      actor: RAHA_BASIC_INCOME_MEMBER
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
                    actor: creatorMember,
                    description: [
                      "minted",
                      amountMinted,
                      "for inviting a friend to Raha!"
                    ],
                    nextInChain: {
                      direction: ActivityDirection.Bidirectional,
                      actor: invitedMember
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
            const requestedMember =
              operation.data.to_uid === null
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
                actor: creatorMember,
                description:
                  requestedMember === GENESIS_MEMBER
                    ? ["joined Raha!"]
                    : ["just requested a friend to join Raha!"],
                body: [videoReferenceForMember(creatorMember)],
                // only show a member in the chain if one will be present, i.e.
                // if this is not one of the first members of Raha.
                ...(requestedMember === GENESIS_MEMBER
                  ? {}
                  : {
                      nextInChain: {
                        direction: ActivityDirection.Forward,
                        actor: requestedMember
                      }
                    })
              }
            };

            return [...memo, newActivity];
          }
          case OperationType.TRUST: {
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
                description: ["trusts a new friend"],
                body: { iconName: "handshake" },
                nextInChain: {
                  direction: ActivityDirection.Forward,
                  actor: trustedMember
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
    )
    .reverse();
}
