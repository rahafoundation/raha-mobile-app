import * as React from "react";
import { View, StyleSheet, TextStyle, ImageStyle } from "react-native";

import {
  Member as MemberData,
  RAHA_BASIC_INCOME_MEMBER
} from "../../store/reducers/members";
import { Text } from "./elements";
// import { colors } from "../../helpers/colors";
import { MemberThumbnail } from "./MemberThumbnail";

interface MemberProps {
  member: MemberData | typeof RAHA_BASIC_INCOME_MEMBER;
}
export const Member: React.StatelessComponent<MemberProps> = ({ member }) => {
  // TODO: probably make this a real member
  if (member === RAHA_BASIC_INCOME_MEMBER) {
    return (
      <View>
        <Text style={styles.memberName}>Raha Basic Income</Text>
      </View>
    );
  }
  return (
    <View>
      <MemberThumbnail member={member} />
      <Text style={styles.memberName}>{member.get("fullName")}</Text>
    </View>
  );
};

const memberName: TextStyle = {
  fontWeight: "700"
};
// const memberThumbnail: ImageStyle = {
//   width: 30,
//   height: 30,
//   borderRadius: 15,
//   borderWidth: 2,
//   borderColor: colors.darkAccent
// };
const styles = StyleSheet.create({
  memberName
});
