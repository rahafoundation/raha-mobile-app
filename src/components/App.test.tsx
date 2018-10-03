import * as React from "react";
import { App } from "./App";

import * as renderer from "react-test-renderer";

jest.mock("@raha/api/dist/callApi", () => ({
  callApi: (...args: any[]) => {
    console.info("Called API endpoint with args:", args);
    return Promise.resolve({
      body: []
    });
  }
}));

it("renders without crashing", () => {
  const rendered = renderer.create(<App />).toJSON();
  expect(rendered).toBeTruthy();
});
