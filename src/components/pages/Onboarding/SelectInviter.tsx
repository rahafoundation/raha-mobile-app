import * as React from "react";
import { Member } from "../../../store/reducers/members";
import { View, StyleSheet } from "react-native";
import { MemberSearchBar } from "../../shared/MemberSearchBar";

import { Button } from "../../shared/elements";

/**
 * Page that confirms who the user is trying to get an invite from and their full name.
 */

type OwnProps = {
  initialDisplayName?: string;
  onSelectedInviter: (verifiedNameinviter: Member) => any;
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
        <MemberSearchBar
          placeholderText="Who do you want to request an invite from?"
          onMemberSelected={member => {
            this.setState({
              invitingMember: member
            });
          }}
        />
        {invitingMember && (
          <React.Fragment>
            <Button
              title={`Request invite from ${invitingMember.fullName}`}
              onPress={() => {
                this.props.onSelectedInviter(invitingMember);
              }}
            />
          </React.Fragment>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 24
  },
  searchBar: {
    width: "100%"
  }
});
