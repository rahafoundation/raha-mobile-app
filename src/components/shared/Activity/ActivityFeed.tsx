/**
 * Filterable list of actions Acs have taken. Those actions are a
 * human-readable form of backend Operations, like when people give each other
 * Raha, trust each other, or join Raha.
 */
import * as React from "react";
import { FlatList, FlatListProps } from "react-native";
import { List, Map } from "immutable";

import { MemberId } from "@raha/api-shared/dist/models/identifiers";

import { ActivityItem } from "./ActivityItem";
import { ActivityTemplateView } from "./ActivityItem/ActivityTemplate";
import { Member } from "../../../store/reducers/members";
import { Activity } from ".";

interface ActivityFeedProps {
  activities: List<Activity>;
  header?: React.ReactNode;
}

export class ActivityFeed extends React.Component<ActivityFeedProps> {
  activities: { [key: string]: ActivityTemplateView } = {};

  private onViewableItemsChanged: FlatListProps<
    Activity
  >["onViewableItemsChanged"] = ({ viewableItems, changed }) => {
    changed.forEach(item => {
      const activity: Activity = item.item;
      if (item.isViewable) {
        return;
      }
      const activityComponent = this.activities[activity.id];
      if (!activityComponent) {
        return;
      }
      activityComponent.resetVideo();
    });
  };

  private renderHeader = () => {
    return this.props.header as React.ReactElement<any>;
  };

  render() {
    const activities = this.props.activities;
    return (
      <FlatList
        ListHeaderComponent={this.props.header ? this.renderHeader : undefined}
        data={activities.reverse().toArray()}
        keyExtractor={activity => activity.id}
        renderItem={({ item }) => (
          <ActivityItem
            activity={item}
            activityRef={elem => {
              if (!elem) {
                // TODO: ensure this degrades well if this is observed to occur
                // console.error("Unexpected: ActivityItem ref has no value");
                return;
              }
              this.activities[item.id] = elem;
            }}
          />
        )}
        onViewableItemsChanged={this.onViewableItemsChanged}
      />
    );
  }
}
