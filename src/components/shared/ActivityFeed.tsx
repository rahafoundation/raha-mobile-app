import * as React from "react";
import { FlatList, View, Text, StyleSheet } from "react-native";
import { connect, MapStateToProps } from "react-redux";
import { List } from "immutable";

import { RahaState } from "../../store";
import { Operation } from "../../store/reducers/operations";

interface StateProps {
  operations: List<Operation>;
}

type ActivityFeedProps = StateProps;

export const ActivityFeedView: React.StatelessComponent<
  ActivityFeedProps
> = props => {
  return (
    <FlatList
      data={props.operations
        .map(operation => ({
          key: operation.id,
          text: JSON.stringify(operation)
        }))
        .toArray()}
      renderItem={({ item }) => <ActivityItem text={item.text} />}
    />
  );
};

type ActivityItemProps = {
  text: string;
};

const ActivityItem: React.StatelessComponent<ActivityItemProps> = props => {
  return (
    <View style={styles.item}>
      <Text>{props.text}</Text>
    </View>
  );
};
const mapStateToProps: MapStateToProps<StateProps, {}, RahaState> = state => {
  return {
    operations: state.operations
  };
};
export const ActivityFeed = connect(mapStateToProps)(ActivityFeedView);

const styles = StyleSheet.create({
  item: {
    padding: 12
  }
});
