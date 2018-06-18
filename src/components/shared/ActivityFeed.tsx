import * as React from "react";
import { FlatList, View, Text, StyleSheet } from "react-native";
import { connect, MapStateToProps } from "react-redux";
import { List } from "immutable";

import { RahaState } from "../../store";
import { Operation } from "../../store/reducers/operations";
import { ActivityItem } from "./ActivityItem/index";

interface StateProps {
  operations: List<Operation>;
}

interface OwnProps {
  filter?: (operation: Operation) => boolean;
}

type ActivityFeedProps = OwnProps & StateProps;

export const ActivityFeedView: React.StatelessComponent<
  ActivityFeedProps
> = props => {
  const operations = props.filter
    ? props.operations.filter(props.filter)
    : props.operations;
  return (
    <FlatList
      data={operations
        .map(operation => ({
          key: operation.id,
          operation: operation
        }))
        .reverse()
        .toArray()}
      renderItem={({ item }) => <ActivityItem operation={item.operation} />}
    />
  );
};

const mapStateToProps: MapStateToProps<StateProps, {}, RahaState> = state => {
  return {
    operations: state.operations
  };
};
export const ActivityFeed = connect(mapStateToProps)(ActivityFeedView);

const styles = StyleSheet.create({});
