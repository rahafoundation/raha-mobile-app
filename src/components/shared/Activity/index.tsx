/**
 * General purpose component that displays all types of activities. Specific
 * Activities like GiveOperationActivity ultimately output this component.
 */
import * as React from "react";
import { format } from "date-fns";
import { View, StyleSheet, TextStyle, ViewStyle, Image } from "react-native";
import { withNavigation, NavigationInjectedProps } from "react-navigation";

import { Text } from "../elements";
import { colors } from "../../../helpers/colors";
import {
  VideoWithPlaceholderView,
  VideoWithPlaceholder
} from "../VideoWithPlaceholder";
import {
  Activity as ActivityData,
  ActivityContent as ActivityContentData,
  ActivityCallToAction as CallToActionData
} from "../../../store/selectors/activities/types";
import { MemberName } from "../MemberName";
import { MemberThumbnail } from "../MemberThumbnail";
import { Currency } from "../Currency";
import { TextLink } from "../elements/TextLink";
import Icon from "react-native-vector-icons/FontAwesome";

type Props = {
  activity: ActivityData;
};

const CallToAction: React.StatelessComponent<{
  callToAction: CallToActionData;
}> = ({ callToAction: { actor, actions } }) => {
  return (
    <View>
      <MemberThumbnail member={actor} />
      {actions.map(action => (
        <View>
          {action.text.map(piece => {
            if (typeof piece === "string") {
              return <Text>piece</Text>;
            }
            if ("currencyType" in piece) {
              return <Currency currencyValue={piece} />;
            }
            if ("destination" in piece) {
              return (
                <TextLink destination={piece.destination}>
                  {piece.text}
                </TextLink>
              );
            }
            console.error(
              `Unexpected value in ActivityContent's callToAction field: ${piece}. Aborting`
            );
            return <React.Fragment />;
          })}
        </View>
      ))}
    </View>
  );
};

class ActivityContentBody extends React.Component<{
  body: ActivityContentData["body"];
}> {
  render() {
    const { body } = this.props;
    if (!body) {
      return <React.Fragment />;
    }
    if ("text" in body) {
      return <Text>{body.text}</Text>;
    }

    if ("iconName" in body) {
      return <Icon name={body.iconName} />;
    }

    return (
      <View>
        {body.map((media, idx) => {
          if ("videoUri" in media) {
            return <VideoWithPlaceholder key={idx} uri={media.videoUri} />;
          }
          return <Image source={{ uri: media.imageUri }} />;
        })}
      </View>
    );
  }
}

class ActivityContent extends React.Component<{
  content: ActivityContentData;
}> {
  public render() {
    const { actor, description, body, nextInChain } = this.props.content;
    return (
      <View>
        <View style={styles.actorRow}>
          <MemberThumbnail diameter={leftColumnWidth} member={actor} />
          <View>
            <MemberName member={actor} />
            {description &&
              description.map((piece, idx) => {
                if (typeof piece === "string") {
                  return <Text key={idx}>{piece}</Text>;
                }
                if ("currencyType" in piece) {
                  return <Currency key={idx} currencyValue={piece} />;
                }
                console.error(
                  `Unexpected value in ActivityContent description: ${piece}, aborting.`
                );
                return <View key={idx} />;
              })}
          </View>
        </View>
        <View style={styles.contentBodyRow}>
          {/* TODO: render chain direction */}
          <View
            style={[
              styles.leftColumn,
              styles.chainIndicator,
              ...(nextInChain ? [] : [styles.invisible])
            ]}
          />
          <ActivityContentBody body={body} />
        </View>
        {nextInChain && <ActivityContent content={nextInChain.content} />}
      </View>
    );
  }
}

export class ActivityView extends React.Component<
  Props & NavigationInjectedProps,
  {}
> {
  videoElem?: VideoWithPlaceholderView;

  /**
   * Reset video playback state, stop it
   */
  public resetVideo = () => {
    if (this.videoElem) {
      this.videoElem.reset();
    }
  };

  render() {
    const { content, callToAction, timestamp } = this.props.activity;
    return (
      <View>
        <ActivityContent content={content} />
        {callToAction && <CallToAction callToAction={callToAction} />}
        <Text style={styles.timestamp}>
          {format(timestamp, "MMM D, YYYY h:mm a")}
        </Text>
      </View>
    );
  }
}

const leftColumnWidth = 50;

const timestampStyle: TextStyle = {
  fontSize: 12,
  color: colors.darkAccent
};

const leftColumnStyle: ViewStyle = {
  width: leftColumnWidth
};

const actorRowStyle: ViewStyle = {};

const contentBodyRowStyle: ViewStyle = {};

const invisibleStyle: ViewStyle = {
  opacity: 0
};

const chainIndicatorStyle: ViewStyle = {
  backgroundColor: colors.darkAccent,
  width: 5
};

const styles = StyleSheet.create({
  timestamp: timestampStyle,
  actorRow: actorRowStyle,
  contentBodyRow: contentBodyRowStyle,
  leftColumn: leftColumnStyle,
  invisible: invisibleStyle,
  chainIndicator: chainIndicatorStyle
});

export const Activity = withNavigation<Props>(ActivityView);
