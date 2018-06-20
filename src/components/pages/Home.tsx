import * as React from "react";
import { Text, View } from "react-native";
import { connect, MapStateToProps } from "react-redux";
import { SafeAreaView } from "react-navigation";

import { RahaState } from "../../store";
import { MemberSearchBar } from "../shared/MemberSearchBar";
import { ActivityFeed } from "../shared/ActivityFeed";
import { OperationType } from "../../store/reducers/operations";

type OwnProps = {
  navigation: any;
};

type StateProps = {
  loggedInUserId?: string;
};

type HomeProps = OwnProps & StateProps;

const HomeView: React.StatelessComponent<HomeProps> = props => {
  return (
    <SafeAreaView>
      <Text>Give Raha to:</Text>
      <MemberSearchBar
        // Make onPress go to the item instead of dismissing keyboard
        keyboardShouldPersistTaps="always"
        onMemberSelected={member => {
          console.log(member.username + " clicked");
        }}
      />
      <ActivityFeed
        filter={operation => operation.op_code !== OperationType.MINT}
      />
    </SafeAreaView>
  );
};

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  RahaState
> = state => {
  const { firebaseUser } = state.authentication;
  return {
    loggedInUserId: firebaseUser ? firebaseUser.uid : undefined
  };
};
export const Home = connect(mapStateToProps)(HomeView);
