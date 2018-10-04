const appMock = {
  messaging: jest.fn(() => {
    return {
      hasPermission: jest.fn(() => Promise.resolve(true)),
      subscribeToTopic: jest.fn(),
      unsubscribeFromTopic: jest.fn(),
      requestPermission: jest.fn(() => Promise.resolve(true)),
      getToken: jest.fn(() => Promise.resolve("myMockToken"))
    };
  }),
  analytics: jest.fn(() => {
    return {
      logEvent: (event, params) => {
        console.log("Firebase analytics log:", event, params);
      }
    };
  }),
  auth: jest.fn(() => {
    return {};
  }),
  storage: jest.fn(() => {
    return {};
  })
};

module.exports = {
  default: {
    app: jest.fn(() => appMock)
  }
};
