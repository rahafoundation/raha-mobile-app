import * as React from "react";
import { FlatList, View, Text, StyleSheet } from "react-native";
import { connect, MapStateToProps } from "react-redux";
import { List } from "immutable";

import { RahaState } from "../../store";
import { Operation } from "../../store/reducers/operations";
import { OperationId } from "../../identifiers";
import { ActivityItem } from "./ActivityItem/index";
import { ActivityTemplate } from "./ActivityItem/ActivityTemplate";

interface StateProps {
  operations: List<Operation>;
}

interface OwnProps {
  filter?: (operation: Operation) => boolean;
}

type ActivityFeedProps = OwnProps & StateProps;

export class ActivityFeedView extends React.Component<ActivityFeedProps> {
  activities: { [key in OperationId]?: ActivityTemplate } = {};

  render() {
    const operations = this.props.filter
      ? this.props.operations.filter(this.props.filter)
      : this.props.operations;
    return (
      <FlatList
        data={operations.reverse().toArray()}
        keyExtractor={operation => operation.id}
        renderItem={operationItem => (
          <ActivityItem
            operation={operationItem.item}
            activityRef={(elem: ActivityTemplate) => {
              this.activities[operationItem.item.id] = elem;
            }}
          />
        )}
        onViewableItemsChanged={({ viewableItems, changed }) => {
          viewableItems.forEach(async item => {
            const operation: Operation = item.item;
            if (!item.isViewable) {
              return;
            }
            const activityComponent = this.activities[operation.id];
            if (!activityComponent) {
              return;
            }
            await activityComponent.startVideo();
          });
          changed.forEach(async item => {
            const operation: Operation = item.item;
            if (item.isViewable) {
              return;
            }
            const activityComponent = this.activities[operation.id];
            if (!activityComponent) {
              return;
            }
            await activityComponent.resetVideo();
          });
        }}
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
