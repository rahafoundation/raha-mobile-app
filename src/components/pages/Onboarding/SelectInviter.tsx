import * as React from "react";
import { Member } from "../../../store/reducers/members";
import { View, StyleSheet, Dimensions } from "react-native";
import { MemberSearchBar } from "../../shared/MemberSearchBar";

import { Button, Text } from "../../shared/elements";
import { colors } from "../../../helpers/colors";

/**
 * Page that confirms who the user is trying to get an invite from and their full name.
 */

type OwnProps = {
  initialDisplayName?: string;
  onSelectedInviter: (verifiedNameinviter: Member) => any;
  onBack: () => any;
};

type SelectInviterProps = OwnProps;

type SelectInviterState = {
  invitingMember?: Member;
  verifiedName?: string;
};

export class SelectInviter extends React.Component<
  SelectInviterProps,
  SelectInviterState
> {
  constructor(props: SelectInviterProps) {
    super(props);
    this.state = {
      verifiedName: this.props.initialDisplayName
    };
  }

  render() {
    const invitingMember = this.state.invitingMember;
    return (
      <View style={styles.container}>
        <Text style={styles.back} onPress={this.props.onBack}>
          Back
        </Text>
        <View style={styles.card}>
          <Text style={{ fontSize: 18 }}>
            Who are you requesting verification from?
          </Text>
          <MemberSearchBar
            placeholderText="Search for a member"
            lightTheme
            onMemberSelected={member => {
              this.setState({
                invitingMember: member
              });
            }}
          />
          {invitingMember && (
            <React.Fragment>
              <Button
                title={`Request verification from ${invitingMember.get(
                  "fullName"
                )}`}
                onPress={() => {
                  this.props.onSelectedInviter(invitingMember);
                }}
              />
            </React.Fragment>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  back: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: 12
  },
  container: {
    flex: 1,
    backgroundColor: colors.darkBackground,
    alignItems: "center",
    justifyContent: "center"
  },
  card: {
    backgroundColor: colors.lightBackground,
    width: Dimensions.get("window").width - 24,
    padding: 12,
    borderRadius: 12
  },
  searchBar: {
    width: "100%"
  }
});
