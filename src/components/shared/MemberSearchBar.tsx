/**
 * Component that allows search through members and suggests autocompletions.
 */
import * as React from "react";
import { FlatList, View, StyleSheet, TouchableOpacity } from "react-native";
import { SearchBar } from "react-native-elements";
import { connect, MapStateToProps } from "react-redux";
import { RahaState } from "../../store";
import { Member } from "../../store/reducers/members";
import { Text } from "../shared/elements";
import { colors } from "../../helpers/colors";

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
        member.fullName.toLowerCase().startsWith(searchedTextLowercase) ||
        member.username.startsWith(searchedTextLowercase)
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
          containerStyle={this.props.lightTheme ? styles.lightStyle : {}}
          style={styles.searchBar}
          lightTheme={this.props.lightTheme ? this.props.lightTheme : false}
          onChangeText={text => this.suggestMembers(text)}
          onClearText={() => this.clearSuggestions()}
          round
        />
        <FlatList
          keyboardShouldPersistTaps={this.props.keyboardShouldPersistTaps}
          data={this.state.suggestedMembers}
          keyExtractor={item => {
            return item.memberId;
          }}
          renderItem={({ item }) => (
            <MemberItem
              member={item}
              onPressed={() => {
                this.props.onMemberSelected(item);
              }}
            />
          )}
        />
      </View>
    );
  }
}

type MemberProps = {
  member: Member;
  onPressed: () => void;
};

const MemberItem: React.StatelessComponent<MemberProps> = props => {
  return (
    <TouchableOpacity onPress={props.onPressed}>
      <View style={styles.memberItemRow}>
        <Text style={styles.memberText}>{props.member.fullName}</Text>
        <Text style={styles.memberSubtext}>{props.member.username}</Text>
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
  memberItemRow: {
    flexDirection: "row",
    padding: 12,
    width: "100%",
    height: 50,
    backgroundColor: colors.lightAccent,
    alignItems: "center",
    borderRadius: 3
  },
  memberText: {
    flexGrow: 1
  },
  memberSubtext: {
    flexGrow: 1,
    color: "#555"
  },
  lightStyle: {
    backgroundColor: "#fff",
    borderTopColor: "#fff",
    borderBottomColor: "#fff"
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
