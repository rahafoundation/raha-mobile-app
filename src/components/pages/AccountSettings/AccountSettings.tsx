import * as React from "react";
import { List, ListItem } from "react-native-elements";
import { RouteName } from "../../shared/Navigation";
import { withNavigation, NavigationInjectedProps } from "react-navigation";
import { ScrollView } from "react-native";
import { styles } from "./styles";

interface NavigationListItem {
  title: string;
  icon: string;
  // This is a method since RouteName enum is undefined on module load -- seems like a bug with babel or RN JS interpreter?
  getTarget: () => RouteName;
}

const SETTINGS_ITEMS: NavigationListItem[] = [
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
  return (
    <ScrollView style={styles.page}>
      <List>
        {SETTINGS_ITEMS.map(item => (
          <ListItem
            key={item.title}
            title={item.title}
            leftIcon={{ name: item.icon }}
            onPress={() => props.navigation.navigate(item.getTarget())}
          />
        ))}
      </List>
    </ScrollView>
  );
};

export const AccountSettingsPage = withNavigation<Props>(
  AccountSettingsPageView
);
