import * as React from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import { NavigationScreenProp } from "react-navigation";
import CountryPicker, {
  getAllCountries,
  CountryPickerProps,
  Country
} from "react-native-country-picker-modal";
import DeviceInfo from "react-native-device-info";

import {
  initiatePhoneLogIn,
  confirmPhoneLogIn,
  signOut
} from "../../store/actions/authentication";
import { RahaState, RahaThunkDispatch } from "../../store";
import { RouteName } from "../shared/Navigation";
import { getLoggedInFirebaseUserId } from "../../store/selectors/authentication";
import { getMemberById } from "../../store/selectors/members";
import { Button, Container, Text } from "../shared/elements";
import { PhoneLoginStatus } from "../../store/reducers/authentication";
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
  phoneLoginStatus?: RahaState["authentication"]["phoneLoginStatus"];
};

interface DispatchProps {
  initiatePhoneLogIn: (phoneNumber: string) => void;
  confirmPhoneLogIn: (confirmationCode: string) => void;
  signOut: () => void;
}

type LogInProps = OwnProps & StateProps & DispatchProps;

interface LogInState {
  phoneNumber: string;
  confirmationCode: string;
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

  private _handlePhoneInput: TextInputProps["onChange"] = event => {
    const text = event.nativeEvent.text;
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
            cca2={this.state.country.cca2}
            showCallingCode
            onChange={this._handleCountryInput}
            filterable
          />
          <Text style={styles.callingCode}>
            +{this.state.country.callingCode}
          </Text>
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
          title="Request SMS Code"
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
  signOut: () => void;
  waitingForConfirmation: boolean;
}

interface ConfirmationCodeFormState {
  confirmationCode: string;
}

class ConfirmationCodeForm extends React.Component<
  ConfirmationCodeFormProps,
  ConfirmationCodeFormState
> {
  state: ConfirmationCodeFormState = { confirmationCode: "" };

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
        <TextInput
          onChange={event =>
            this.setState({ confirmationCode: event.nativeEvent.text })
          }
          keyboardType="numeric"
          placeholder={"123456"}
          onSubmitEditing={this._handleSubmit}
        />
        <Button
          title="Submit verification code"
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
  componentDidUpdate() {
    if (!this.props.isLoggedIn) {
      return;
    }
    if (this.props.hasAccount) {
      this.props.navigation.navigate(RouteName.Home);
      return;
    }
    this.props.navigation.navigate(RouteName.OnboardingSplash);
  }

  render() {
    const status = this.props.phoneLoginStatus
      ? this.props.phoneLoginStatus.status
      : undefined;
    if (
      !status ||
      status === PhoneLoginStatus.SENDING_PHONE_NUMBER ||
      status === PhoneLoginStatus.SENDING_PHONE_NUMBER_FAILED
    ) {
      return (
        <Container>
          {/* TODO: show errors */}
          <PhoneNumberForm
            waitingForCode={status === PhoneLoginStatus.SENDING_PHONE_NUMBER}
            onSubmit={this.props.initiatePhoneLogIn}
            signOut={this.props.signOut}
          />
        </Container>
      );
    }

    return (
      <Container>
        {/* TODO: show errors */}
        <ConfirmationCodeForm
          onSubmit={this.props.confirmPhoneLogIn}
          signOut={this.props.signOut}
          waitingForConfirmation={
            !!this.props.phoneLoginStatus &&
            this.props.phoneLoginStatus.status ===
              PhoneLoginStatus.SENDING_CONFIRMATION
          }
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
    marginLeft: 15
  },
  phoneNumberInput: {
    flex: 1,
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
    phoneLoginStatus: state.authentication.phoneLoginStatus
  };
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (
  dispatch: RahaThunkDispatch
) => ({
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
