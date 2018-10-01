/**
 * General purpose component that displays all types of activities. Specific
 * Activities like GiveOperationActivity ultimately output this component.
 */
import * as React from "react";
import { formatRelative } from "date-fns";
import { View, Image } from "react-native";
import { withNavigation, NavigationInjectedProps } from "react-navigation";
import Icon from "react-native-vector-icons/FontAwesome5";

import { Text } from "../elements";
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
  MediaBody,
  NextInChain
} from "../../../store/selectors/activities/types";
import { MemberName } from "../MemberName";
import { MemberThumbnail } from "../MemberThumbnail";
import { TextLink } from "../elements/TextLink";
import { ArrowHeadDirection, ArrowHead } from "./ArrowHead";
import { MixedText } from "../elements/MixedText";
import { styles, leftColumnWidth, chainIndicatorColor } from "./styles";
import {
  RAHA_BASIC_INCOME_MEMBER,
  Member
} from "../../../store/reducers/members";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";

type Props = {
  activity: ActivityData;
};

/**
 * TODO: test this for proper output
 */
const CallToAction: React.StatelessComponent<{
  callToAction: CallToActionData;
}> = ({ callToAction: { actor, actions } }) => {
  return (
    <View>
      <MemberThumbnail style={styles.actorThumbnail} member={actor} />
      {actions.map(action => (
        <View>
          {/* TODO: don't ad hoc figure out value of piece like this, add explicit differentiator */}
          {/* TODO: Figure out how to unify ActionLink handling with MixedText? */}
          {action.text.map(piece => {
            if (typeof piece === "string" || "currencyType" in piece) {
              return <MixedText content={[piece]} />;
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
            videoUri={item.videoUri}
            placeholderUri={`${item.videoUri}.thumb.jpg`}
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
    switch (body.bodyContent.type) {
      case BodyType.MINT_BASIC_INCOME:
        return <IconContentBody iconName="parachute-box" />;
      case BodyType.TRUST_MEMBER:
        return <IconContentBody iconName="handshake" />;
      case BodyType.TEXT:
        return <Text>{body.bodyContent.text}</Text>;
      case BodyType.MEDIA:
        return (
          <MediaContentBody
            media={body.bodyContent.media}
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

const ChainIndicator: React.StatelessComponent<{
  nextInChain?: NextInChain;
}> = ({ nextInChain }) => {
  return (
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
            color={chainIndicatorColor}
          />
        )}
      <View style={styles.chainIndicatorLine} />
      {nextInChain &&
        [ActivityDirection.Bidirectional, ActivityDirection.Forward].includes(
          nextInChain.direction
        ) && (
          <ArrowHead
            direction={ArrowHeadDirection.Down}
            width={12}
            color={chainIndicatorColor}
          />
        )}
    </View>
  );
};

function renderMemberNameInList({
  actor,
  index,
  numActors
}: {
  actor: Member;
  index: number;
  numActors: number;
}): React.ReactNode {
  const insertComma = numActors > 2 && index < Math.min(numActors, 4) - 2;
  const insertAnd = numActors > 1 && index === Math.min(numActors, 4) - 2;
  return (
    <React.Fragment key={index}>
      <MemberName member={actor} />
      {insertComma && <Text>, </Text>}
      {insertAnd && (
        <Text>
          {!insertComma && " "}
          and{" "}
        </Text>
      )}
    </React.Fragment>
  );
}

class ActivityContent extends React.Component<{
  content: ActivityContentData;
  onFindVideoElems: (elems: VideoWithPlaceholderView[]) => void;
}> {
  ownVideoElems: VideoWithPlaceholderView[] = [];

  public render() {
    const { actors, description, body } = this.props.content;
    const actorsData: typeof RAHA_BASIC_INCOME_MEMBER | Member[] =
      actors === RAHA_BASIC_INCOME_MEMBER
        ? actors
        : actors.valueSeq().toArray();
    const numActors =
      actorsData === RAHA_BASIC_INCOME_MEMBER ? 1 : actorsData.length;
    return (
      <View>
        <View style={styles.actorRow}>
          {/* TODO: don't just represent member by the first actor; support multiple actors. */}
          <MemberThumbnail
            style={styles.actorThumbnail}
            diameter={leftColumnWidth}
            member={
              actorsData === RAHA_BASIC_INCOME_MEMBER
                ? actorsData
                : actorsData[0]
            }
          />
          {/*
            * Everything in the description must ultimately be Text elements, or
            * else React Native doesn't support it. This is done to ensure text
            * flows correctly in descriptions.
            */}
          <Text style={styles.description}>
            {/* 
              * Name at most the first three actors, and just summarize the rest
              */}
            {actorsData === RAHA_BASIC_INCOME_MEMBER ? (
              <MemberName member={actorsData} />
            ) : (
              (actorsData as Member[])
                .slice(0, 3)
                .map((actor, index) =>
                  renderMemberNameInList({ actor, index, numActors })
                )
            )}
            {/* TODO: make this clickable to see the list */}
            {numActors > 3 && (
              <Text>
                {numActors - 3} other
                {numActors > 4 ? "s" : " person"}
              </Text>
            )}
            {description && <MixedText content={description} />}
          </Text>
        </View>
        {body && (
          <React.Fragment>
            <View style={styles.contentBodyRow}>
              <ChainIndicator nextInChain={body.nextInChain} />
              <ActivityContentBody
                body={body}
                onFindVideoElems={elems =>
                  this.props.onFindVideoElems([...this.ownVideoElems, ...elems])
                }
              />
            </View>
            {body.nextInChain && (
              <ActivityContent
                content={body.nextInChain.nextActivityContent}
                onFindVideoElems={elems =>
                  this.props.onFindVideoElems([...this.ownVideoElems, ...elems])
                }
              />
            )}
          </React.Fragment>
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
        <View style={styles.metadataRow}>
          <Text style={styles.timestamp}>
            {formatRelative(timestamp, new Date()).toUpperCase()}
          </Text>
        </View>
      </View>
    );
  }
}

export const Activity = withNavigation<Props>(ActivityView);
