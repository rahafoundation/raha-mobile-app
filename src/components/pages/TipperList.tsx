/**
 * Displays the list of members who tipped a person.
 */
import * as React from "react";
import { MapStateToProps, connect } from "react-redux";
import {
  FlatList,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Text
} from "react-native";

import { Member } from "../../store/reducers/members";
import { RahaState } from "../../store";
import { MemberThumbnail } from "../shared/MemberThumbnail";
import { getMembersByIds, getMemberById } from "../../store/selectors/members";
import { TipData } from "../../store/selectors/stories/types";
import { MixedText } from "../shared/elements/MixedText";
import { CurrencyType, CurrencyRole } from "../shared/elements/Currency";
import {
  NavigationScreenProps,
  NavigationInjectedProps
} from "react-navigation";
import { IndependentPageContainer } from "../shared/elements";
import { MemberName } from "../shared/MemberName";

type StateProps = {
  toMember: Member;
  tippers: Member[];
  tipData: TipData;
};

type NavProps = NavigationScreenProps<{
  tipData: TipData;
}>;

type OwnProps = NavProps & NavigationInjectedProps;
type TipperListProps = StateProps & OwnProps;

export const TipperListView: React.StatelessComponent<TipperListProps> = ({
  tippers,
  toMember,
  tipData
}) => {
  const fromCount = tipData.fromMemberIds.size;
  const { tipTotal, donationTotal } = tipData;
  const toMemberName = toMember.get("fullName");
  const content = [
    toMemberName,
    "received",
    {
      currencyType: CurrencyType.Raha,
      value: tipTotal.plus(donationTotal),
      role: CurrencyRole.Transaction
    },
    "in tips",
    "from",
    fromCount.toString(),
    fromCount === 1 ? "person" : "people",
    ...(donationTotal.gt(0)
      ? [
          "and donated",
          {
            currencyType: CurrencyType.Raha,
            value: donationTotal,
            role: CurrencyRole.Donation
          }
        ]
      : [])
  ];
  return (
    <IndependentPageContainer containerStyle={styles.container}>
      {/* Hack to make Android properly center text: Wrap in another <Text />*/}
      <Text style={{ textAlign: "center" }}>
        <MixedText style={styles.header} content={content} />
      </Text>
      <FlatList
        data={tippers}
        keyExtractor={m => m.get("memberId")}
        renderItem={({ item }) => {
          return (
            <View style={styles.listItem}>
              <MemberThumbnail style={styles.memberThumbnail} member={item} />
              <MemberName member={item} />
            </View>
          );
        }}
      />
    </IndependentPageContainer>
  );
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const tipData = ownProps.navigation.getParam("tipData") as
    | TipData
    | undefined;
  if (!tipData) {
    throw new Error("No tipData was passed to TipperList page.");
  }

  const toMember = getMemberById(state, tipData.toMemberId);
  if (!toMember) {
    throw new Error("Invalid member was passed to TipperList page.");
  }

  return {
    toMember,
    tippers: getMembersByIds(state, Array.from(tipData.fromMemberIds)).filter(
      x => !!x
    ) as Member[],
    tipData
  };
};

export const TipperList = connect(mapStateToProps)(TipperListView);

const containerStyle: ViewStyle = {
  padding: 12
};

const headerStyle: TextStyle = {
  textAlign: "center"
};

const memberThumbnailStyle: ViewStyle = {
  marginRight: 8
};

const listItemStyle: ViewStyle = {
  marginHorizontal: 12,
  flexDirection: "row",
  alignItems: "center"
};

const styles = StyleSheet.create({
  container: containerStyle,
  header: headerStyle,
  memberThumbnail: memberThumbnailStyle,
  listItem: listItemStyle
});
