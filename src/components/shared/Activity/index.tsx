/**
 * General purpose component that displays all types of activities. Specific
 * Activities like GiveOperationActivity ultimately output this component.
 */
import * as React from "react";
import { formatRelative } from "date-fns";
import { View, StyleSheet, TextStyle, ViewStyle, Image } from "react-native";
import { withNavigation, NavigationInjectedProps } from "react-navigation";
import Icon from "react-native-vector-icons/FontAwesome5";

import { Text } from "../elements";
import { colors, palette } from "../../../helpers/colors";
import {
  VideoWithPlaceholderView,
  VideoWithPlaceholder
} from "../VideoWithPlaceholder";
import {
  Activity as ActivityData,
  ActivityContent as ActivityContentData,
  ActivityCallToAction as CallToActionData,
  ActivityDirection,
  BodyType,
  MediaBody
} from "../../../store/selectors/activities/types";
import { MemberName } from "../MemberName";
import { MemberThumbnail } from "../MemberThumbnail";
import { Currency } from "../elements/Currency";
import { TextLink } from "../elements/TextLink";
import { ArrowHeadDirection, ArrowHead } from "./ArrowHead";
import { fontSizes } from "../../../helpers/fonts";
import { MixedText } from "../elements/MixedText";

type Props = {
  activity: ActivityData;
};

const CallToAction: React.StatelessComponent<{
  callToAction: CallToActionData;
}> = ({ callToAction: { actor, actions } }) => {
  return (
    <View>
      <MemberThumbnail style={styles.actorThumbnail} member={actor} />
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

/**
 * Currently all predetermined bodies are displayed as a large icon.
 */
const IconContentBody: React.StatelessComponent<{
  iconName: string;
}> = ({ iconName }) => <Icon name={iconName} style={styles.iconBody} />;

class MediaContentBody extends React.Component<{
  media: MediaBody["media"];
  onFindVideoElems: (videoElems: VideoWithPlaceholderView[]) => void;
}> {
  videoElems: { [k: number]: VideoWithPlaceholderView } = {};

  render() {
    const { media, onFindVideoElems } = this.props;
    return media.map((item, idx) => {
      if ("videoUri" in item) {
        return (
          <VideoWithPlaceholder
            onRef={elem => {
              if (!elem) return;
              this.videoElems[idx] = elem as VideoWithPlaceholderView;
              onFindVideoElems(Object.values(this.videoElems));
            }}
            style={styles.mediaBody}
            key={idx}
            uri={item.videoUri}
          />
        );
      }
      return <Image source={{ uri: item.imageUri }} />;
    });
  }
}

class ActivityContentBody extends React.Component<{
  body: ActivityContentData["body"];
  onFindVideoElems: (elems: VideoWithPlaceholderView[]) => void;
}> {
  renderBody = () => {
    const { body, onFindVideoElems } = this.props;
    if (!body) {
      return undefined;
    }
    switch (body.type) {
      case BodyType.MINT_BASIC_INCOME:
        return <IconContentBody iconName="parachute-box" />;
      case BodyType.TRUST_MEMBER:
        return <IconContentBody iconName="handshake" />;
      case BodyType.TEXT:
        return <Text>{body.text}</Text>;
      case BodyType.MEDIA:
        return (
          <MediaContentBody
            media={body.media}
            onFindVideoElems={onFindVideoElems}
          />
        );
      default:
        console.error("Unexpected body type:", JSON.stringify(body));
        return undefined;
    }
  };

  render() {
    const body = this.renderBody();
    return body === undefined ? (
      <React.Fragment />
    ) : (
      <View style={styles.contentBody}>{body}</View>
    );
  }
}

class ActivityContent extends React.Component<{
  content: ActivityContentData;
  onFindVideoElems: (elems: VideoWithPlaceholderView[]) => void;
}> {
  ownVideoElems: VideoWithPlaceholderView[] = [];

  public render() {
    const { actor, description, body, nextInChain } = this.props.content;
    return (
      <View>
        <View style={styles.actorRow}>
          <MemberThumbnail
            style={styles.actorThumbnail}
            diameter={leftColumnWidth}
            member={actor}
          />
          {/*
            * Everything in the description must ultimately be Text elements, or
            * else React Native doesn't support it. This is done to ensure text
            * flows correctly in descriptions.
            */}
          <Text style={styles.description}>
            <MemberName member={actor} />
            {description && <MixedText content={description} />}
          </Text>
        </View>
        {body && (
          <View style={styles.contentBodyRow}>
            {/* TODO: render chain direction */}
            <View
              style={[
                styles.chainIndicator,
                ...(nextInChain ? [] : [styles.invisible])
              ]}
            >
              {nextInChain &&
                [
                  ActivityDirection.Bidirectional
                  // ActivityDirection.Backward
                ].includes(nextInChain.direction) && (
                  <ArrowHead
                    direction={ArrowHeadDirection.Up}
                    width={12}
                    color={palette.veryLightGray}
                  />
                )}
              <View style={styles.chainIndicatorLine} />
              {nextInChain &&
                [
                  ActivityDirection.Bidirectional,
                  ActivityDirection.Forward
                ].includes(nextInChain.direction) && (
                  <ArrowHead
                    direction={ArrowHeadDirection.Down}
                    width={12}
                    color={palette.veryLightGray}
                  />
                )}
            </View>
            <ActivityContentBody
              body={body}
              onFindVideoElems={elems =>
                this.props.onFindVideoElems([...this.ownVideoElems, ...elems])
              }
            />
          </View>
        )}
        {nextInChain && (
          <ActivityContent
            content={nextInChain.content}
            onFindVideoElems={elems =>
              this.props.onFindVideoElems([...this.ownVideoElems, ...elems])
            }
          />
        )}
      </View>
    );
  }
}

export class ActivityView extends React.Component<
  Props & NavigationInjectedProps,
  {}
> {
  videoElems?: VideoWithPlaceholderView[];

  /**
   * Reset video playback state, stop it
   */
  public resetVideo = () => {
    if (this.videoElems) {
      for (const elem of this.videoElems) {
        elem.reset();
      }
    }
  };

  render() {
    const { content, callToAction, timestamp } = this.props.activity;
    return (
      <View style={styles.activity}>
        <ActivityContent
          content={content}
          onFindVideoElems={elems => {
            this.videoElems = elems;
          }}
        />
        {callToAction && <CallToAction callToAction={callToAction} />}
        <View style={metadataRowStyle}>
          <Text style={styles.timestamp}>
            {formatRelative(timestamp, new Date()).toUpperCase()}
          </Text>
        </View>
      </View>
    );
  }
}

const leftColumnWidth = 50;
const activitySpacing = 30;
const sectionSpacing = 10;

const activityStyle: ViewStyle = {
  marginTop: activitySpacing - sectionSpacing,
  paddingHorizontal: 20,
  display: "flex",
  flexDirection: "column"
};

const contentSectionStyle: ViewStyle = {
  marginTop: sectionSpacing
};

const metadataRowStyle: ViewStyle = {
  ...contentSectionStyle
};

const timestampStyle: TextStyle = {
  color: colors.secondaryText,
  ...fontSizes.small
};

const actorRowStyle: ViewStyle = {
  ...contentSectionStyle,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  overflow: "hidden"
};

const actorThumbnailStyle: ViewStyle = {
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: leftColumnWidth,
  marginRight: 10
};

const contentBodyRowStyle: ViewStyle = {
  ...contentSectionStyle,
  display: "flex",
  flexDirection: "row",
  alignItems: "center"
};

const invisibleStyle: ViewStyle = {
  opacity: 0
};

const chainIndicatorWidth = 3;
const chainIndicatorStyle: ViewStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  height: "100%",
  flexGrow: 0
};

const chainIndicatorLineStyle: ViewStyle = {
  backgroundColor: palette.veryLightGray,
  width: chainIndicatorWidth,
  marginHorizontal: (leftColumnWidth - chainIndicatorWidth) / 2,
  minHeight: 50,
  flexGrow: 1
};

const descriptionStyle: TextStyle = {
  flexShrink: 1
};

const contentBodyStyle: ViewStyle = {
  flexShrink: 1,
  flexGrow: 1
};

const iconBodyStyle: TextStyle = {
  fontSize: 80,
  color: palette.mediumGray,
  textAlign: "center"
};

// TODO: calculate proper dimensions dynamically, so that different screen sizes
// render properly
const mediaBodyStyle: ViewStyle = {
  height: 300,
  width: 300
};

const styles = StyleSheet.create({
  activity: activityStyle,
  metadataRow: metadataRowStyle,
  timestamp: timestampStyle,
  description: descriptionStyle,
  actorRow: actorRowStyle,
  actorThumbnail: actorThumbnailStyle,
  contentBodyRow: contentBodyRowStyle,
  contentBody: contentBodyStyle,
  mediaBody: mediaBodyStyle,
  iconBody: iconBodyStyle,
  invisible: invisibleStyle,
  chainIndicator: chainIndicatorStyle,
  chainIndicatorLine: chainIndicatorLineStyle
});

export const Activity = withNavigation<Props>(ActivityView);
