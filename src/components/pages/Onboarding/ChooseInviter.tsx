import * as React from "react";
import { Member } from "../../../store/reducers/members";
import { Text, Button } from "react-native-elements";
import { MemberSearchBar } from "../../shared/MemberSearchBar";

/**
 * Component that confirms who the user is trying to get an invite from during onboarding.
 */
type ChooseInviterProps = {
  onInviterSelected: (inviter: Member) => void;
};

type ChooseInviterState = {
  invitingMember?: Member;
};

export class ChooseInviter extends React.Component<
  ChooseInviterProps,
  ChooseInviterState
> {
  render() {
    const invitingMember = this.state ? this.state.invitingMember : undefined;
    return (
      <React.Fragment>
        <MemberSearchBar
          placeholderText="Who do you want to request an invite from?"
          onMemberSelected={member => {
            this.setState({
              invitingMember: member
            });
          }}
        />
        {invitingMember && (
          <Button
            onPress={() => {
              this.props.onInviterSelected(invitingMember);
            }}
            title={`Request invite from ${invitingMember.fullName}`}
          />
        )}
      </React.Fragment>
    );
  }
}
