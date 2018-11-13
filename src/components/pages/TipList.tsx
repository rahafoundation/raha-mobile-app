/**
 * A list of members who tipped the operation
 */
import * as React from "react";
import { FlatList, View, Text } from "react-native";

import { Member } from "../../store/reducers/members";
import { fontSizes } from "../../helpers/fonts";
import { TipGiveOperation } from "@raha/api-shared/dist/models/Operation";

type StateProps = {
  tippedMember: Member;
  tips: TipGiveOperation[];
};

type Props = StateProps;

export const TipList: React.StatelessComponent<Props> = ({
  tips,
  tippedMember
}) => {
  return (
    <View
      style={{
        marginHorizontal: 12
      }}
    >
      <FlatList
        data={tips}
        keyExtractor={i => i.id}
        renderItem={({ item, index }) => {
          return (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginVertical: 4
              }}
            >
              <Text
                style={{ flex: 1, alignSelf: "stretch", ...fontSizes.large }}
              >
                {index + 1}
              </Text>
              <Text style={{ margin: 8, flex: 5, alignSelf: "stretch" }}>
                {item.creator_uid}
              </Text>
              <Text style={{ flex: 1, alignSelf: "stretch" }}>
                {item.data.amount}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
};
