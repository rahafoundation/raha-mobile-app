import * as React from "react";
import { NavigationScreenProps } from "react-navigation";
import { Linking } from "react-native";
import url from "url";

import { Loading } from "../shared/Loading";
import { RouteName, DEEPLINK_ROUTES } from "../shared/Navigation";

type Props = NavigationScreenProps<{ defaultRoute: RouteName }>;

export class LoadingSplash extends React.Component<Props> {
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
          this.props.navigation.replace(
            DEEPLINK_ROUTES[pathname],
            deeplinkUrl.query
          );
        } else {
          const defaultRoute = this.props.navigation.getParam("defaultRoute");
          if (defaultRoute) {
            this.props.navigation.replace(defaultRoute);
          } else {
            console.error("No default route defined.");
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
