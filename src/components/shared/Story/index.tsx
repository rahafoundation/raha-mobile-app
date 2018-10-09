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
import {
  Story as StoryModel,
  CallToAction as CallToActionData,
  CallToActionPiece,
  CallToActionDataType,
  MediaBody,
  StoryContent as StoryContentData,
  BodyType,
  NextInChain,
  ChainDirection
} from "../../../store/selectors/stories/types";
import { MapStateToProps, connect } from "react-redux";
import { RahaState } from "../../../store";
import { getLoggedInMember } from "../../../store/selectors/authentication";

/**
 * TODO: test this for proper output
 */
const CallToAction: React.StatelessComponent<{
  member: Member;
  callToAction: CallToActionData;
}> = ({ member, callToAction }) => {
  return (
    <View>
      <MemberThumbnail style={styles.actorThumbnail} member={member} />
      {callToAction.map((piece, idx) => {
        switch (piece.type) {
          case CallToActionDataType.TEXT:
            return <MixedText key={idx} content={piece.data} />;
          case CallToActionDataType.LINK:
            return (
              <TextLink key={idx} destination={piece.data.destination}>
                {piece.data.text}
              </TextLink>
            );
          default:
            console.error(
              `Unexpected: invalid data type in piece of CallToAction. Piece:`,
              JSON.stringify(piece, null, 2)
            );
            return <React.Fragment key={idx} />;
        }
      })}
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
  body: StoryContentData["body"];
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
          ChainDirection.Bidirectional
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
        [ChainDirection.Bidirectional, ChainDirection.Forward].includes(
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
      {insertComma && <Text>,</Text>}
      {insertAnd && (
        <Text>
          {!insertComma && " "}
          and
        </Text>
      )}{" "}
    </React.Fragment>
  );
}

class ActivityContent extends React.Component<{
  content: StoryContentData;
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
                {numActors > 4 ? "s" : " person"}{" "}
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
                content={body.nextInChain.nextStoryContent}
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

interface StateProps {
  loggedInMember: Member | undefined;
}

interface OwnProps {
  story: StoryModel;
  showCallsToAction?: boolean;
}

type Props = OwnProps & StateProps;

export class StoryView extends React.Component<
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
    const { story, loggedInMember } = this.props;
    const showCallsToAction =
      this.props.showCallsToAction !== undefined
        ? this.props.showCallsToAction
        : true;
    const { content, callsToAction, timestamp } = story;
    return (
      <View style={styles.activity}>
        <ActivityContent
          content={content}
          onFindVideoElems={elems => {
            this.videoElems = elems;
          }}
        />
        {showCallsToAction &&
          callsToAction &&
          loggedInMember &&
          callsToAction.map((callToAction, idx) => (
            <CallToAction
              key={idx}
              member={loggedInMember}
              callToAction={callToAction}
            />
          ))}
        <View style={styles.metadataRow}>
          <Text style={styles.timestamp}>
            {formatRelative(timestamp, new Date()).toUpperCase()}
          </Text>
        </View>
      </View>
    );
  }
}

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  RahaState
> = state => {
  return {
    loggedInMember: getLoggedInMember(state)
  };
};

export const Story = connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(withNavigation<Props>(StoryView));
