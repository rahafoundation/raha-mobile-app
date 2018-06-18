/**
 * Component that allows search through members and suggests autocompletions.
 */
import * as React from "react";
import { FlatList, View, StyleSheet, Text } from "react-native";
import { SearchBar } from "react-native-elements";
import { connect, MapStateToProps } from "react-redux";
import { RahaState } from "../../store";
import { MembersState, Member } from "../../store/reducers/members";

const NUM_AUTOCOMPLETION_SUGGESTIONS = 3;

type ReduxStateProps = {
  members: MembersState;
};

type OwnProps = {};

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
    for (let member of Array.from(
      this.props.members.byMemberUsername.values()
    )) {
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
          style={styles.searchBar}
          onChangeText={text => this.suggestMembers(text)}
          onClearText={() => this.clearSuggestions()}
        />
        <FlatList
          data={this.state.suggestedMembers}
          keyExtractor={item => {
            return item.memberId;
          }}
          renderItem={({ item }) => <MemberItem member={item} />}
        />
      </View>
    );
  }
}

type MemberProps = {
  member: Member;
};

const MemberItem: React.StatelessComponent<MemberProps> = props => {
  return (
    <View style={styles.memberItemRow}>
      <Text style={styles.memberText}>{props.member.fullName}</Text>
      <Text style={styles.memberSubtext}>{props.member.username}</Text>
    </View>
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
    backgroundColor: "#eee",
    alignItems: "center"
  },
  memberText: {
    flexGrow: 1
  },
  memberSubtext: {
    flexGrow: 1,
    color: "#555"
  }
});

const mapStateToProps: MapStateToProps<
  ReduxStateProps,
  OwnProps,
  RahaState
> = state => {
  return {
    members: state.members
  };
};

export const MemberSearchBar = connect(mapStateToProps)(MemberSearchBarView);
