/**
 * A Feed that displays all the flags on a given member's account. It also
 * provides a way to resolve these flags.
 */
import * as React from "react";
import { View, FlatList, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { connect, MapStateToProps } from "react-redux";
import { formatRelative } from "date-fns";
import { NavigationScreenProps } from "react-navigation";
import { List } from "immutable";

import { FlagMemberOperation } from "@raha/api-shared/dist/models/Operation";

import { RahaState } from "../../../store";
import { colors } from "../../../helpers/colors";
import { Text, Button } from "../../shared/elements";
import { MemberName } from "../../shared/MemberName";
import { Member } from "../../../store/reducers/members";
import { getMemberById } from "../../../store/selectors/members";
import { fontSizes } from "../../../helpers/fonts";
import { MemberThumbnail } from "../../shared/MemberThumbnail";
import { RouteName } from "../../shared/navigation";
import { generateRandomIdentifier } from "../../../helpers/identifiers";
import { styles as sharedStyles } from "./styles";

interface FlagData {
  flaggedByMember: Member;
  flagOperation: FlagMemberOperation;
}

type OwnProps = NavigationScreenProps<{
  member: Member;
}>;

interface StateProps {
  flagData: List<FlagData>;
}

type Props = OwnProps & StateProps;

const FlagFeedPageView: React.StatelessComponent<Props> = ({
  flagData,
  navigation
}) => {
  return (
    <View style={styles.list}>
      <FlatList
        data={flagData.toArray()}
        keyExtractor={flagOp => flagOp.flagOperation.id}
        ListEmptyComponent={() => (
          <View style={[sharedStyles.page, sharedStyles.section]}>
            <Text style={sharedStyles.infoHeader}>
              There are no remaining flags on this account!
            </Text>
          </View>
        )}
        renderItem={dataItem => {
          const { flaggedByMember, flagOperation } = dataItem.item;
          return (
            <View style={styles.listItem}>
              <View style={listItemHeaderStyle}>
                <MemberThumbnail
                  member={flaggedByMember}
                  style={styles.listItemHeaderThumbnail}
                />
                <View style={listItemHeaderTextStyle}>
                  <Text>
                    <MemberName member={flaggedByMember} /> flagged this
                    account.
                  </Text>
                  <Text style={listItemHeaderTextTimestampStyle}>
                    {formatRelative(
                      flagOperation.created_at,
                      new Date()
                    ).toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.listItemBody}>
                {flagOperation.data.reason}
              </Text>
              <View style={styles.listItemActions}>
                <Button
                  title="Resolve flag"
                  style={styles.listItemButton}
                  textStyle={styles.listItemButtonText}
                  onPress={() =>
                    navigation.navigate(RouteName.ResolveFlagMemberPage, {
                      flagToResolveOperation: flagOperation,
                      apiCallId: generateRandomIdentifier()
                    })
                  }
                />
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const member = ownProps.navigation.getParam("member");
  if (!member) {
    throw new Error("No member passed to FlagFeed page.");
  }
  // Refresh member state
  const refreshedMember = getMemberById(
    state,
    member.get("memberId")
  ) as Member;
  const flagOperationIds = refreshedMember.get("operationsFlaggingThisMember");
  return {
    flagData: (state.operations.filter(op =>
      flagOperationIds.includes(op.id)
    ) as List<FlagMemberOperation>).map(flagMemberOperation => {
      const flaggedByMember = getMemberById(
        state,
        flagMemberOperation.creator_uid,
        { throwIfMissing: true }
      );
      return {
        flaggedByMember,
        flagOperation: flagMemberOperation
      };
    })
  };
};

export const FlagFeedPage = connect(mapStateToProps)(FlagFeedPageView);

const LEFT_MARGIN = 50;

const listStyle: ViewStyle = {
  backgroundColor: colors.pageBackground,
  flex: 1
};

const listItemStyle: ViewStyle = {
  flex: 1,
  flexDirection: "column",
  margin: 12
};

const listItemHeaderStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center"
};

const listItemHeaderThumbnailStyle: ViewStyle = {
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: LEFT_MARGIN,
  marginRight: 10
};

const listItemHeaderTextStyle: ViewStyle = {
  flexDirection: "column"
};

const listItemHeaderTextTimestampStyle: TextStyle = {
  ...fontSizes.small,
  color: colors.secondaryText,
  marginTop: 4
};

const listItemBodyStyle: TextStyle = {
  marginTop: 4,
  marginLeft: 50
};

const listItemActionsStyle: ViewStyle = {
  flexDirection: "row",
  alignContent: "center",
  justifyContent: "space-around"
};

const listItemButtonStyle: ViewStyle = {
  borderColor: colors.button,
  borderWidth: 1,
  backgroundColor: colors.pageBackground,
  marginTop: 8
};

const listItemButtonTextStyle: TextStyle = {
  color: colors.button
};

const styles = StyleSheet.create({
  list: listStyle,
  listItem: listItemStyle,
  listItemHeader: listItemHeaderStyle,
  listItemHeaderThumbnail: listItemHeaderThumbnailStyle,
  listItemHeaderText: listItemHeaderTextStyle,
  listItemHeaderTextTimestamp: listItemHeaderTextTimestampStyle,
  listItemBody: listItemBodyStyle,
  listItemActions: listItemActionsStyle,
  listItemButton: listItemButtonStyle,
  listItemButtonText: listItemButtonTextStyle
});
