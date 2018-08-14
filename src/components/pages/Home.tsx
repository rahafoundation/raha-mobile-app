/**
 * The Home Feed is a great place for members to catch up on what's happened recently!
 * Shows all of the most recent raha gives and verified join videos.
 * We should add ability to see only transactions of people you trust.
 */
import * as React from "react";
import { connect, MapStateToProps } from "react-redux";

import { ActivityFeed } from "../shared/Activity/ActivityFeed";
import { Container } from "../shared/elements";
import { RahaState } from "../../store";
import { allActivities } from "../../store/selectors/activities";
import { Activity } from "../../store/selectors/activities/types";

type StateProps = {
  activities: Activity[];
};

const HomeView: React.StatelessComponent<StateProps> = ({ activities }) => {
  return (
    <Container>
      <ActivityFeed activities={activities} />
    </Container>
  );
};

const mapStateToProps: MapStateToProps<StateProps, {}, RahaState> = state => {
  return { activities: allActivities(state) };
};

export const Home = connect(mapStateToProps)(HomeView);
