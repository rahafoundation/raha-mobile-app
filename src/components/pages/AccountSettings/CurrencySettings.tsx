import * as React from "react";
import { connect, MapStateToProps } from "react-redux";
import { ScrollView } from "react-native";

import { Member } from "../../../store/reducers/members";
import { RahaState } from "../../../store";
import { getLoggedInMember } from "../../../store/selectors/authentication";
import { Text } from "../../shared/elements";
import { fonts } from "../../../helpers/fonts";
import { styles } from "./styles";

const DAYS_TILL_INACTIVITY = 400;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

interface OwnProps {}

type StateProps = {
  loggedInMember: Member;
};

type Props = OwnProps & StateProps;

type State = {
  timeRemaining: string;
};

class CurrencySettingsPageView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      timeRemaining: this.getTimeRemaining()
    };
  }

  private getTimeRemaining() {
    // TODO make a RED countdown with finer granularity than 1 day
    // if you're within a month of being marked inactive, call
    // updateTimeRemaining on setInterval.
    const sinceLastOperationMilli =
      Date.now() - this.props.loggedInMember.get("lastOpCreatedAt").getTime();
    return `${DAYS_TILL_INACTIVITY -
      Math.round(sinceLastOperationMilli / MS_PER_DAY)} days`;
  }

  render() {
    const { timeRemaining } = this.state;
    return (
      <ScrollView style={styles.page}>
        <Text style={styles.row}>
          After {<Text style={fonts.Lato.Bold}>{timeRemaining}</Text>} without
          minting or giving Raha your account balance will be donated.
        </Text>
        <Text style={styles.row}>
          You currently donate 3% of all Raha you receive.
        </Text>
        <Text style={[styles.row, styles.comingSoon]}>
          Coming soon - the ability to modify your donation rate.
        </Text>
      </ScrollView>
    );
  }
}

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  RahaState
> = state => {
  const loggedInMember = getLoggedInMember(state);
  if (!loggedInMember) {
    throw Error("Cannot show Currency Settings, not logged in");
  }
  return { loggedInMember };
};

export const CurrencySettingsPage = connect(mapStateToProps)(
  CurrencySettingsPageView
);
