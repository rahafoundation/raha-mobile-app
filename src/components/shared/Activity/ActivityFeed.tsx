/**
 * Filterable list of actions Acs have taken. Those actions are a
 * human-readable form of backend Operations, like when people give each other
 * Raha, trust each other, or join Raha.
 */
import * as React from "react";
import { FlatList, FlatListProps, NativeSyntheticEvent } from "react-native";

import { Activity, ActivityView } from "./";
import { Activity as ActivityData } from "../../../store/selectors/activities/types";

type OwnProps = {
  activities: ActivityData[]; // in the order they should be rendered
  header?: React.ReactNode;
  onScroll?: (event?: NativeSyntheticEvent<any> | undefined) => void;
};

type ActivityFeedProps = OwnProps;

export class ActivityFeed extends React.Component<ActivityFeedProps> {
  list: FlatList<ActivityData> | null = null;
  activities: { [key: string]: ActivityView } = {};

  public pageUp = () => {
    if (this.list) {
      this.list.scrollToOffset({ offset: 0 });
    }
  };

  private onViewableItemsChanged: FlatListProps<
    ActivityData
  >["onViewableItemsChanged"] = ({ changed }) => {
    changed.forEach(item => {
      const activity: ActivityData = item.item;
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
        ref={ref => (this.list = ref)}
        ListHeaderComponent={this.props.header ? this.renderHeader : undefined}
        data={this.props.activities}
        keyExtractor={activity => activity.id}
        renderItem={({ item }) => (
          <Activity
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
        onScroll={this.props.onScroll}
      />
    );
  }
}
