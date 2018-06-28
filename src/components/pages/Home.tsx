import * as React from "react";
import { View } from "react-native";

import { ActivityFeed } from "../shared/ActivityFeed";
import { OperationType } from "../../store/reducers/operations";

import { Container } from "../display/Container";

export const Home: React.StatelessComponent = () => {
  return (
    <Container>
      <ActivityFeed
        filter={operation => operation.op_code !== OperationType.MINT}
      />
    </Container>
  );
};
