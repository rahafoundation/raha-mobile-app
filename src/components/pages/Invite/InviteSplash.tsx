import * as React from "react";
import { View, Image } from "react-native";
import { Text, Button } from "../../shared/elements";
import { styles } from "./styles";
import { isPastReferralBonusSplitTransitionDate } from "../../../store/selectors/me";
import { Config } from "@raha/api-shared/dist/helpers/Config";

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export const InviteSplash: React.StatelessComponent<Props> = props => {
  return (
    <View style={styles.page}>
      <Text style={styles.back} onPress={props.onBack}>
        Back
      </Text>
      <View style={styles.body}>
        <Text style={styles.header}>Invite a friend</Text>
        <Image
          resizeMode="contain"
          style={{
            // shrink images to ensure screen doesn't overflow
            flex: -1,
            flexBasis: 200,
            maxWidth: "100%"
          }}
          source={require("../../../assets/img/Invite.png")}
        />
        <Text style={styles.paragraph}>
          {`You'll each be able to mint a bonus ${
            Config.REFERRAL_BONUS_POST_SPLIT
          } Raha after verification!`}
        </Text>
        <Text style={styles.paragraph}>
          Continue to send your friend a video inviting them to the network.
        </Text>
        <Button
          style={styles.button}
          title="Continue"
          onPress={props.onContinue}
        />
      </View>
    </View>
  );
};
