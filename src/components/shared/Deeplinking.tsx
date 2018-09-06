import { NavigationActions } from "react-navigation";
import url from "url";
import { DEEPLINK_ROUTES } from "./Navigation";

export function processDeeplink(link: string, navigation: any) {
  const deeplinkUrl = url.parse(link, true, true);
  if (!deeplinkUrl.pathname) {
    return;
  }
  const pathname = deeplinkUrl.pathname.replace(
    "/",
    ""
  ) as keyof typeof DEEPLINK_ROUTES;
  navigation.navigate(
    "App",
    {},
    NavigationActions.navigate({
      routeName: DEEPLINK_ROUTES[pathname],
      params: deeplinkUrl.query
    })
  );
}
