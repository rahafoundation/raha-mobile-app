import * as React from "react";

import { OperationType } from "@raha/api/dist/shared/models/Operation";

import { ActivityFeed } from "../shared/ActivityFeed";
import { Container } from "../shared/elements";

export const Home: React.StatelessComponent = () => {
  return (
    <Container>
      <ActivityFeed
        filter={operation => operation.op_code !== OperationType.MINT}
      />
    </Container>
  );
};
