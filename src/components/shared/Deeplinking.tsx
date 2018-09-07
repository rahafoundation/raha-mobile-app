import { NavigationActions } from "react-navigation";
import url from "url";
import { DEEPLINK_ROUTES } from "./Navigation";

export function processDeeplink(link: string, navigation: any) {
  const deeplinkUrl = url.parse(link, true, true);
  if (!deeplinkUrl.pathname) {
    return;
  }

  // remove any empty strings in the path, for instance from trailing slashes
  const pathname = deeplinkUrl.pathname
    .split("/") // get each component of the path
    .filter(p => !!p) // remove the empty parts
    .join("/"); // recombine into a path

  if (!(pathname in DEEPLINK_ROUTES)) {
    return;
  }

  // unfortunately, TypeScript not inferring the type of pathname from the above
  // check, so type suggestion is necessary
  const newRoute = DEEPLINK_ROUTES[pathname as keyof typeof DEEPLINK_ROUTES];

  navigation.navigate(
    "App",
    {},
    NavigationActions.navigate({
      routeName: newRoute,
      params: deeplinkUrl.query
    })
  );
}
