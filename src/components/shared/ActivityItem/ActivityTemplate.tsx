import * as React from "react";
import { format } from "date-fns";

import { Big } from "big.js";
import { Member } from "../../../store/reducers/members";
import { Text, View, StyleSheet } from "react-native";
import { Video } from "expo";

type ActivityTemplateProps = {
  from: Member;
  to?: Member;
  amount?: Big;
  message: string;
  timestamp: Date;
  videoUri?: string;
};

export const ActivityTemplate: React.StatelessComponent<
  ActivityTemplateProps
> = props => (
  <View>
    <View style={styles.metadataRow}>
      <View>{props.to && <Text>To {props.to.fullName}</Text>}</View>
      <Text>{format(props.timestamp, "MMM D, YYYY h:m a")}</Text>
    </View>
    <View style={styles.bodyRow}>
      <Text>{props.message}</Text>
      {props.videoUri && <Video source={{ uri: props.videoUri as string }} />}
    </View>
    <View style={styles.fromRow}>
      <View>{props.amount && <Text>ℝ{props.amount.toFixed(2)}</Text>}</View>
      <Text>– {props.from.fullName}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  metadataRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  bodyRow: {
    marginHorizontal: 20
  },
  fromRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  }
});
