/**
 * A scrolling list of MemberThumbnail, appropriate for viewing groups
 * of members such as everyone trusted by or who trusts a certain person.
 */
import * as React from "react";
import { FlatList, View, Text } from "react-native";

import { Loading } from "../shared/Loading";
import { Member } from "../../store/reducers/members";
import { MemberThumbnail } from "../shared/MemberThumbnail";
import { fontSizes } from "../../helpers/fonts";
import { colors } from "../../helpers/colors";
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
