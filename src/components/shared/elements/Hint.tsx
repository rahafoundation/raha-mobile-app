import * as React from "react";
import Modal from "react-native-modal";
import {
  TouchableOpacity,
  View,
  ScrollView,
  StyleSheet,
  TextStyle,
  ViewStyle
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { Text } from "./Text";
import { colors } from "../../../helpers/colors";
import { fonts } from "../../../helpers/fonts";
import { Button } from "./Button";

export enum IconType {
  // Default; "i" icon when we're providing the user with detailed/additional information
  INFO = "info-circle",

  // "?" icon when it directly clarifies a user question
  QUESTION = "question-circle"
}

type HintProps = {
  type?: IconType;
  text: string;
  style?: ViewStyle;
};

type HintState = {
  isModalVisible: boolean;
};

export class Hint extends React.Component<HintProps, HintState> {
  constructor(props: HintProps) {
    super(props);
    this.state = { isModalVisible: false };
  }

  _toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  };

  render() {
    return (
      <React.Fragment>
        <Modal
          isVisible={this.state.isModalVisible}
          onBackdropPress={this._toggleModal}
          onBackButtonPress={this._toggleModal}
        >
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={{ margin: 8 }}>{this.props.text}</Text>
              <Button title="Close" onPress={this._toggleModal} />
            </ScrollView>
          </View>
        </Modal>
        <TouchableOpacity style={styles.hintIcon} onPress={this._toggleModal}>
          <Icon
            name={this.props.type ? this.props.type : IconType.INFO}
            style={this.props.style}
            size={16}
            color={colors.modalIcon}
          />
        </TouchableOpacity>
      </React.Fragment>
    );
  }
}

const hintIcon: TextStyle = {
  marginRight: 8
};

const modalContent: ViewStyle = {
  padding: 22,
  backgroundColor: colors.modalBackground,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 4
};

const modalCloseButton: ViewStyle = {
  marginTop: 8
};

const text: TextStyle = {
  flexGrow: 1,
  ...fonts.Lato.Normal
};

const styles = StyleSheet.create({
  hintIcon,
  modalContent,
  modalCloseButton,
  text
});
