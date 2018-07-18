import React from "react";

const constants = (constants = {
  Aspect: {},
  BarCodeType: {},
  Type: {},
  CaptureMode: {},
  CaptureTarget: {},
  CaptureQuality: {},
  Orientation: {},
  FlashMode: {},
  TorchMode: {}
});

export class RNCamera extends React.Component {
  static Constants = constants;
  render() {
    return null;
  }
}

export default RNCamera;
export const CameraType = {};
