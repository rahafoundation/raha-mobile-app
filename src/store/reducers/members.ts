/**
 * TODO: Would be nice if this at some point were actually an API model.
 */
import { Reducer } from "redux";
import { Big } from "big.js";

import {
  Operation,
  OperationType,
  MintType
} from "@raha/api/dist/shared/models/Operation";
import {
  MemberId,
  MemberUsername
} from "@raha/api/dist/shared/models/identifiers";

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

/**
 * Members that we're in the process of building up from operations below.
 * TODO follow Redux recommendation and use plain objects or immutable.js Record instead of class,
 * see https://redux.js.org/faq/organizing-state#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state
 */
export class Member {
  public readonly memberId: MemberId;
  public readonly username: MemberUsername;
  public readonly fullName: string;
  public readonly createdAt: Date;
  public readonly invitedBy: MemberId | typeof GENESIS_MEMBER;
  public readonly inviteConfirmed: boolean;
  public readonly balance: Big;
  public readonly totalDonated: Big;
  public readonly totalMinted: Big;
  public readonly lastMinted: Date;

  public readonly trustedBy: Set<MemberId>;
  public readonly invited: Set<MemberId>;
  public readonly trusts: Set<MemberId>;

  constructor(
    memberId: MemberId,
    username: MemberUsername,
    fullName: string,
    createdAt: Date,
    invitedBy: MemberId | typeof GENESIS_MEMBER,
    inviteConfirmed: boolean,
    balance: Big,
    totalDonated: Big,
    totalMinted: Big,
    lastMinted: Date,
    trusts?: Set<MemberId>,
    trustedBy?: Set<MemberId>,
    invited?: Set<MemberId>
  ) {
    this.memberId = memberId;
    this.username = username;
    this.fullName = fullName;
    this.createdAt = createdAt;
    this.invitedBy = invitedBy;
    this.inviteConfirmed = inviteConfirmed;
    this.trusts = trusts || Set();
    this.trustedBy = trustedBy || Set();
    this.invited = invited || Set();
    this.balance = balance;
    this.totalDonated = totalDonated;
    this.totalMinted = totalMinted;
    this.lastMinted = lastMinted;
  }

  /* =======================
   * ACCOUNT BALANCE METHODS
   * =======================
   */
  public mintRaha(amount: Big, mintDate?: Date) {
    return new Member(
      this.memberId,
      this.username,
      this.fullName,
      this.createdAt,
      this.invitedBy,
      this.inviteConfirmed,
      this.balance.plus(amount),
      this.totalDonated,
      this.totalMinted.plus(amount),
      mintDate ? mintDate : this.lastMinted,
      this.trusts,
      this.trustedBy,
      this.invited
    );
  }

  public giveRaha(amount: Big) {
    return new Member(
      this.memberId,
      this.username,
      this.fullName,
      this.createdAt,
      this.invitedBy,
      this.inviteConfirmed,
      this.balance.minus(amount),
      this.totalDonated,
      this.totalMinted,
      this.lastMinted,
      this.trusts,
      this.trustedBy,
      this.invited
    );
  }

  public receiveRaha(amount: Big, donation_amount: Big) {
    return new Member(
      this.memberId,
      this.username,
      this.fullName,
      this.createdAt,
      this.invitedBy,
      this.inviteConfirmed,
      this.balance.plus(amount),
      this.totalDonated.plus(donation_amount),
      this.totalMinted,
      this.lastMinted,
      this.trusts,
      this.trustedBy,
      this.invited
    );
  }

  public get videoUri(): string {
    return `https://storage.googleapis.com/${config.publicVideoBucket}/${
      this.memberId
    }/invite.mp4`;
  }

  /* =====================
   * RELATIONSHIP METHODS
   * =====================
   * TODO: consider moving these relationships into their own reducers, rather
   * than having them directly on members, to avoid having to keep member
   * states all in sync.
   */

  /**
   * @returns A new Member with the given member id present in its invited set.
   */
  public inviteMember(memberId: MemberId) {
    return new Member(
      this.memberId,
      this.username,
      this.fullName,
      this.createdAt,
      this.invitedBy,
      this.inviteConfirmed,
      this.balance,
      this.totalDonated,
      this.totalMinted,
      this.lastMinted,
      this.trusts,
      this.trustedBy.add(memberId),
      this.invited.add(memberId)
    );
  }

  /**
   * @returns A new Member with the given member id present in its trusted set.
   */
  public trustMember(memberId: MemberId) {
    return new Member(
      this.memberId,
      this.username,
      this.fullName,
      this.createdAt,
      this.invitedBy,
      this.inviteConfirmed,
      this.balance,
      this.totalDonated,
      this.totalMinted,
      this.lastMinted,
      this.trusts.add(memberId),
      this.trustedBy,
      this.invited
    );
  }

  /**
   * @returns A new Member with the given member id present in its trustedBy set.
   */
  public beTrustedByMember(memberId: MemberId) {
    return new Member(
      this.memberId,
      this.username,
      this.fullName,
      this.createdAt,
      this.invitedBy,
      this.inviteConfirmed || this.invitedBy === memberId,
      this.balance,
      this.totalDonated,
      this.totalMinted,
      this.lastMinted,
      this.trusts,
      this.trustedBy.add(memberId),
      this.invited
    );
  }
}

export interface MembersState {
  byUserId: Map<MemberId, Member>;
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
  return prevState.byUserId.has(memberId);
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
    byMemberUsername: prevState.byMemberUsername.set(member.username, member),
    byUserId: prevState.byUserId.set(member.memberId, member)
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

function applyOperation(
  prevState: MembersState,
  operation: Operation
): MembersState {
  const { creator_uid, created_at } = operation;

  try {
    if (!operationIsRelevantAndValid(operation)) {
      return prevState;
    }
    switch (operation.op_code) {
      case OperationType.REQUEST_INVITE: {
        const { full_name, to_uid, username } = operation.data;

        // the initial users weren't invited by anyone; so no need to hook up any associations.
        if (GENESIS_REQUEST_INVITE_OPS.includes(operation.id)) {
          return addMemberToState(
            prevState,
            new Member(
              creator_uid,
              username,
              full_name,
              new Date(created_at),
              GENESIS_MEMBER,
              true,
              new Big(0),
              new Big(0),
              new Big(0),
              new Date(created_at)
            )
          );
        }

        assertMemberIdPresentInState(prevState, to_uid, operation);
        assertMemberIdNotPresentInState(prevState, creator_uid, operation);

        const inviter = (prevState.byUserId.get(to_uid) as Member).inviteMember(
          creator_uid
        );
        const inviteRequester = new Member(
          creator_uid,
          username,
          full_name,
          new Date(created_at),
          to_uid,
          false,
          new Big(0),
          new Big(0),
          new Big(0),
          new Date(created_at),
          Set([to_uid])
        );
        return addMembersToState(prevState, [inviter, inviteRequester]);
      }
      case OperationType.TRUST: {
        const { to_uid } = operation.data;

        assertMemberIdPresentInState(prevState, creator_uid, operation);
        assertMemberIdPresentInState(prevState, to_uid, operation);
        const truster = (prevState.byUserId.get(
          creator_uid
        ) as Member).trustMember(to_uid);
        const trusted = (prevState.byUserId.get(
          to_uid
        ) as Member).beTrustedByMember(creator_uid);
        return addMembersToState(prevState, [truster, trusted]);
      }
      case OperationType.MINT: {
        const { amount, type } = operation.data;

        assertMemberIdPresentInState(prevState, creator_uid, operation);
        const minter = (prevState.byUserId.get(creator_uid) as Member).mintRaha(
          new Big(amount),
          type === MintType.BASIC_INCOME
            ? new Date(operation.created_at)
            : undefined
        );
        return addMembersToState(prevState, [minter]);
      }
      case OperationType.GIVE: {
        const { to_uid, amount, donation_to, donation_amount } = operation.data;

        assertMemberIdPresentInState(prevState, creator_uid, operation);
        assertMemberIdPresentInState(prevState, to_uid, operation);
        // TODO: Update donationRecipient state.
        // Currently we don't do this as RAHA isn't a normal member created via a REQUEST_INVITE operation.
        // Thus RAHA doesn't get added to the members state in the current paradigm.

        const giver = (prevState.byUserId.get(creator_uid) as Member).giveRaha(
          new Big(amount).plus(donation_amount)
        );
        const recipient = (prevState.byUserId.get(
          to_uid
        ) as Member).receiveRaha(new Big(amount), new Big(donation_amount));

        return addMembersToState(prevState, [giver, recipient]);
      }
      default:
        return prevState;
    }
  } catch (err) {
    if (err instanceof OperationInvalidError) {
      // TODO: [#log] do real logging
      // tslint:disable-next-line:no-console
      console.warn("Operation invalid", operation);
      return prevState;
    }
    throw err;
  }
}

const initialState: MembersState = { byUserId: Map(), byMemberUsername: Map() };
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
