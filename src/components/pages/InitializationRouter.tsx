import * as React from "react";
import { NavigationScreenProps, NavigationActions } from "react-navigation";
import { Linking } from "react-native";
import url from "url";

import { Loading } from "../shared/Loading";
import { RouteName, DEEPLINK_ROUTES } from "../shared/Navigation";

type Props = { defaultRoute: RouteName } & NavigationScreenProps;

export class InitializationRouter extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public componentDidMount() {
    // Process deeplink -- we don't use react-navigation for this since it
    // doesn't support HTTPS links.
    Linking.getInitialURL()
      .then(link => {
        if (link) {
          const deeplinkUrl = url.parse(link, true, true);
          if (!deeplinkUrl.pathname) {
            return;
          }
          const pathname = deeplinkUrl.pathname.replace(
            "/",
            ""
          ) as keyof typeof DEEPLINK_ROUTES;
          this.props.navigation.navigate(
            "App",
            {},
            NavigationActions.navigate({
              routeName: DEEPLINK_ROUTES[pathname],
              params: deeplinkUrl.query
            })
          );
        } else {
          const defaultRoute = this.props.defaultRoute;
          if (defaultRoute) {
            this.props.navigation.navigate(
              "App",
              {},
              NavigationActions.navigate({ routeName: defaultRoute })
            );
          } else {
            console.error("No default route defined for LoadingSplash page.");
          }
        }
      })
      .catch(err =>
        console.error("An error occurred while deep linking:", err)
      );
  }

  public render() {
    return <Loading />;
  }
}
