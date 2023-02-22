import { Contract } from "ethers";

import { shouldBurn } from "./burn";

export function shouldBehaveLikeERC721Burnable(factory: () => Promise<Contract>) {
  shouldBurn(factory);
}
