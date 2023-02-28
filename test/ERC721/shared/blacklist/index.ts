import { Contract } from "ethers";

import { shouldBehaveLikeERC721BlacklistBase } from "./base";
import { shouldBehaveLikeERC721BlacklistCommon } from "./common";
import { shouldBehaveLikeERC721BlacklistRandom } from "./random";

export function shouldBehaveLikeERC721Blacklist(factory: () => Promise<Contract>) {
  shouldBehaveLikeERC721BlacklistBase(factory);
  shouldBehaveLikeERC721BlacklistCommon(factory);
  shouldBehaveLikeERC721BlacklistRandom(factory);
}
