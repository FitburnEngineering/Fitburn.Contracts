import { shouldBehaveLikeAccessControl, shouldSupportsInterface } from "@gemunion/contracts-mocha";
import { shouldBehaveLikeBlackList } from "@gemunion/contracts-access-list";
import { DEFAULT_ADMIN_ROLE, InterfaceId, MINTER_ROLE } from "@gemunion/contracts-constants";
import { shouldBehaveLikeERC721Metadata } from "@gemunion/contracts-erc721-enumerable";

import { shouldMintCommon } from "./shared/mintCommon";
import { shouldBehaveLikeERC721Simple } from "./shared/simple";
import { deployERC721 } from "./shared/fixtures";
import { shouldMintRandom } from "./shared/random/mintRandom";
import { shouldBehaveLikeERC721Rentable } from "./shared/user";
import { shouldBehaveLikeERC721Blacklist } from "./shared/blacklist";

describe("ERC721BlacklistUpgradeableRentableRandom", function () {
  const factory = () => deployERC721("ERC721BlacklistUpgradeableRentableRandom");

  shouldBehaveLikeAccessControl(factory)(DEFAULT_ADMIN_ROLE, MINTER_ROLE);
  shouldBehaveLikeBlackList(factory);

  shouldBehaveLikeERC721Metadata(factory);
  shouldBehaveLikeERC721Blacklist(factory);
  shouldBehaveLikeERC721Simple(factory);
  shouldBehaveLikeERC721Rentable(factory);

  shouldMintCommon(factory);
  shouldMintRandom(factory);

  shouldSupportsInterface(factory)(
    InterfaceId.IERC165,
    InterfaceId.IAccessControl,
    InterfaceId.IERC721,
    InterfaceId.IERC4906,
    InterfaceId.IERC4907,
  );
});
