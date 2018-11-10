import * as React from "react";
import { NavigationScreenProps, NavigationActions } from "react-navigation";
import { Loading } from "../shared/Loading";
import { RouteName } from "../shared/navigation";

type Props = { defaultRoute: RouteName } & NavigationScreenProps;

/**
 * Displays loading screen for initialization.
 */
export class InitializationRouter extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
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

  public render() {
    return <Loading />;
  }
}
