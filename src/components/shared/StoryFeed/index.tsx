/**
 * Filterable list of actions Acs have taken. Those actions are a
 * human-readable form of backend Operations, like when people give each other
 * Raha, trust each other, or join Raha.
 */
import * as React from "react";
import { FlatList, FlatListProps, NativeSyntheticEvent } from "react-native";

import { Story, StoryView } from "../Story";
import { Story as StoryModel } from "../../../store/selectors/stories/types";
import { List } from "immutable";

interface StoryFeedProps {
  stories: List<StoryModel>; // in the order they should be rendered
  header?: React.ReactNode;
  onScroll?: (event?: NativeSyntheticEvent<any> | undefined) => void;
}

export class StoryFeed extends React.Component<StoryFeedProps> {
  list?: FlatList<StoryModel>;
  stories: { [key: string]: StoryView } = {};

  public pageUp = () => {
    if (this.list) {
      this.list.scrollToIndex({ index: 0 });
    }
  };

  private onViewableItemsChanged: FlatListProps<
    StoryModel
  >["onViewableItemsChanged"] = ({ changed }) => {
    changed.forEach(item => {
      const story: StoryModel = item.item;
      if (item.isViewable) {
        return;
      }
      const storyComponent = this.stories[story.id];
      if (!storyComponent) {
        return;
      }
      storyComponent.resetVideo();
    });
  };

  private renderHeader = () => {
    return this.props.header as React.ReactElement<any>;
  };

  render() {
    return (
      <FlatList
        ref={ref => ref && (this.list = ref)}
        ListHeaderComponent={this.props.header ? this.renderHeader : undefined}
        data={this.props.stories.toArray()}
        keyExtractor={story => story.id}
        renderItem={({ item }) => (
          <Story
            story={item}
            onRef={elem => {
              if (!elem) {
                // TODO: ensure this degrades well if this is observed to occur
                // console.error("Unexpected: ActivityItem ref has no value");
                return;
              }
              this.stories[item.id] = elem as any;
            }}
          />
        )}
        onViewableItemsChanged={this.onViewableItemsChanged}
        onScroll={this.props.onScroll}
      />
    );
  }
}
