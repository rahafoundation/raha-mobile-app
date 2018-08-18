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
  ActivityDirection
} from "../../../store/selectors/activities/types";
import { MemberName } from "../MemberName";
import { MemberThumbnail } from "../MemberThumbnail";
import { Currency } from "../Currency";
import { TextLink } from "../elements/TextLink";
import { ArrowHeadDirection, ArrowHead } from "./ArrowHead";
import { fontSizes } from "../../../helpers/fonts";

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

class ActivityContentBody extends React.Component<{
  body: ActivityContentData["body"];
  onFindVideoElems: (elems: VideoWithPlaceholderView[]) => void;
}> {
  videoElems: { [k: number]: VideoWithPlaceholderView } = {};

  render() {
    const { body } = this.props;
    if (!body) {
      return <React.Fragment />;
    }

    if ("text" in body) {
      return (
        <View style={styles.contentBody}>
          <Text>{body.text}</Text>
        </View>
      );
    }

    if ("iconName" in body) {
      return (
        <View style={styles.contentBody}>
          <Icon name={body.iconName} style={styles.iconBody} />
        </View>
      );
    }

    return (
      <View style={styles.contentBody}>
        {body.map((media, idx) => {
          if ("videoUri" in media) {
            return (
              <VideoWithPlaceholder
                onRef={elem => {
                  if (!elem) return;
                  this.videoElems[idx] = elem as VideoWithPlaceholderView;
                  this.props.onFindVideoElems(Object.values(this.videoElems));
                }}
                style={styles.mediaBody}
                key={idx}
                uri={media.videoUri}
              />
            );
          }
          return <Image source={{ uri: media.imageUri }} />;
        })}
      </View>
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
            {description &&
              description
                // Render each piece of the description
                .map((piece, idx) => {
                  const key = `content-${idx}`;
                  if (typeof piece === "string") {
                    return <Text key={key}>{piece}</Text>;
                  }
                  if ("currencyType" in piece) {
                    return <Currency key={key} currencyValue={piece} />;
                  }
                  console.error(
                    `Unexpected value in ActivityContent description: ${piece}, aborting.`
                  );
                  return undefined;
                })
                // remove undefined pieces (i.e. errors)
                .filter(x => !!x)
                // Put spaces between each component
                .reduce(
                  (memo, nextComponent, idx) => [
                    ...memo,
                    <Text key={`spacing-${idx}`}> </Text>,
                    nextComponent
                  ],
                  [] as React.ReactNode[]
                )}
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
  // borderBottomColor: palette.veryLightGray,
  // borderBottomWidth: 1
};

const contentSectionStyle: ViewStyle = {
  marginTop: sectionSpacing
};

const metadataRowStyle: ViewStyle = {
  ...contentSectionStyle
  // borderTopColor: palette.veryLightGray,
  // borderTopWidth: 1,
  // paddingBottom: 10,
  // marginLeft: leftColumnWidth / 2
};

const timestampStyle: TextStyle = {
  color: colors.secondaryText,
  ...fontSizes.small
  // textAlign: "right"
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
