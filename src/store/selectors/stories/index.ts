import { Big } from "big.js";
import differenceInSeconds from "date-fns/differenceInSeconds";

import {
  StoryData,
  Story,
  StoryType,
  ChainDirection,
  VideoReference,
  NewMemberStoryData,
  BodyType,
  MediaBody,
  StoryContent,
  VerifyMemberStoryData,
  GiveRahaStoryData,
  MintBasicIncomeStoryData,
  TrustMemberStoryData,
  EditMemberStoryData,
  RequestVerificationStoryData,
  FlagMemberStoryData,
  CallToAction,
  CallToActionDataType,
  CallToActionPiece,
  TipData
} from "./types";
import {
  Operation,
  OperationType,
  MintType,
  MintBasicIncomeOperation,
  TipGiveOperation,
  TipMetadata
} from "@raha/api-shared/dist/models/Operation";

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
} from "../../../components/shared/elements/Currency";
import { getOperationCreator } from "../operations";
import { List, OrderedMap } from "immutable";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";
import {
  Activity,
  IndependentOperationActivity,
  ActivityType
} from "../activities/types";
import { isGenesisVerificationActivity } from "../activities";

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
 * Convert all activities to stories. Doesn't bundle together related stories.
 *
 * Aside: Filters out Genesis verification activities because they don't make
 * for meaningful stories/break rendering.
 */
export function storiesForActivities(
  state: RahaState,
  activities: List<Activity>
): List<Story> {
  return activities
    .filter(activity => !isGenesisVerificationActivity(activity))
    .map(activity => createStoryFromActivity(state, activity))
    .filter(s => !!s) as List<Story>;
}

/**
 * Latest timestamp of an operation for a basic income mint story. Assumes
 * activities, operations are sorted chronologically, old to new.
 */
function mintStoryDataTimestamps(
  storyData: MintBasicIncomeStoryData
): { first: Date; last: Date } {
  const operations: Operation[] = Array.isArray(storyData.activities)
    ? storyData.activities.map(a => a.operations)
    : [storyData.activities.operations];
  return {
    first: operations[0].created_at,
    last: operations[operations.length - 1].created_at
  };
}

interface MintBundleData {
  stories: List<Story>;
  bundledMint?: MintBasicIncomeStoryData;
}

/**
 * maximum range of time of bundled mint stories, in seconds
 */
const MAX_MINT_BUNDLE_RANGE_SECONDS = 3 * 60 * 60;

/**
 * Combines two mint basic income stories. the first one should have activities
 * that come before the second one; and the activities are expected to be
 * ordered chronologically, old to new.
 */
function combineMintBasicIncomeStories(
  beforeStory: MintBasicIncomeStoryData,
  afterStory: MintBasicIncomeStoryData
): MintBasicIncomeStoryData {
  return {
    type: StoryType.MINT_BASIC_INCOME,
    activities: (Array.isArray(beforeStory.activities)
      ? beforeStory.activities
      : [beforeStory.activities]
    ).concat(afterStory.activities)
  };
}

/**
 * Given a list of stories, bundle the basic income mint ones together. 3 hour
 * windows of mint activities starting at the timestamp the first bundled mint
 * activity get combined.
 *
 * @param inputStories Stories whose mints need to be consolidated. Expected to
 * be in chronological order, old to new.
 */
export function bundleMintBasicIncomeStories(
  state: RahaState,
  inputStories: List<Story>
): List<Story> {
  return inputStories.reduce(
    (memo, story, index): MintBundleData => {
      const lastStory = index === inputStories.size - 1;
      // check up-front if the bundled mint should be flushed before the next
      // story, to ensure ordering is correct. Don't have to worry about next
      // story needing to come first, since stories should be sorted
      // chronologically already.
      const shouldFlushMintBundle: boolean =
        !!memo.bundledMint &&
        (lastStory ||
          differenceInSeconds(
            story.timestamp,
            mintStoryDataTimestamps(memo.bundledMint).first
          ) > MAX_MINT_BUNDLE_RANGE_SECONDS);

      if (
        memo.bundledMint &&
        Array.isArray(memo.bundledMint.activities) &&
        memo.bundledMint.activities.length > 50
      ) {
        console.warn(
          "wtf",
          mintStoryDataTimestamps(memo.bundledMint).first,
          story.timestamp,
          differenceInSeconds(
            mintStoryDataTimestamps(memo.bundledMint).first,
            story.timestamp
          )
        );
      }

      const workingData: MintBundleData = shouldFlushMintBundle
        ? // add bundled mint story
          {
            bundledMint: undefined,
            stories: memo.stories.push(
              createMintBasicIncomeStory(
                state,
                // must be present due to definition of shouldFlushMintBundle
                // but typescript not powerful enough to infer
                memo.bundledMint as any
              )
            )
          }
        : memo;

      // handle non-basic income stories
      if (story.storyData.type !== StoryType.MINT_BASIC_INCOME) {
        return {
          ...workingData,
          stories: workingData.stories.push(story)
        };
      }

      // handle basic income story

      if (!workingData.bundledMint) {
        return lastStory
          ? // don't bundle if the last story
            {
              stories: workingData.stories.push(story)
            }
          : {
              // start bundling this story
              ...workingData,
              bundledMint: story.storyData
            };
      }

      // add this story to the existing bundle.
      return {
        ...workingData,
        bundledMint: combineMintBasicIncomeStories(
          workingData.bundledMint,
          story.storyData
        )
      };
    },
    {
      stories: List(),
      bundledMint: undefined
    } as MintBundleData
  ).stories;
}

/**
 * generate id for story: type, with all operation ids concatenated.
 *
 * TODO: this can get long, maybe a short/space-efficient id would be better.
 * But for now this works.
 */
function idForStoryActivities(
  type: StoryType,
  activities: Activity[] | Activity
): string {
  // not sure why typescript can't figure out these types
  const activitiesArr: Activity[] = Array.isArray(activities)
    ? activities
    : [activities];

  return activitiesArr.reduce((memo, a) => {
    const activityAsString = `${a.type}-${
      Array.isArray(a.operations)
        ? (a.operations as Operation[]).reduce(
            (memo2, o) => `${memo2}_${o.id}`,
            ""
          )
        : a.operations.id
    }`;
    return `${memo} ${activityAsString}`;
  }, `[${type}]`);
}

/**
 * Helper to build story objects for each scenario of the NEW_MEMBER story.
 */
function createNewMemberStoryObject(data: {
  creatorMember: Member;
  timestamp: Date;
  bodyMedia: MediaBody["media"];
  facilitatorData?: {
    facilitatingMember: Member;
    actionDescription: StoryContent["description"];
  };
  storyData: NewMemberStoryData;
}): Story {
  const {
    creatorMember,
    timestamp,
    bodyMedia,
    storyData,
    facilitatorData
  } = data;

  return {
    storyData,
    id: idForStoryActivities(StoryType.NEW_MEMBER, storyData.activities),
    timestamp: timestamp,
    content: {
      actors: OrderedMap({ [creatorMember.get("memberId")]: creatorMember }),
      description: ["just joined Raha!"],
      body: {
        bodyContent: {
          type: BodyType.MEDIA,
          media: bodyMedia
        },
        ...(facilitatorData
          ? {
              nextInChain: {
                direction: ChainDirection.Bidirectional,
                nextStoryContent: {
                  actors: OrderedMap({
                    [facilitatorData.facilitatingMember.get(
                      "memberId"
                    )]: facilitatorData.facilitatingMember
                  }),
                  description: facilitatorData.actionDescription
                }
              }
            }
          : {})
      }
    }
  };
}

/**
 * Creates a story object in the scenario for NEW_MEMBER stories where a member
 * has joined, had their account verified by somebody, and where the inviter
 * also minted the referral bonus.
 */
function createNewMemberStoryMinted(
  state: RahaState,
  storyData: NewMemberStoryData
): Story {
  const { operations } = storyData.activities;
  if (operations.length !== 3) {
    throw new Error(
      "Unexpected: this function should only be called with a NEW_MEMBER " +
        "activity that includes a minted referral bonus, but these " +
        `operations were present: ${JSON.stringify(operations, null, 2)}`
    );
  }

  const [
    createMemberOperation,
    verifyMemberOperation,
    mintBonusOperation
  ] = operations;

  // type suggestion since GENESIS_MEMBER is only possible for
  // VERIFY operations
  const creatorMember = getOperationCreator(
    state,
    createMemberOperation
  ) as Member;
  const inviterId = createMemberOperation.data.request_invite_from_member_id;
  if (inviterId !== mintBonusOperation.creator_uid) {
    throw new Error(
      `Inviter doesn't match member who claimed referral bonus. CREATE_MEMBER operation: ${JSON.stringify(
        createMemberOperation,
        null,
        2
      )}; MINT operation: ${JSON.stringify(mintBonusOperation, null, 2)}`
    );
  }
  if (inviterId !== verifyMemberOperation.creator_uid) {
    // TODO: properly log and alert
    console.warn(
      "inviting member is not the same as that of the verification video,",
      "which is a little strange. CREATE_MEMBER operation:",
      JSON.stringify(createMemberOperation, null, 2),
      "| VERIFY operation:",
      JSON.stringify(verifyMemberOperation, null, 2)
    );
  }

  const inviter = getMemberById(state, inviterId, { throwIfMissing: true });
  const amountMinted: CurrencyValue = {
    value: new Big(mintBonusOperation.data.amount),
    currencyType: CurrencyType.Raha,
    role: CurrencyRole.Transaction
  };

  return createNewMemberStoryObject({
    creatorMember,
    timestamp: mintBonusOperation.created_at,
    bodyMedia: [
      videoReferenceForMember(creatorMember)
      // TODO: show these once we can de-duplicate identical videos, have a
      // proper UI for multiple pieces of media
      // videoReferenceForUri(verifyMemberOperation.data.video_url)
    ],
    storyData,
    facilitatorData: {
      facilitatingMember: inviter,
      actionDescription: [
        "invited them to Raha, and minted a referral bonus of",
        amountMinted,
        "after verifying their identity!"
      ]
    }
  });
}

/**
 * Creates a story object in the scenario for NEW_MEMBER stories where a member
 * has joined and had their account verified by somebody.
 */
function createNewMemberStoryVerified(
  state: RahaState,
  storyData: NewMemberStoryData
): Story {
  const { operations } = storyData.activities;
  if (operations.length !== 2) {
    throw new Error(
      "Unexpected: this function should only be called with NEW_MEMBER " +
        "activities where a new member was verified but not had a referral " +
        `bonus minted, but these operations were present ${JSON.stringify(
          operations,
          null,
          2
        )}`
    );
  }
  const [createMemberOperation, verifyMemberOperation] = operations;

  // type suggestion since GENESIS_MEMBER is only possible for
  // VERIFY operations
  const creatorMember = getOperationCreator(
    state,
    createMemberOperation
  ) as Member;
  const inviterId = createMemberOperation.data.request_invite_from_member_id;

  const verifierId = verifyMemberOperation.creator_uid;
  const verifier = getMemberById(state, verifierId, { throwIfMissing: true });

  return createNewMemberStoryObject({
    storyData,
    creatorMember,
    timestamp: verifyMemberOperation.created_at,
    bodyMedia: [
      videoReferenceForMember(creatorMember)
      // TODO: show these once we can de-duplicate identical videos, have a
      // proper UI for multiple pieces of media
      // videoReferenceForUri(verifyMemberOperation.data.video_url)
    ],
    facilitatorData: {
      facilitatingMember: verifier,
      actionDescription: [
        inviterId === verifierId
          ? "invited them to Raha, and verified their identity."
          : "verified their identity on Raha."
      ]
    }
  });
}

/**
 * Creates a story object in the scenario for NEW_MEMBER stories where a member
 * has joined but remains unverified.
 */
function createNewMemberStoryUnverified(
  state: RahaState,
  storyData: NewMemberStoryData
): Story {
  const { operations } = storyData.activities;
  if (operations.length !== 1) {
    throw new Error(
      "Unexpected: this function should only be called with NEW_MEMBER " +
        "activities where a new member is still unverified, but these " +
        `operations were present: ${JSON.stringify(operations, null, 2)}`
    );
  }
  const [createMemberOperation] = operations;

  // type suggestion since GENESIS_MEMBER is only possible for
  // VERIFY operations
  const creatorMember = getOperationCreator(
    state,
    createMemberOperation
  ) as Member;
  const inviterId = createMemberOperation.data.request_invite_from_member_id;
  const inviter = inviterId
    ? getMemberById(state, inviterId, { throwIfMissing: true })
    : undefined;

  return createNewMemberStoryObject({
    creatorMember,
    timestamp: createMemberOperation.created_at,
    bodyMedia: [videoReferenceForMember(creatorMember)],
    storyData,
    ...(inviter
      ? {
          facilitatorData: {
            facilitatingMember: inviter,
            actionDescription: ["invited them to Raha."]
          }
        }
      : {})
  });
}

function createNewMemberStory(
  state: RahaState,
  storyData: NewMemberStoryData
): Story {
  // type suggestions required/can't use simple array destructuring due to this
  // typescript bug:
  // https://github.com/Microsoft/TypeScript/issues/27543
  switch (storyData.activities.operations.length) {
    case 1:
      return createNewMemberStoryUnverified(state, storyData);
    case 2:
      return createNewMemberStoryVerified(state, storyData);
    case 3:
      return createNewMemberStoryMinted(state, storyData);
    default:
      throw new Error(
        `unexpected operations in NEW_MEMBER activity; StoryData: ${JSON.stringify(
          storyData,
          null,
          2
        )}`
      );
  }
}

function createEditMemberStory(
  state: RahaState,
  storyData: EditMemberStoryData
): Story {
  const operation = storyData.activities.operations;
  const creatorMember = getOperationCreator(state, operation) as Member;
  const description = operation.data.full_name
    ? "edited their name."
    : "edited their profile.";

  return {
    storyData,
    id: operation.id,
    timestamp: operation.created_at,
    content: {
      // type suggestions since GENESIS_MEMBER is only possible for
      // VERIFY operations
      actors: OrderedMap({ [creatorMember.get("memberId")]: creatorMember }),
      description: [description]
    }
  };
}

function createFlagMemberStory(
  state: RahaState,
  storyData: FlagMemberStoryData
): Story {
  const { operations } = storyData.activities;
  if (operations.length > 2) {
    throw new Error(
      `Unexpected number of operations for FLAG_MEMBER story: ${
        operations.length
      }.`
    );
  }

  const [flagOperation, resolveFlagOperation] = storyData.activities.operations;

  // Type suggestion since GENESIS_MEMBER is only possible for
  // VERIFY operations
  const flaggerMember = getOperationCreator(state, flagOperation) as Member;
  const flaggedMember = getMemberById(state, flagOperation.data.to_uid, {
    throwIfMissing: true
  });
  const resolverMember = resolveFlagOperation
    ? (getMemberById(state, resolveFlagOperation.creator_uid, {
        throwIfMissing: true
      }) as Member)
    : undefined;

  const flagStoryContent: StoryContent = {
    actors: OrderedMap({ [flaggerMember.get("memberId")]: flaggerMember }),
    description: ["flagged an account."],
    body: {
      bodyContent: {
        type: BodyType.TEXT,
        text: flagOperation.data.reason
      },

      nextInChain: {
        direction: ChainDirection.Forward,
        nextStoryContent: {
          actors: OrderedMap({
            [flaggedMember.get("memberId")]: flaggedMember
          })
        }
      }
    }
  };

  return {
    storyData,
    id: flagOperation.id,
    timestamp: resolverMember
      ? resolveFlagOperation.created_at
      : flagOperation.created_at,
    content: resolverMember
      ? {
          actors: OrderedMap({
            [resolverMember.get("memberId")]: resolverMember
          }),
          description: ["resolved a flag."],
          body: {
            bodyContent: {
              type: BodyType.TEXT,
              text: resolveFlagOperation.data.reason
            },

            nextInChain: {
              direction: ChainDirection.Forward,
              nextStoryContent: flagStoryContent
            }
          }
        }
      : flagStoryContent
  };
}

function createRequestVerificationStory(
  state: RahaState,
  storyData: RequestVerificationStoryData
): Story {
  const operation = storyData.activities.operations;

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

  return {
    storyData,
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
          direction: ChainDirection.NonDirectional,
          nextStoryContent: {
            actors: OrderedMap({
              [requestedMember.get("memberId")]: requestedMember
            })
          }
        }
      }
    }
  };
}

function createVerifyMemberStory(
  state: RahaState,
  storyData: VerifyMemberStoryData
): Story | undefined {
  const operation = storyData.activities.operations;
  const creatorMember = getOperationCreator(state, operation);
  const verifiedMember = getMemberById(state, operation.data.to_uid, {
    throwIfMissing: true
  });

  if (creatorMember === GENESIS_MEMBER) {
    // don't display the genesis verify ops
    return undefined;
  }

  return {
    storyData,
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
          direction: ChainDirection.Forward,
          nextStoryContent: {
            actors: OrderedMap({
              [verifiedMember.get("memberId")]: verifiedMember
            })
          }
        }
      }
    }
  };
}

function createTipCallToAction(
  member: Member,
  tips?: TipGiveOperation[]
): CallToAction | undefined {
  if (!tips) {
    return undefined;
  }

  const tipData: TipData = tips.reduce(
    (data, tip) => {
      if (tip.data.to_uid === member.get("memberId")) {
        return {
          tipTotal: data.tipTotal.plus(tip.data.donation_amount),
          fromMemberIds: data.fromMemberIds.concat(tip.creator_uid),
          toMemberId: data.toMemberId
        };
      } else {
        // Skip -- this tip doesn't apply to the given member.
        return data;
      }
    },
    {
      tipTotal: new Big(0),
      toMemberId: member.get("memberId"),
      fromMemberIds: [] as MemberId[]
    }
  );

  const piece: CallToActionPiece = {
    type: CallToActionDataType.TIP,
    data: tipData
  };
  return [piece];
}

function createGiveRahaStory(
  state: RahaState,
  storyData: GiveRahaStoryData
): Story {
  const operation = storyData.activities.operations;
  const tipOperations = storyData.activities.childOperations;

  // type suggestion since GENESIS_MEMBER is only possible for
  // VERIFY operations
  const creatorMember = getOperationCreator(state, operation) as Member;
  const givenToMember = getMemberById(state, operation.data.to_uid, {
    throwIfMissing: true
  });

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

  return {
    storyData,
    id: operation.id,
    timestamp: operation.created_at,
    content: {
      actors: OrderedMap({ [creatorMember.get("memberId")]: creatorMember }),
      actorCallToAction: createTipCallToAction(creatorMember, tipOperations),
      description: ["gave", amountGiven, "for"],
      body: {
        bodyContent: {
          type: BodyType.TEXT,
          text: operation.data.memo ? operation.data.memo : ""
        },
        nextInChain: {
          direction: ChainDirection.Forward,
          nextStoryContent: {
            actors: OrderedMap({
              [givenToMember.get("memberId")]: givenToMember
            }),
            actorCallToAction: createTipCallToAction(
              givenToMember,
              tipOperations
            ),
            description: ["donated", amountDonated, "to the Raha Basic Income"]
          }
        }
      }
    }
  };
}

// function addOperationToBundledBasicIncomeMintStory(
//   basicIncomeCache: Required<StoryBundlingCache>["mintBasicIncome"],
//   existingStory: Story,
//   activity: IndependentOperationActivity,
//   operation: MintOperation,
//   creatorMember: Member
// ): {
//   bundledStory: Story;
//   newBasicIncomeCache: typeof basicIncomeCache;
// } {
//   if (existingStory.content.actors === RAHA_BASIC_INCOME_MEMBER) {
//     throw new Error(
//       "Unexpected: RAHA_BASIC_INCOME_MEMBER was minting a basic income?"
//     );
//   }
//   const { runningTotal } = basicIncomeCache;
//   const newTotal = runningTotal.add(operation.data.amount);
//   const newBasicIncomeCache: typeof basicIncomeCache = {
//     ...basicIncomeCache,
//     runningTotal: newTotal
//   };

//   // TODO: consider if there's a clean way to display this information
//   // const totalMinted: CurrencyValue = {
//   //   value: newTotal,
//   //   currencyType: CurrencyType.Raha,
//   //   role: CurrencyRole.Transaction
//   // };

//   const individualMintStory = createIndividualBasicIncomeMintStory(
//     creatorMember,
//     operation
//   );
//   const bundledStory: Story = {
//     ...existingStory,
//     // use the newest operation's timestamp
//     timestamp:
//       existingStory.timestamp > operation.created_at
//         ? existingStory.timestamp
//         : operation.created_at,
//     content: {
//       ...existingStory.content,
//       description: ["minted their basic income."],
//       // TODO: show the most relevant members to the logged in member first, not
//       // just in the order they're found
//       actors: existingStory.content.actors.set(
//         creatorMember.get("memberId"),
//         creatorMember
//       )
//     },
//     sourceActivities: existingStory.sourceActivities.concat([activity])
//   };

//   return {
//     bundledStory,
//     newBasicIncomeCache
//   };
// }

function membersArrayToMap(members: Member[]): OrderedMap<MemberId, Member> {
  return OrderedMap(
    members.reduce(
      (memo, member) => ({ ...memo, [member.get("memberId")]: member }),
      {}
    )
  );
}

function createMintBasicIncomeStory(
  state: RahaState,
  storyData: MintBasicIncomeStoryData
): Story {
  const operations: MintBasicIncomeOperation[] = Array.isArray(
    storyData.activities
  )
    ? storyData.activities.map(activity => activity.operations)
    : [storyData.activities.operations];

  const actorsArray: Member[] = operations.map(operation =>
    getMemberById(state, operation.creator_uid, { throwIfMissing: true })
  );

  const newestTimestamp: Date = mintStoryDataTimestamps(storyData).last;

  const totalMinted: Big = operations.reduce(
    (memo, operation) => memo.add(new Big(operation.data.amount)),
    new Big(0)
  );
  const amountMinted: CurrencyValue = {
    value: totalMinted,
    currencyType: CurrencyType.Raha,
    role: CurrencyRole.Transaction
  };

  return {
    storyData,
    id: idForStoryActivities(storyData.type, storyData.activities),
    timestamp: newestTimestamp,
    content: {
      actors: membersArrayToMap(actorsArray),
      // for now, squelching total amount of Raha for different people's mints
      // based on brief product discussion
      description:
        actorsArray.length > 1
          ? ["minted their basic income."]
          : ["minted", amountMinted, "of basic income."],
      body: {
        bodyContent: {
          type: BodyType.MINT_BASIC_INCOME
        },
        nextInChain: {
          direction: ChainDirection.NonDirectional,
          nextStoryContent: {
            actors: RAHA_BASIC_INCOME_MEMBER
          }
        }
      }
    }
  };
}

function createTrustMemberStory(
  state: RahaState,
  storyData: TrustMemberStoryData
): Story {
  const operation = storyData.activities.operations;

  // type suggestion since GENESIS_MEMBER is only possible for
  // VERIFY operations
  const creatorMember = getOperationCreator(state, operation) as Member;
  const trustedMember = getMemberById(state, operation.data.to_uid, {
    throwIfMissing: true
  });

  return {
    storyData,
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
          direction: ChainDirection.Forward,
          nextStoryContent: {
            actors: OrderedMap({
              [trustedMember.get("memberId")]: trustedMember
            })
          }
        }
      }
    }
  };
}

/**
 * Get IndependentOperationActivity for a StoryType.
 */
function storyTypeForIndependentOperationActivity(
  activity: IndependentOperationActivity
): StoryType {
  const operation = activity.operations;
  switch (operation.op_code) {
    case OperationType.EDIT_MEMBER:
      return StoryType.EDIT_MEMBER;
    case OperationType.GIVE:
      return StoryType.GIVE_RAHA;
    case OperationType.MINT:
      if (operation.data.type !== MintType.BASIC_INCOME) {
        throw new Error(
          "Unexpected: Mint operation in INDIVIDUAL_OPERATION " +
            "activity was not a MINT_BASIC_INCOME operation."
        );
      }
      return StoryType.MINT_BASIC_INCOME;
    case OperationType.REQUEST_VERIFICATION:
      return StoryType.REQUEST_VERIFICATION;
    case OperationType.TRUST:
      return StoryType.TRUST_MEMBER;
    case OperationType.VERIFY:
      return StoryType.VERIFY_MEMBER;
    default:
      throw new Error(
        "Unexpected: INDEPENDENT_OPERATION contained an " +
          "unsupported operation type. Operation: " +
          JSON.stringify(operation, null, 2)
      );
  }
}

/**
 * Convert an activity to a Story.
 *
 * @returns the resulting story, or undefined if a corresponding story doesn't
 * exist.
 */
export function createStoryFromActivity(
  state: RahaState,
  activity: Activity
): Story | undefined {
  switch (activity.type) {
    case ActivityType.NEW_MEMBER:
      return createStory(state, {
        type: StoryType.NEW_MEMBER,
        activities: activity
      });
    case ActivityType.FLAG_MEMBER:
      return createStory(state, {
        type: StoryType.FLAG_MEMBER,
        activities: activity
      });
    case ActivityType.GIVE:
      return createStory(state, {
        type: StoryType.GIVE_RAHA,
        activities: activity
      });
    case ActivityType.INDEPENDENT_OPERATION:
      // need type suggestion since inference not powerful enough
      return createStory(state, {
        type: storyTypeForIndependentOperationActivity(activity),
        activities: activity
      } as StoryData);
  }
}
/**
 * Create a story object for the given story type and data.
 */
export function createStory(
  state: RahaState,
  storyData: StoryData
): Story | undefined {
  try {
    switch (storyData.type) {
      case StoryType.VERIFY_MEMBER:
        return createVerifyMemberStory(state, storyData);
      case StoryType.EDIT_MEMBER:
        return createEditMemberStory(state, storyData);
      case StoryType.FLAG_MEMBER:
        return createFlagMemberStory(state, storyData);
      case StoryType.TRUST_MEMBER:
        return createTrustMemberStory(state, storyData);
      case StoryType.NEW_MEMBER:
        return createNewMemberStory(state, storyData);
      case StoryType.GIVE_RAHA:
        return createGiveRahaStory(state, storyData);
      case StoryType.MINT_BASIC_INCOME:
        return createMintBasicIncomeStory(state, storyData);
      case StoryType.REQUEST_VERIFICATION:
        return createRequestVerificationStory(state, storyData);
      default: {
        // Shouldn't happen. Type assertion is because TypeScript also thinks
        // this should never happen.
        // TODO: ensure this error gets sent somewhere, doesn't crash app
        const { type, activities } = storyData as StoryData;

        throw new Error(
          `Invalid story: Unrecognized story type "${type}". Activities: ${JSON.stringify(
            activities,
            null,
            2
          )}`
        );
      }
    }
  } catch (err) {
    // TODO: log this error properly
    console.error(
      "Story creation failed for reason:",
      err.message,
      "| Story:",
      JSON.stringify(storyData, null, 2)
    );
    return undefined;
  }
}
