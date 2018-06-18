import * as React from "react";
import { Big } from "big.js";

import { GiveOperation } from "../../../store/reducers/operations";
import { ActivityTemplate } from "./ActivityTemplate";
import { MapStateToProps, connect } from "react-redux";
import { RahaState } from "../../../store";
import { Member } from "../../../store/reducers/members";
import { getMembersByIds } from "../../../store/selectors/members";

type OwnProps = {
  operation: GiveOperation;
};
type StateProps = {
  toMember?: Member;
  fromMember: Member;
};
type GiveOperationItemProps = OwnProps & StateProps;

export const GiveOperationItemView: React.StatelessComponent<
  GiveOperationItemProps
> = ({ operation, fromMember, toMember }) => {
  return (
    <ActivityTemplate
      message={`Give ${operation.data.memo} `}
      from={fromMember}
      to={toMember}
      timestamp={new Date(operation.created_at)}
      amount={new Big(operation.data.amount)}
    />
  );
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const [fromMember, toMember] = [
    getMembersByIds(state, [ownProps.operation.creator_uid])[0],
    getMembersByIds(state, [ownProps.operation.data.to_uid])[0]
  ];
  if (!fromMember || !toMember) {
    throw new Error("aah");
  }
  return { fromMember, toMember };
};

export const GiveOperationItem = connect(mapStateToProps)(
  GiveOperationItemView
);
