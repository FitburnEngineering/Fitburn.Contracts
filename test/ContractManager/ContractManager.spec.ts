import { shouldBehaveLikeAccessControl } from "@gemunion/contracts-mocha";

import { DEFAULT_ADMIN_ROLE } from "@gemunion/contracts-constants";

import { deployContractManager } from "./fixture";

describe("ContractManager", function () {
  const factory = () => deployContractManager(this.title);

  shouldBehaveLikeAccessControl(factory)(DEFAULT_ADMIN_ROLE);
});
