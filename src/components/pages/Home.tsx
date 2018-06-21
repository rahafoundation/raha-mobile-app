import * as React from "react";
import { Text, View } from "react-native";

import { MemberSearchBar } from "../shared/MemberSearchBar";
import { ActivityFeed } from "../shared/ActivityFeed";
import { OperationType } from "../../store/reducers/operations";

export const Home: React.StatelessComponent = () => {
  return (
    <View>
      <Text>Give Raha to:</Text>
      <MemberSearchBar
        // Make onPress go to the item instead of dismissing keyboard
        keyboardShouldPersistTaps="always"
        onMemberSelected={member => {
          console.log(member.username + " clicked");
        }}
      />
      <ActivityFeed
        filter={operation => operation.op_code !== OperationType.MINT}
      />
    </View>
  );
};
