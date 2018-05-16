import { Reducer } from "redux";

import { Set, Map } from "immutable";
import { UserId, MemberUsername } from "../../identifiers";
import { OperationsActionType } from "../actions/operations";
import { MembersAction } from "../actions/members";
import { Operation, OperationType } from "./operations";
import OperationInvalidError from "../../errors/OperationInvalidError";

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
 */
export class Member {
  public uid: UserId;
  public mid: MemberUsername;
  public fullName: string;
  public invitedBy: UserId | typeof GENESIS_MEMBER;

  public trustedBy: Set<UserId>;
  public invited: Set<UserId>;
  public trusts: Set<UserId>;

  constructor(
    uid: UserId,
    mid: MemberUsername,
    fullName: string,
    invitedBy: UserId | typeof GENESIS_MEMBER,
    trusts?: Set<UserId>,
    trustedBy?: Set<UserId>,
    invited?: Set<UserId>
  ) {
    this.uid = uid;
    this.mid = mid;
    this.fullName = fullName;
    this.invitedBy = invitedBy;

    this.trusts = trusts || Set();
    this.trustedBy = trustedBy || Set();
    this.invited = invited || Set();
  }

  /* =====================
   * RELATIONSHIP METHODS
   * =====================
   * TODO: consider moving these relationships into their own reducers, rather
   * than having them directly on members, to avoid having to keep member
   * states all in sync.
   */

  /**
   * @returns A new Member with the uid present in its invited set.
   */
  public inviteMember(uid: UserId) {
    return new Member(
      this.uid,
      this.mid,
      this.fullName,
      this.invitedBy,
      this.trusts,
      this.trustedBy.add(uid),
      this.invited.add(uid)
    );
  }

  /**
   * @returns A new Member with the uid present in its trusted set.
   */
  public trustMember(uid: UserId) {
    return new Member(
      this.uid,
      this.mid,
      this.fullName,
      this.invitedBy,
      this.trusts.add(uid),
      this.trustedBy,
      this.invited
    );
  }

  /**
   * @returns A new Member with the uid present in its trustedBy set.
   */
  public beTrustedByMember(uid: UserId) {
    return new Member(
      this.uid,
      this.mid,
      this.fullName,
      this.invitedBy,
      this.trusts,
      this.trustedBy.add(uid),
      this.invited
    );
  }
}

export interface MembersState {
  byUserId: Map<UserId, Member>;
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
    throw new OperationInvalidError("Must have uid", operation);
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
  return false;
}

function assertUserIdPresentInState(
  prevState: MembersState,
  uid: UserId,
  operation: Operation
) {
  if (!(uid in prevState.byUserId)) {
    throw new OperationInvalidError(
      `Invalid operation: user ${uid} not present`,
      operation
    );
  }
}

function addMemberToState(
  prevState: MembersState,
  member: Member
): MembersState {
  return {
    byMemberUsername: prevState.byMemberUsername.set(member.mid, member),
    byUserId: prevState.byUserId.set(member.uid, member)
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
  const { creator_mid, creator_uid } = operation;

  try {
    if (!operationIsRelevantAndValid(operation)) {
      return prevState;
    }

    switch (operation.op_code) {
      case OperationType.REQUEST_INVITE: {
        const { full_name, to_uid } = operation.data;

        // the initial users weren't invited by anyone; so no need to hook up any associations.
        if (GENESIS_REQUEST_INVITE_OPS.includes(operation.id)) {
          return addMemberToState(
            prevState,
            new Member(creator_uid, creator_mid, full_name, GENESIS_MEMBER)
          );
        }

        assertUserIdPresentInState(prevState, to_uid, operation);
        const inviter = prevState.byUserId
          .get(to_uid)
          .inviteMember(creator_uid);
        const inviteRequester = new Member(
          creator_uid,
          creator_mid,
          full_name,
          to_uid,
          Set(to_uid)
        );
        return addMembersToState(prevState, [inviter, inviteRequester]);
      }
      case OperationType.TRUST: {
        const { to_uid } = operation.data;

        assertUserIdPresentInState(prevState, creator_uid, operation);
        assertUserIdPresentInState(prevState, to_uid, operation);
        const truster = prevState.byUserId.get(creator_uid).trustMember(to_uid);
        const trusted = prevState.byUserId
          .get(to_uid)
          .beTrustedByMember(creator_uid);
        return addMembersToState(prevState, [truster, trusted]);
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
