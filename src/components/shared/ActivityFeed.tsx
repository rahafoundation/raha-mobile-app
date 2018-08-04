/**
 * Filterable list of actions Acs have taken. Those actions are a
 * human-readable form of backend Operations, like when people give each other
 * Raha, trust each other, or join Raha.
 */
import * as React from "react";
import { FlatList, StyleSheet, FlatListProps } from "react-native";
import { connect, MapStateToProps } from "react-redux";
import { List, Map } from "immutable";

import { Operation, OperationType } from "@raha/api-shared/dist/models/Operation";
import { OperationId, MemberId } from "@raha/api-shared/dist/models/identifiers";

import { RahaState } from "../../store";
import { ActivityItem } from "./ActivityItem/index";
import { ActivityTemplateView } from "./ActivityItem/ActivityTemplate";
import { Member } from '../../store/reducers/members';

interface StateProps {
  operations: List<Operation>;
}

interface OwnProps {
  filter?: (operation: Operation) => boolean;
  header?: React.ReactNode;
}

type ActivityFeedProps = OwnProps & StateProps;

function isInviteConfirmed(membersById: Map<MemberId, Member>, memberId: MemberId): boolean {
  const member = membersById.get(memberId);
  return !!member && member.get("inviteConfirmed");
}

export function isUnconfirmedRequestInvite(membersById: Map<MemberId, Member>, operation: Operation): boolean {
  if (operation.op_code !== OperationType.REQUEST_INVITE) {
    return false;
  }
  return !isInviteConfirmed(membersById, operation.creator_uid);
}

export class ActivityFeedView extends React.Component<ActivityFeedProps> {
  activities: { [key in OperationId]?: ActivityTemplateView } = {};

  private onViewableItemsChanged: FlatListProps<
    Operation
  >["onViewableItemsChanged"] = ({ viewableItems, changed }) => {
    changed.forEach(item => {
      const operation: Operation = item.item;
      if (item.isViewable) {
        return;
      }
      const activityComponent = this.activities[operation.id];
      if (!activityComponent) {
        return;
      }
      activityComponent.resetVideo();
    });
  };

  private renderHeader = () => {
    return this.props.header as React.ReactElement<any>;
  };

  render() {
    const operations = this.props.filter
      ? this.props.operations.filter(this.props.filter)
      : this.props.operations;
    return (
      <FlatList
        ListHeaderComponent={this.props.header ? this.renderHeader : undefined}
        data={operations.reverse().toArray()}
        keyExtractor={operation => operation.id}
        renderItem={operationItem => (
          <ActivityItem
            operation={operationItem.item}
            activityRef={elem => {
              if (!elem) {
                // TODO: ensure this degrades well if this is observed to occur
                // console.error("Unexpected: ActivityItem ref has no value");
                return;
              }
              this.activities[operationItem.item.id] = elem;
            }}
          />
        )}
        onViewableItemsChanged={this.onViewableItemsChanged}
      />
    );
  }
}

const mapStateToProps: MapStateToProps<StateProps, {}, RahaState> = state => {
  return {
    operations: state.operations
  };
};
export const ActivityFeed = connect(mapStateToProps)(ActivityFeedView);

const styles = StyleSheet.create({});
