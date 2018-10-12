/**
 * The Feed is a great place for members to catch up on what's happened recently!
 * Shows all of the most recent raha gives and verified join videos.
 * We should add ability to see only transactions of people you trust.
 */
import * as React from "react";
import { View, FlatList } from "react-native";
import { connect, MapStateToProps } from "react-redux";
import { formatRelative } from "date-fns";

import { OperationId } from "@raha/api-shared/dist/models/identifiers";

import { RahaState } from "../../../store";
import { colors, palette } from "../../../helpers/colors";
import { NavigationScreenProps } from "react-navigation";
import { FlagMemberOperation } from "@raha/api-shared/dist/models/Operation";
import { List } from "immutable";
import { Text, Button } from "../../shared/elements";
import { MemberName } from "../../shared/MemberName";
import { Member } from "../../../store/reducers/members";
import { getMemberById } from "../../../store/selectors/members";
import { fontSizes } from "../../../helpers/fonts";
import { MemberThumbnail } from "../../shared/MemberThumbnail";
import { RouteName } from "../../shared/Navigation";
import { generateRandomIdentifier } from "../../../helpers/identifiers";
import { styles as sharedStyles } from "./styles";

interface FlagData {
  flaggingMember: Member;
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
    <View style={{ backgroundColor: colors.pageBackground, flex: 1 }}>
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
          const { flaggingMember, flagOperation } = dataItem.item;
          return (
            <View
              style={{
                flex: 1,
                flexDirection: "column",
                margin: 12
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MemberThumbnail
                  member={flaggingMember}
                  style={{
                    flexGrow: 0,
                    flexShrink: 0,
                    flexBasis: 50,
                    marginRight: 10
                  }}
                />
                <View style={{ flexDirection: "column" }}>
                  <Text>
                    <MemberName member={flaggingMember} /> flagged this account.
                  </Text>
                  <Text
                    style={{
                      ...fontSizes.small,
                      color: colors.secondaryText,
                      marginTop: 4
                    }}
                  >
                    {formatRelative(
                      flagOperation.created_at,
                      new Date()
                    ).toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={{ marginTop: 4, marginLeft: 50 }}>
                {flagOperation.data.reason}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignContent: "center",
                  justifyContent: "space-around"
                }}
              >
                <Button
                  title="Resolve flag"
                  style={{
                    borderColor: colors.button,
                    borderWidth: 1,
                    backgroundColor: colors.pageBackground,
                    marginTop: 8
                  }}
                  textStyle={{ color: colors.button }}
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
      const flaggingMember = getMemberById(
        state,
        flagMemberOperation.creator_uid
      );
      if (!flaggingMember) {
        throw new Error(
          `Invalid flag operation with id: ${
            flagMemberOperation.id
          } in flag feed. Flag creator could not be found.`
        );
      }
      return {
        flaggingMember,
        flagOperation: flagMemberOperation
      };
    })
  };
};

export const FlagFeedPage = connect(mapStateToProps)(FlagFeedPageView);
