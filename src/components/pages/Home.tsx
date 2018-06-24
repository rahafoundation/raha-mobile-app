import * as React from "react";
import { Text, View } from "react-native";

import { ActivityFeed } from "../shared/ActivityFeed";
import { OperationType } from "../../store/reducers/operations";

export const Home: React.StatelessComponent = () => {
  return (
    <View>
      <ActivityFeed
        filter={operation => operation.op_code !== OperationType.MINT}
      />
    </View>
  );
};
