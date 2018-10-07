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

import { RahaState } from "../../store";
import { colors, palette } from "../../helpers/colors";
import { NavigationScreenProps } from "react-navigation";
import { FlagMemberOperation } from "@raha/api-shared/dist/models/Operation";
import { List } from "immutable";
import { Text } from "../shared/elements";
import { MemberName } from "../shared/MemberName";
import { Member } from "../../store/reducers/members";
import { getMemberById } from "../../store/selectors/members";
import { fontSizes } from "../../helpers/fonts";
import Icon from "react-native-vector-icons/FontAwesome5";
import { MemberThumbnail } from "../shared/MemberThumbnail";

interface FlagData {
  flaggingMember: Member;
  flagOperation: FlagMemberOperation;
}

type OwnProps = NavigationScreenProps<{
  flagOperationIds: OperationId[];
}>;

interface StateProps {
  flagData: List<FlagData>;
}

type Props = OwnProps & StateProps;

const FlagFeedPageView: React.StatelessComponent<Props> = ({ flagData }) => {
  return (
    <View style={{ backgroundColor: colors.pageBackground, flex: 1 }}>
      <FlatList
        data={flagData.toArray()}
        keyExtractor={flagOp => flagOp.flagOperation.id}
        renderItem={dataItem => {
          const { flaggingMember, flagOperation } = dataItem.item;
          return (
            <View style={{ flex: 1, flexDirection: "column", margin: 12 }}>
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
                <Text>
                  <MemberName member={flaggingMember} /> flagged this account.
                </Text>
              </View>
              <Text style={{ marginTop: 4, marginLeft: 50 }}>
                {flagOperation.data.reason}
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
  const flagOperationIds = ownProps.navigation.getParam("flagOperationIds");
  if (!flagOperationIds) {
    throw new Error("No flagOperationIds passed to FlagFeed page.");
  }
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
