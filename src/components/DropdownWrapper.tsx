/**
 * Handles displaying Dropdown notifications.
 */

import * as React from "react";
import { MapStateToProps, connect } from "react-redux";
import DropdownAlert from "react-native-dropdownalert";

import { RahaState } from "../store";
import { View } from "react-native";
import { dismissDropdownMessage } from "../store/actions/dropdown";
import { DropdownMessage } from "../store/reducers/dropdown";

const AUTOMATICALLY_CLOSE_DROPDOWN_AFTER = 6000; // milliseconds

interface OwnProps {
  children: React.ReactNode;
}
interface ReduxStateProps {
  latestMessage?: DropdownMessage;
}
interface DispatchProps {
  dismissDropdownMessage: (id: string) => void;
}

type Props = OwnProps & ReduxStateProps & DispatchProps;

interface State {
  displayedMessageId?: string;
}

class DropdownWrapperComponent extends React.Component<Props, State> {
  dropdown: any;

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  _displayMessage() {
    const { latestMessage } = this.props;
    if (this.dropdown && latestMessage && !this.state.displayedMessageId) {
      const { id, type, title, message } = latestMessage;
      this.dropdown.alertWithType(type, title, message);
      this.setState({ displayedMessageId: id });
    }
  }

  componentDidMount() {
    this._displayMessage();
  }

  componentDidUpdate() {
    this._displayMessage();
  }

  onClose = () => {
    if (this.state.displayedMessageId) {
      this.props.dismissDropdownMessage(this.state.displayedMessageId);
    }
    this.setState({
      displayedMessageId: undefined
    });
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.props.children}
        <DropdownAlert
          ref={(ref: any) => {
            this.dropdown = ref;
          }}
          onClose={this.onClose}
          closeInterval={AUTOMATICALLY_CLOSE_DROPDOWN_AFTER}
        />
      </View>
    );
  }
}

const mapStateToProps: MapStateToProps<
  ReduxStateProps,
  OwnProps,
  RahaState
> = state => {
  return {
    latestMessage: state.dropdown.messages.last()
  };
};

export const DropdownWrapper = connect(
  mapStateToProps,
  { dismissDropdownMessage }
)(DropdownWrapperComponent);
