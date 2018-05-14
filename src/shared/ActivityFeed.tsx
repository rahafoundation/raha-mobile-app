import * as React from "react";
import { FlatList, View, Text, StyleSheet } from "react-native";

type ListProps = {};

const ActivityFeed: React.StatelessComponent<ListProps> = props => {
  return (
    <FlatList
      data={[
        { key: "1", text: "Mark received 5R from Omar" },
        { key: "2", text: "Tina received 5R from Omar" },
        { key: "3", text: "Omar received 5R from Rahul" }
      ]}
      renderItem={({ item }) => <ActivityItem text={item.text} />}
    />
  );
};

type ItemProps = {
  text: string;
};

const ActivityItem: React.StatelessComponent<ItemProps> = props => {
  return (
    <View style={styles.item}>
      <Text>{props.text}</Text>
    </View>
  );
};
export default ActivityFeed;
const styles = StyleSheet.create({
  item: {
    padding: 12
  }
});
