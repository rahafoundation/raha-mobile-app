import * as React from "react";
import {
  BackHandler,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  TouchableOpacity
} from "react-native";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";

import {
  NavigationScreenProp,
  NavigationEventSubscription
} from "react-navigation";
import CountryPicker, {
  getAllCountries,
  CountryPickerProps,
  Country
} from "react-native-country-picker-modal";
import DeviceInfo from "react-native-device-info";

import {
  initiatePhoneLogIn,
  confirmPhoneLogIn,
  signOut,
  cancelPhoneLogIn
} from "../../store/actions/authentication";
import { RahaState, RahaThunkDispatch } from "../../store";
import { RouteName } from "../shared/Navigation";
import { getLoggedInFirebaseUserId } from "../../store/selectors/authentication";
import { getMemberById } from "../../store/selectors/members";
import { Button, Container, Text } from "../shared/elements";
import { PhoneLogInStatus } from "../../store/reducers/authentication";
import { FormLabel } from "react-native-elements";
import {
  PhoneNumberUtil,
  PhoneNumberFormat,
  AsYouTypeFormatter
} from "google-libphonenumber";
import { Map } from "immutable";

const phoneUtil = PhoneNumberUtil.getInstance();
const countries = getAllCountries().reduce<Map<string, Country>>(
  (memo, country) => memo.set(country.cca2, country),
  Map<string, Country>()
);

type OwnProps = {
  navigation: NavigationScreenProp<{}>;
};

type StateProps = {
  isLoggedIn: boolean;
  hasAccount: boolean;
  phoneLogInStatus?: RahaState["authentication"]["phoneLogInStatus"];
};

interface DispatchProps {
  cancelPhoneLogIn: () => void;
  initiatePhoneLogIn: (phoneNumber: string) => void;
  confirmPhoneLogIn: (confirmationCode: string) => void;
  signOut: () => void;
}

type LogInProps = OwnProps & StateProps & DispatchProps;

interface LogInState {
  phoneNumber?: string;
  phoneNumberSentTime?: Date;
}

function confirmationCodeIsValid(code?: string) {
  return code && code.match(/^[0-9]{6}$/);
}

interface PhoneNumberFormProps {
  waitingForCode: boolean;
  onSubmit: (phoneNumber: string) => void;
  signOut: () => void;
}

interface PhoneNumberFormState {
  phoneNumber: string;
  country: Country;
}

function phoneNumberIsValid(number: string, country: Country) {
  try {
    const phoneNumberData = phoneUtil.parseAndKeepRawInput(
      number,
      country.cca2
    );
    return phoneUtil.isValidNumber(phoneNumberData);
  } catch (err) {
    return false;
  }
}

class PhoneNumberForm extends React.Component<
  PhoneNumberFormProps,
  PhoneNumberFormState
> {
  state: PhoneNumberFormState = {
    phoneNumber: "",
    country: countries.get(
      DeviceInfo.getDeviceCountry(),
      countries.get("US")
    ) as Country // default the country to USA if can't find device's
  };
  countryPicker?: CountryPicker | null;

  private _handlePhoneInput: TextInputProps["onChange"] = event => {
    const text = event.nativeEvent.text;
    if (phoneNumberIsValid(text, this.state.country)) {
      const phoneNumberData = phoneUtil.parse(text, this.state.country.cca2);
      const formatted = phoneUtil.format(
        phoneNumberData,
        PhoneNumberFormat.NATIONAL
      );
      this.setState({ phoneNumber: formatted });
      return;
    }
    const formatter = new AsYouTypeFormatter(this.state.country.cca2);
    const formattedNumber = text.split("").reduce((_, char) => {
      return formatter.inputDigit(char);
    }, "");
    this.setState({ phoneNumber: formattedNumber });
  };

  _handleCountryInput: CountryPickerProps["onChange"] = country => {
    this.setState({ country });
  };

  _handleSubmit = () => {
    if (!phoneNumberIsValid(this.state.phoneNumber, this.state.country)) {
      return;
    }
    const phoneNumberData = phoneUtil.parse(
      this.state.phoneNumber,
      this.state.country.cca2
    );
    const e164Number = phoneUtil.format(
      phoneNumberData,
      PhoneNumberFormat.E164
    );
    this.props.onSubmit(e164Number);
  };

  render() {
    return (
      <React.Fragment>
        <FormLabel>Phone number</FormLabel>
        <View style={styles.phoneInput}>
          <CountryPicker
            ref={elem => {
              this.countryPicker = elem;
            }}
            cca2={this.state.country.cca2}
            showCallingCode
            onChange={this._handleCountryInput}
            filterable
          />
          <TouchableOpacity
            onPress={() => {
              if (this.countryPicker) {
                this.countryPicker.openModal();
              }
            }}
          >
            <Text style={styles.callingCode}>
              +{this.state.country.callingCode}
            </Text>
          </TouchableOpacity>
          <TextInput
            style={styles.phoneNumberInput}
            keyboardType="phone-pad"
            onChange={this._handlePhoneInput}
            placeholder={"Phone number"}
            value={this.state.phoneNumber}
            onSubmitEditing={this._handleSubmit}
          />
        </View>
        <Button
          title={
            this.props.waitingForCode ? "Requesting..." : "Request SMS Code"
          }
          onPress={this._handleSubmit}
          disabled={
            this.props.waitingForCode ||
            !phoneNumberIsValid(this.state.phoneNumber, this.state.country)
          }
        />
        {/* TODO: remove */}
        <Button title="Clear" onPress={this.props.signOut} />
      </React.Fragment>
    );
  }
}

interface ConfirmationCodeFormProps {
  onSubmit: (phoneNumber: string) => void;
  onCancel: () => void;
  onTriggerResend: () => void;
  signOut: () => void;
  waitingForConfirmation: boolean;
  sentTime: Date;
}

interface ConfirmationCodeFormState {
  confirmationCode: string;
  timeLeft: number;
  timerInterval: any;
}

const RESEND_DELAY_SECONDS = 30;
class ConfirmationCodeForm extends React.Component<
  ConfirmationCodeFormProps,
  ConfirmationCodeFormState
> {
  constructor(props: ConfirmationCodeFormProps) {
    super(props);
    this.state = {
      confirmationCode: "",
      timeLeft: this._calculateTimeLeft(),
      timerInterval: setInterval(this._calculateTimeLeft, 1000)
    };
  }

  _handleBackPress = () => {
    this.props.onCancel();
    return true;
  };

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this._handleBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this._handleBackPress);
  }

  componentDidUpdate(prevProps: ConfirmationCodeFormProps) {
    // reset the countdown if the verification code was resent
    if (this.props.sentTime !== prevProps.sentTime) {
      this.setState({
        timeLeft: this._calculateTimeLeft(),
        timerInterval: setInterval(this._calculateTimeLeft, 1000)
      });
    }
  }

  _calculateTimeLeft = () => {
    // this is in seconds
    const timeElapsed = Math.floor(
      (Date.now() - this.props.sentTime.getTime()) / 1000
    );
    const timeLeft = Math.max(RESEND_DELAY_SECONDS - timeElapsed, 0);
    if (timeLeft === 0) {
      clearInterval(this.state.timerInterval);
      this.setState({ timerInterval: undefined });
    }
    this.setState({
      timeLeft
    });
    return timeLeft;
  };
  _handleSubmit = () => {
    if (!confirmationCodeIsValid(this.state.confirmationCode)) {
      return;
    }
    this.props.onSubmit(this.state.confirmationCode);
  };

  render() {
    return (
      <React.Fragment>
        <FormLabel>Verification code from SMS</FormLabel>
        <View style={styles.confirmationInput}>
          <TextInput
            maxLength={6}
            style={styles.confirmationNumberInput}
            onChange={event =>
              this.setState({ confirmationCode: event.nativeEvent.text })
            }
            keyboardType="numeric"
            placeholder={"123456"}
            onSubmitEditing={this._handleSubmit}
          />
          <Button
            style={styles.resendButton}
            title={
              this.state.timeLeft === 0
                ? "Resend code"
                : `Resend in ${this.state.timeLeft}s`
            }
            onPress={this.props.onTriggerResend}
            disabled={this.state.timeLeft !== 0}
          />
        </View>
        <Button
          title="Cancel"
          onPress={this.props.onCancel}
          disabled={this.props.waitingForConfirmation}
        />
        <Button
          title={
            this.props.waitingForConfirmation
              ? "Submitting..."
              : "Submit verification code"
          }
          onPress={this._handleSubmit}
          disabled={
            this.props.waitingForConfirmation ||
            !confirmationCodeIsValid(this.state.confirmationCode)
          }
        />
        {/* TODO: remove */}
        <Button title="Clear" onPress={this.props.signOut} />
      </React.Fragment>
    );
  }
}

class LogInView extends React.Component<LogInProps, LogInState> {
  componentFocusedListener?: NavigationEventSubscription;
  state: LogInState = {};

  componentDidMount() {
    // If this LoginView becomes focused, the user was determined to be logged out. Verify that the
    // user is logged out and if they are not, force sign them out.
    this.componentFocusedListener = this.props.navigation.addListener(
      "didFocus",
      this.verifySignedOut
    );
  }

  componentWillUnmount() {
    if (this.componentFocusedListener) {
      this.componentFocusedListener.remove();
    }
  }

  verifySignedOut = () => {
    if (this.props.isLoggedIn) {
      this.props.signOut();
    }
  };

  componentDidUpdate(prevProps: LogInProps) {
    // set the sent time for the resend timer, which occurs when you get to
    // WAITING_FOR_CONFIRMATION_INPUT state (see the initiatePhoneLogIn action)
    if (
      this.props.phoneLogInStatus &&
      prevProps.phoneLogInStatus !== this.props.phoneLogInStatus &&
      this.props.phoneLogInStatus.status ===
        PhoneLogInStatus.WAITING_FOR_CONFIRMATION_INPUT
    ) {
      this.setState({ phoneNumberSentTime: new Date() });
    }

    // redirect on firebase auth events
    if (!this.props.isLoggedIn) {
      return;
    }
    if (this.props.hasAccount) {
      this.props.navigation.navigate(RouteName.Home);
      return;
    }
    this.props.navigation.navigate(RouteName.Onboarding);
  }

  _handleInitiatePhoneLogIn = (number: string) => {
    this.props.initiatePhoneLogIn(number);
    this.setState({ phoneNumber: number });
  };

  _resetPhoneLogIn = () => {
    this.setState({
      phoneNumber: undefined,
      phoneNumberSentTime: undefined
    });
    this.props.cancelPhoneLogIn();
  };

  render() {
    const status = this.props.phoneLogInStatus
      ? this.props.phoneLogInStatus.status
      : undefined;
    if (
      !this.state.phoneNumberSentTime &&
      (!status ||
        status === PhoneLogInStatus.SENDING_PHONE_NUMBER ||
        status === PhoneLogInStatus.SENDING_PHONE_NUMBER_FAILED)
    ) {
      return (
        <Container>
          {/* TODO: show errors */}
          <PhoneNumberForm
            waitingForCode={status === PhoneLogInStatus.SENDING_PHONE_NUMBER}
            onSubmit={number => this._handleInitiatePhoneLogIn(number)}
            // TODO: remove
            signOut={this.props.signOut}
          />
        </Container>
      );
    }

    return (
      <Container>
        {/* TODO: show errors */}
        <ConfirmationCodeForm
          onCancel={this._resetPhoneLogIn}
          onSubmit={this.props.confirmPhoneLogIn}
          onTriggerResend={() => {
            if (!this.state.phoneNumber) {
              console.error(
                "Phone number was expected to be present, defensively resetting state"
              );
              this._resetPhoneLogIn();
              return;
            }
            this._handleInitiatePhoneLogIn(this.state.phoneNumber);
          }}
          // defensively set sentTime to the current time if it wasn't set,
          // which may briefly happen between state updates
          sentTime={this.state.phoneNumberSentTime || new Date()}
          waitingForConfirmation={
            !!this.props.phoneLogInStatus &&
            this.props.phoneLogInStatus.status ===
              PhoneLogInStatus.SENDING_CONFIRMATION
          }
          // TODO: remove
          signOut={this.props.signOut}
        />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  phoneInput: {
    display: "flex",
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 25
  },
  callingCode: {
    marginLeft: 15,
    fontSize: 20
  },
  phoneNumberInput: {
    flex: 1,
    fontSize: 20,
    marginLeft: 15
  },
  confirmationInput: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 25
  },
  confirmationNumberInput: {
    flexGrow: 1,
    fontSize: 20
  },
  resendButton: {
    marginLeft: 15
  }
});

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  RahaState
> = state => {
  const isLoggedIn =
    state.authentication.isLoaded && state.authentication.isLoggedIn;
  const loggedInMemberId = getLoggedInFirebaseUserId(state);
  const hasAccount =
    isLoggedIn &&
    !!loggedInMemberId &&
    getMemberById(state, loggedInMemberId) !== undefined;
  return {
    isLoggedIn,
    hasAccount,
    phoneLogInStatus: state.authentication.phoneLogInStatus
  };
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (
  dispatch: RahaThunkDispatch
) => ({
  cancelPhoneLogIn: () => dispatch(cancelPhoneLogIn()),
  initiatePhoneLogIn: (phoneNumber: string) =>
    dispatch(initiatePhoneLogIn(phoneNumber)),
  confirmPhoneLogIn: (confirmationCode: string) =>
    dispatch(confirmPhoneLogIn(confirmationCode)),
  signOut: () => dispatch(signOut())
});

export const LogIn = connect(
  mapStateToProps,
  mapDispatchToProps
)(LogInView);
