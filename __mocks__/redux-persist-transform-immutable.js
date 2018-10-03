// hack to get import behavior on node and react-native to match

const transformImmutable = require("redux-persist-transform-immutable");

module.exports = {
  default: transformImmutable
};
