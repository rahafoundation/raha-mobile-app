import * as React from "react";
import { FlatList, View, Text } from "react-native";

type ListProps = {};

type ActivityItemData = {
  text: string;
};

const ActivityFeed: React.StatelessComponent<ListProps> = props => {
  return (
    <FlatList
      data={[
        { text: "Mark received 5R from Omar" },
        { text: "Tina received 5R from Omar" },
        { text: "Omar received 5R from Rahul" }
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
    <View>
      <Text>{props.text}</Text>
    </View>
  );
};
export default ActivityFeed;
