/**
 * Component that allows search through members and suggests autocompletions.
 */
import * as React from "react";
import {
  FlatList,
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle
} from "react-native";
import { SearchBar } from "react-native-elements";
import { connect, MapStateToProps } from "react-redux";
import { RahaState } from "../../store";
import { Member } from "../../store/reducers/members";
import { Text } from "./elements";
import { colors, palette } from "../../helpers/colors";

const NUM_AUTOCOMPLETION_SUGGESTIONS = 3;

type ReduxStateProps = {
  members: Member[];
};

type OwnProps = {
  /**
   * Placeholder text
   */
  placeholderText?: string;

  /**
   * Callback when member is selected from the search bar
   */
  onMemberSelected: (member: Member) => any;

  /**
   * When false, tapping outside of the focused text input when the keyboard
   * is up dismisses the keyboard. When "always", the view will not catch
   * taps and the keyboard will not dismiss automatically.
   */
  keyboardShouldPersistTaps?: boolean | "always" | "never" | "handled";
  excludeMembers?: Member[];
  lightTheme?: boolean;
};

type MemberSearchBarProps = ReduxStateProps & OwnProps;

type MemberSearchBarState = {
  suggestedMembers: Member[];
};

class MemberSearchBarView extends React.Component<
  MemberSearchBarProps,
  MemberSearchBarState
> {
  state = {
    suggestedMembers: []
  } as MemberSearchBarState;

  /**
   * Suggests members via simple autocompletion if the search query case-insensitively
   * matches the start of the full name or username.
   */
  suggestMembers(searchedText: string) {
    if (searchedText.length === 0) {
      this.clearSuggestions();
      return;
    }

    let filteredMembers: Member[] = [];
    for (let member of this.props.members) {
      let searchedTextLowercase = searchedText.toLowerCase();
      if (
        member
          .get("fullName")
          .toLowerCase()
          .startsWith(searchedTextLowercase) ||
        member.get("username").startsWith(searchedTextLowercase)
      ) {
        filteredMembers.push(member);
        if (filteredMembers.length === NUM_AUTOCOMPLETION_SUGGESTIONS) {
          break;
        }
      }
    }
    this.setState({
      suggestedMembers: filteredMembers
    });
  }

  clearSuggestions() {
    this.setState({
      suggestedMembers: []
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <SearchBar
          placeholder={this.props.placeholderText}
          placeholderTextColor={colors.searchBarPlaceholderColor}
          containerStyle={styles.searchBarContainer}
          inputStyle={styles.searchBarInput}
          icon={{
            color: colors.searchBarPlaceholderColor
          }}
          style={styles.searchBar}
          onChangeText={text => this.suggestMembers(text)}
          onClearText={() => this.clearSuggestions()}
        />
        <FlatList
          keyboardShouldPersistTaps={this.props.keyboardShouldPersistTaps}
          data={this.state.suggestedMembers}
          keyExtractor={member => {
            return member.get("memberId");
          }}
          renderItem={({ item, index }) => {
            const extraStyle =
              index === 0 ? styles.firstMemberItemRow : undefined;
            return (
              <MemberItem
                style={extraStyle}
                member={item}
                onPressed={() => {
                  this.props.onMemberSelected(item);
                }}
              />
            );
          }}
        />
      </View>
    );
  }
}

type MemberProps = {
  member: Member;
  onPressed: () => void;
  style?: ViewStyle;
};

const MemberItem: React.StatelessComponent<MemberProps> = props => {
  return (
    <TouchableOpacity onPress={props.onPressed}>
      <View style={[styles.memberItemRow, props.style]}>
        <Text style={styles.memberText}>{props.member.get("fullName")}</Text>
        <Text style={styles.memberSubtext}>{props.member.get("username")}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column"
  },
  searchBar: {
    width: "100%"
  },
  firstMemberItemRow: {
    borderTopWidth: 1
  },
  memberItemRow: {
    flexDirection: "row",
    padding: 12,
    width: "100%",
    height: 50,
    borderBottomWidth: 1,
    borderColor: colors.searchBarResultBorder,
    backgroundColor: colors.searchBarResultBackground,
    alignItems: "center"
  },
  memberText: {
    flexGrow: 1
  },
  memberSubtext: {
    flexGrow: 1,
    color: "#555"
  },
  searchBarInput: {
    color: colors.bodyText,
    backgroundColor: palette.veryLightGray
  },
  searchBarContainer: {
    backgroundColor: palette.transparent,
    borderTopColor: palette.transparent,
    borderBottomColor: palette.transparent
  }
});

const mapStateToProps: MapStateToProps<ReduxStateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const allMembers = Array.from(state.members.byMemberUsername.values());
  const { excludeMembers } = ownProps;
  return {
    members: excludeMembers
      ? allMembers.filter(member => excludeMembers.indexOf(member) < 0)
      : allMembers
  };
};

export const MemberSearchBar = connect(mapStateToProps)(MemberSearchBarView);
