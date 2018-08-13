/**
 * Filterable list of actions Acs have taken. Those actions are a
 * human-readable form of backend Operations, like when people give each other
 * Raha, trust each other, or join Raha.
 */
import * as React from "react";
import { FlatList, FlatListProps } from "react-native";

import { ActivityItem, ActivityItemView } from "./ActivityItem";
import { Activity } from ".";

interface ActivityFeedProps {
  activities: Activity[]; // in the order they should be rendered
  header?: React.ReactNode;
}

export class ActivityFeed extends React.Component<ActivityFeedProps> {
  activities: { [key: string]: ActivityItemView } = {};

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
    return (
      <FlatList
        ListHeaderComponent={this.props.header ? this.renderHeader : undefined}
        data={this.props.activities}
        keyExtractor={activity => activity.id}
        renderItem={({ item }) => (
          <ActivityItem
            activity={item}
            onRef={elem => {
              if (!elem) {
                // TODO: ensure this degrades well if this is observed to occur
                // console.error("Unexpected: ActivityItem ref has no value");
                return;
              }
              this.activities[item.id] = elem as any;
            }}
          />
        )}
        onViewableItemsChanged={this.onViewableItemsChanged}
      />
    );
  }
}
