/**
 * Show the users profile, such as their name, balance, and trust connections.
 * If it is your own profile, then there will be additional information such
 * as ability to Mint.
 */
import * as React from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";

import { Video } from "expo";
import { RahaState, RahaThunkDispatch } from "../../store";
import { getMembersByIds } from "../../store/selectors/members";
import { Member } from "../../store/reducers/members";
import { signOut } from "../../store/actions/authentication";

type OwnProps = {
  navigation: any;
  member: Member;
  isOwnProfile: boolean;
};

type StateProps = {};

type DispatchProps = {
  signOut: () => void;
  mint: () => void;
  trust: () => void;
};

type ProfileProps = OwnProps & StateProps & DispatchProps;

class ProfileView extends React.Component<ProfileProps> {
  renderActions() {
    if (this.props.isOwnProfile) {
      return (
        <View>
          <Button title="Mint" onPress={this.props.mint} />
          <Button title="Log Out" onPress={this.props.signOut} />
        </View>
      );
    }
    return <Button title="Trust" onPress={this.props.trust} />;
  }

  renderThumbnail() {
    return (
      <View style={{ flex: 1 }}>
        <Video
          source={{ uri: this.props.member.videoUri() }}
          volume={1.0}
          isMuted={true}
          usePoster={true}
          resizeMode={Video.RESIZE_MODE_COVER}
          shouldPlay
          isLooping
          // @ts-ignore Expo typing for Video is missing `style`
          style={styles.video}
        />
        <Text style={{ flex: 1 }}>{`${this.props.member.fullName}`}</Text>
      </View>
    );
  }

  renderStats() {
    return (
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.number}>
            {this.props.member.balance.toString()}
          </Text>
          <Text>{"balance"}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.number}>{this.props.member.trustedBy.size}</Text>
          <Text>{"trusted by"}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.number}>{this.props.member.trusts.size}</Text>
          <Text>{"trusts"}</Text>
        </View>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, width: "100%", flexDirection: "row" }}>
          {this.renderThumbnail()}
          <View style={{ flex: 3 }}>
            {this.renderStats()}
            {this.renderActions()}
          </View>
        </View>
        <View style={{ flex: 3, backgroundColor: "red", width: "100%" }}>
          <Text>TODO feed specific to this user</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%"
  },
  stat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  statsContainer: {
    flexDirection: "row"
  },
  video: {
    flex: 4,
    width: "100%",
    aspectRatio: 3 / 4
  },
  number: {
    fontWeight: "bold"
  }
});

function mint() {
  return null; // TODO
}

function trust() {
  return null; // TODO
}

// const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (
//   dispatch: RahaThunkDispatch
// ) => ({
//   mint: () => dispatch(mint()),
//   trust: () => dispatch(trust()),
//   logOut: () => dispatch(logOut())
// });

export const Profile = connect(
  null,
  { signOut, mint, trust }
)(ProfileView);
