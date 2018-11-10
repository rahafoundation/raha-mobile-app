import * as React from "react";
import { List, ListItem } from "react-native-elements";
import { RouteName } from "../../shared/navigation";
import { withNavigation, NavigationInjectedProps } from "react-navigation";
import { ScrollView, Platform } from "react-native";
import { styles } from "./styles";
import { generateRandomIdentifier } from "../../../helpers/identifiers";
import { Text } from "../../shared/elements";
import { config } from "../../../data/config";
import { fontSizes } from "../../../helpers/fonts";
import { colors } from "../../../helpers/colors";

interface NavigationListItem {
  title: string;
  icon: string;
  // This is a method since RouteName enum is undefined on module load -- seems like a bug with babel or RN JS interpreter?
  getTarget: () => RouteName;
  getParams?: () => any;
}

const SETTINGS_ITEMS: NavigationListItem[] = [
  {
    title: "Edit profile",
    icon: "account-circle",
    getTarget: () => RouteName.EditMemberPage,
    getParams: () => {
      return {
        editMemberApiCallId: generateRandomIdentifier()
      };
    }
  },
  {
    title: "Account recovery",
    icon: "help",
    getTarget: () => RouteName.AccountRecovery
  },
  {
    title: "Currency",
    icon: "account-balance",
    getTarget: () => RouteName.CurrencySettings
  },
  {
    title: "Governance",
    icon: "poll",
    getTarget: () => RouteName.Governance
  },
  {
    title: "Review pending accounts",
    icon: "person-outline",
    getTarget: () => RouteName.PendingInvitesPage
  },
  {
    title: "Sign out",
    icon: "exit-to-app",
    getTarget: () => RouteName.SignOut
  }
];

interface OwnProps {}

type Props = OwnProps & NavigationInjectedProps;

const AccountSettingsPageView: React.StatelessComponent<Props> = (
  props: Props
) => {
  const versionInfo = config.versionInfo;
  const codepushVersion =
    Platform.OS === "ios"
      ? versionInfo.iosCodepushVersion
      : versionInfo.androidCodepushVersion;
  return (
    <ScrollView style={styles.page}>
      <List>
        {SETTINGS_ITEMS.map(item => (
          <ListItem
            key={item.title}
            title={item.title}
            leftIcon={{ name: item.icon }}
            onPress={() =>
              props.navigation.navigate(
                item.getTarget(),
                item.getParams && item.getParams()
              )
            }
          />
        ))}
      </List>
      <Text
        style={[
          fontSizes.small,
          { textAlign: "center", margin: 4, color: colors.secondaryText }
        ]}
      >{`App Version: ${versionInfo.appVersion}-${codepushVersion}`}</Text>
    </ScrollView>
  );
};

export const AccountSettingsPage = withNavigation<Props>(
  AccountSettingsPageView
);
