import { shouldBehaveLikeAccessControl, shouldSupportsInterface } from "@gemunion/contracts-mocha";
import { shouldBehaveLikeBlackList } from "@gemunion/contracts-access-list";
import { DEFAULT_ADMIN_ROLE, InterfaceId, MINTER_ROLE } from "@gemunion/contracts-constants";
import { shouldBehaveLikeERC721Metadata } from "@gemunion/contracts-erc721-enumerable";

import { shouldMintCommon } from "./shared/mintCommon";
import { shouldBehaveLikeERC721Simple } from "./shared/simple";
import { deployERC721 } from "./shared/fixtures";
import { shouldMintRandom } from "./shared/random/mintRandom";
import { shouldBehaveLikeERC721Usable } from "./shared/user";

describe("BUUR", function () {
  const factory = () => deployERC721("ERC721Random");

  shouldBehaveLikeAccessControl(factory)(DEFAULT_ADMIN_ROLE, MINTER_ROLE);
  shouldBehaveLikeBlackList(factory);
  shouldBehaveLikeERC721Metadata(factory);

  shouldBehaveLikeERC721Simple(factory);
  shouldBehaveLikeERC721Usable(factory);
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
