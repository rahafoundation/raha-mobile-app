/**
 * TODO: Would be nice if this at some point were actually an API model.
 */
import { Reducer } from "redux";
import { Big } from "big.js";

import {
  Operation,
  OperationType,
  MintType
} from "@raha/api-shared/dist/models/Operation";
import {
  MemberId,
  MemberUsername
} from "@raha/api-shared/dist/models/identifiers";

import { Set, Map } from "immutable";
import { OperationsActionType } from "../actions/operations";
import { MembersAction } from "../actions/members";
import { OperationInvalidError } from "../../errors/OperationInvalidError";
import { config } from "../../data/config";

const GENESIS_REQUEST_INVITE_OPS = [
  "InuYAjMISl6operovXIR",
  "SKI5CxMXWd4qjJm1zm1y",
  "SUswrxogVQ6S0rH8O2h7",
  "Y8FiyjOLs9O8AZNGzhwQ"
];
const GENESIS_TRUST_OPS = [
  "va9A8nQ4C4ZiAsJG2nLt",
  "CmVDdktn3c3Uo5pP4rV6",
  "uAFLhBjYtrpTXOZkJ6BD",
  "y5EKzzihWm8RlDCcfv6d"
];
export const GENESIS_MEMBER = Symbol("GENESIS");

function getDefaultMemberFields(): OptionalMemberFields {
  return {
    balance: new Big(0),
    totalDonated: new Big(0),
    totalMinted: new Big(0),
    trustedBy: Set<MemberId>(),
    invited: Set<MemberId>(),
    invitedBy: undefined,
    trusts: Set<MemberId>(),
    verified: Set<MemberId>(),
    requestedVerificationFrom: Set<MemberId>(),
    requestedForVerificationBy: Set<MemberId>(),
    verifiedBy: Set<MemberId>()
  };
}

interface OptionalMemberFields {
  balance: Big;
  totalDonated: Big;
  totalMinted: Big;
  trustedBy: Set<MemberId>;
  invited: Set<MemberId>;
  invitedBy: MemberId | typeof GENESIS_MEMBER | undefined;
  trusts: Set<MemberId>;
  verified: Set<MemberId>;
  requestedVerificationFrom: Set<MemberId>;
  requestedForVerificationBy: Set<MemberId>;
  verifiedBy: Set<MemberId>;
}

interface RequiredMemberFields {
  memberId: MemberId;
  username: string;
  fullName: string;
  createdAt: Date;
  inviteConfirmed: boolean;
  lastMintedBasicIncomeAt: Date;
  lastOpCreatedAt: Date;
}

type MemberFields = RequiredMemberFields & OptionalMemberFields;

export class Member {
  protected readonly fields: MemberFields;
  public get<Key extends keyof MemberFields>(field: Key): MemberFields[Key] {
    return this.fields[field];
  }

  constructor(values: RequiredMemberFields & Partial<OptionalMemberFields>) {
    // if a field is missing from values, it gets filled in from defaults
    this.fields = { ...getDefaultMemberFields(), ...values };
  }

  protected withFields(newFields: Partial<MemberFields>) {
    return new Member({ ...this.fields, ...newFields });
  }

  public updateLastOpCreatedAt(lastOpCreatedAt: Date) {
    return this.withFields({ lastOpCreatedAt });
  }

  /* =======================
   * ACCOUNT BALANCE METHODS
   * =======================
   */
  public mintRaha(amount: Big, mintDate?: Date) {
    return this.withFields({
      balance: this.fields.balance.plus(amount),
      lastMintedBasicIncomeAt: mintDate
        ? mintDate
        : this.fields.lastMintedBasicIncomeAt,
      totalMinted: this.fields.totalMinted.plus(amount)
    });
  }

  public giveRaha(amount: Big) {
    return this.withFields({
      balance: this.fields.balance.minus(amount)
    });
  }

  public receiveRaha(amount: Big, donation_amount: Big) {
    return this.withFields({
      balance: this.fields.balance.plus(amount),
      totalDonated: this.fields.totalDonated.plus(donation_amount)
    });
  }

  /* =====================
   * RELATIONSHIP METHODS
   * =====================
   * TODO: consider moving these relationships into their own reducers, rather
   * than having them directly on members, to avoid having to keep member
   * states all in sync.
   */
  public inviteMember(memberId: MemberId) {
    return this.withFields({
      invited: this.fields.invited.add(memberId),
      trustedBy: this.fields.trustedBy.add(memberId)
    });
  }

  public trustMember(memberId: MemberId) {
    return this.withFields({
      trusts: this.fields.trusts.add(memberId)
    });
  }

  // TODO inviteConfirmed should eventually be modified only by the verify
  // operation, not the trust operation
  public beTrustedByMember(memberId: MemberId) {
    return this.withFields({
      inviteConfirmed:
        this.fields.inviteConfirmed || this.fields.invitedBy === memberId,
      trustedBy: this.fields.trustedBy.add(memberId)
    });
  }

  public requestVerificationFromMember(memberId: MemberId) {
    return this.withFields({
      requestedVerificationFrom: this.fields.requestedVerificationFrom.add(
        memberId
      )
    });
  }

  public beRequestedForVerificationBy(memberId: MemberId) {
    return this.withFields({
      requestedForVerificationBy: this.fields.requestedForVerificationBy.add(
        memberId
      )
    });
  }

  public verifyMember(memberId: MemberId) {
    return this.withFields({
      inviteConfirmed:
        this.fields.inviteConfirmed || this.fields.invitedBy === memberId,
      verified: this.fields.verified.add(memberId)
    });
  }

  public beVerifiedByMember(memberId: MemberId) {
    return this.withFields({
      verifiedBy: this.fields.verifiedBy.add(memberId)
    });
  }

  /* =====================
   * GET HELPERS
   * =====================
   */
  public get videoUri(): string {
    return `https://storage.googleapis.com/${config.publicVideoBucket}/${
      this.fields.memberId
    }/invite.mp4`;
  }
}

export interface MembersState {
  byMemberId: Map<MemberId, Member>;
  byMemberUsername: Map<MemberUsername, Member>;
}

/**
 * @returns true if relevant/false otherwise
 * @throws OperationInvalidError if invalid
 */
function operationIsRelevantAndValid(operation: Operation): boolean {
  if (!operation.creator_uid) {
    if (GENESIS_TRUST_OPS.includes(operation.id)) {
      return false; // no need for the genesis ops to be reflected in app state.
    }
    throw new OperationInvalidError(
      "All operations must have a creator id",
      operation
    );
  }
  if (operation.op_code === OperationType.CREATE_MEMBER) {
    return true;
  }
  if (operation.op_code === OperationType.REQUEST_VERIFICATION) {
    return !!operation.data.to_uid;
  }
  if (operation.op_code === OperationType.VERIFY) {
    return !!operation.data.to_uid;
  }
  if (operation.op_code === OperationType.REQUEST_INVITE) {
    // Force to boolean
    // TODO: consider how else this could be messed up
    if (!!operation.data.to_uid) {
      return true;
    }
    return GENESIS_REQUEST_INVITE_OPS.includes(operation.id);
  }

  if (operation.op_code === OperationType.TRUST) {
    return !!operation.data.to_uid;
  }

  if (operation.op_code === OperationType.MINT) {
    try {
      const validBig = new Big(operation.data.amount);
      return true;
    } catch (error) {
      return false;
    }
  }

  if (operation.op_code === OperationType.GIVE) {
    try {
      const validBig =
        new Big(operation.data.amount) &&
        new Big(operation.data.donation_amount);
      return true;
    } catch (error) {
      return false;
    }
  }
  return false;
}

function memberIdPresentInState(prevState: MembersState, memberId: MemberId) {
  return prevState.byMemberId.has(memberId);
}

function assertMemberIdPresentInState(
  prevState: MembersState,
  memberId: MemberId,
  operation: Operation
) {
  if (!memberIdPresentInState(prevState, memberId)) {
    throw new OperationInvalidError(
      `Invalid operation: user ${memberId} not present`,
      operation
    );
  }
}

function assertMemberIdNotPresentInState(
  prevState: MembersState,
  memberId: MemberId,
  operation: Operation
) {
  if (memberIdPresentInState(prevState, memberId)) {
    throw new OperationInvalidError(
      `Invalid operation: user ${memberId} already present`,
      operation
    );
  }
}

function addMemberToState(
  prevState: MembersState,
  member: Member
): MembersState {
  return {
    byMemberUsername: prevState.byMemberUsername.set(
      member.get("username"),
      member
    ),
    byMemberId: prevState.byMemberId.set(member.get("memberId"), member)
  };
}
function addMembersToState(
  prevState: MembersState,
  members: Member[]
): MembersState {
  return members.reduce(
    (memo, member) => addMemberToState(memo, member),
    prevState
  );
}

/**
 * TODO (code cleanup): Avoid having to assert on id present for almost every operation type.
 */
function applyOperation(
  state: MembersState,
  operation: Operation
): MembersState {
  const { creator_uid, created_at } = operation;

  try {
    if (!operationIsRelevantAndValid(operation)) {
      return state;
    }
    const createdAt = new Date(created_at);
    const creator = state.byMemberId.get(
      creator_uid
    );
    if (creator) { 
      // For some operations types (CREATE_MEMBER, REQUEST_INVITE) the creator will not yet exist.
      state = addMemberToState(state, creator.updateLastOpCreatedAt(createdAt));
    }
    switch (operation.op_code) {
      case OperationType.CREATE_MEMBER: {
        const {
          full_name,
          username,
          request_invite_from_member_id
        } = operation.data;

        if (request_invite_from_member_id) {
          assertMemberIdPresentInState(
            state,
            request_invite_from_member_id,
            operation
          );
        }

        const memberData = {
          memberId: creator_uid,
          username: username,
          fullName: full_name,
          createdAt: createdAt,
          inviteConfirmed: false,
          lastMintedBasicIncomeAt: createdAt,
          lastOpCreatedAt: createdAt,
          ...(request_invite_from_member_id
            ? { invitedBy: request_invite_from_member_id }
            : {})
        };

        assertMemberIdNotPresentInState(state, creator_uid, operation);

        const newMember = new Member(memberData);

        return addMemberToState(state, newMember);
      }
      case OperationType.REQUEST_VERIFICATION: {
        const { to_uid } = operation.data;

        assertMemberIdPresentInState(state, creator_uid, operation);
        assertMemberIdPresentInState(state, to_uid, operation);

        const requester = (state.byMemberId.get(
          creator_uid
        ) as Member).requestVerificationFromMember(to_uid);
        const requestee = (state.byMemberId.get(
          to_uid
        ) as Member).beRequestedForVerificationBy(creator_uid);

        return addMembersToState(state, [requester, requestee]);
      }
      case OperationType.VERIFY: {
        const { to_uid } = operation.data;

        assertMemberIdPresentInState(state, creator_uid, operation);
        assertMemberIdPresentInState(state, to_uid, operation);

        const verifier = (state.byMemberId.get(
          creator_uid
        ) as Member).verifyMember(to_uid);
        const verified = (state.byMemberId.get(
          to_uid
        ) as Member).beVerifiedByMember(creator_uid);

        return addMembersToState(state, [verifier, verified]);
      }
      case OperationType.REQUEST_INVITE: {
        const { full_name, to_uid, username } = operation.data;

        const memberData = {
          memberId: creator_uid,
          username: username,
          fullName: full_name,
          createdAt: createdAt,
          inviteConfirmed: false,
          lastMintedBasicIncomeAt: createdAt,
          lastOpCreatedAt: createdAt
        };

        // the initial users weren't invited by anyone; so no need to hook up any associations.
        if (GENESIS_REQUEST_INVITE_OPS.includes(operation.id)) {
          return addMemberToState(
            state,
            new Member({ ...memberData, invitedBy: GENESIS_MEMBER })
          );
        }

        assertMemberIdPresentInState(state, to_uid, operation);
        assertMemberIdNotPresentInState(state, creator_uid, operation);

        const inviter = (state.byMemberId.get(
          to_uid
        ) as Member).inviteMember(creator_uid);
        const inviteRequester = new Member({
          ...memberData,
          invitedBy: to_uid
        }).trustMember(to_uid);
        return addMembersToState(state, [inviter, inviteRequester]);
      }
      case OperationType.TRUST: {
        const { to_uid } = operation.data;

        assertMemberIdPresentInState(state, creator_uid, operation);
        assertMemberIdPresentInState(state, to_uid, operation);
        const truster = (state.byMemberId.get(
          creator_uid
        ) as Member).trustMember(to_uid);
        const trusted = (state.byMemberId.get(
          to_uid
        ) as Member).beTrustedByMember(creator_uid);
        return addMembersToState(state, [truster, trusted]);
      }
      case OperationType.MINT: {
        const { amount, type } = operation.data;

        assertMemberIdPresentInState(state, creator_uid, operation);
        const minter = (state.byMemberId.get(
          creator_uid
        ) as Member).mintRaha(
          new Big(amount),
          type === MintType.BASIC_INCOME
            ? new Date(operation.created_at)
            : undefined
        );
        return addMembersToState(state, [minter]);
      }
      case OperationType.GIVE: {
        const { to_uid, amount, donation_to, donation_amount } = operation.data;

        assertMemberIdPresentInState(state, creator_uid, operation);
        assertMemberIdPresentInState(state, to_uid, operation);
        // TODO: Update donationRecipient state.
        // Currently we don't do this as RAHA isn't a normal member created via a REQUEST_INVITE operation.
        // Thus RAHA doesn't get added to the members state in the current paradigm.

        const giver = (state.byMemberId.get(
          creator_uid
        ) as Member).giveRaha(new Big(amount).plus(donation_amount));
        const recipient = (state.byMemberId.get(
          to_uid
        ) as Member).receiveRaha(new Big(amount), new Big(donation_amount));

        return addMembersToState(state, [giver, recipient]);
      }
      default:
        return state;
    }
  } catch (err) {
    if (err instanceof OperationInvalidError) {
      // TODO: [#log] do real logging
      // tslint:disable-next-line:no-console
      console.warn("Operation invalid", operation);
      return state;
    }
    throw err;
  }
}

const initialState: MembersState = {
  byMemberId: Map(),
  byMemberUsername: Map()
};
export const reducer: Reducer<MembersState> = (
  state = initialState,
  untypedAction
) => {
  const action = untypedAction as MembersAction;
  switch (action.type) {
    case OperationsActionType.ADD_OPERATIONS: {
      return action.operations.reduce(
        (curState, operation) => applyOperation(curState, operation),
        state
      );
    }
    case OperationsActionType.SET_OPERATIONS: {
      return action.operations.reduce(
        (curState, op) => applyOperation(curState, op),
        initialState
      );
    }
    default:
      return state;
  }
};
