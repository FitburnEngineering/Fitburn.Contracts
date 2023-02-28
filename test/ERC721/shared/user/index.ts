import { Contract } from "ethers";

import { shouldSetUser } from "./setUser";
import { shouldUserOf } from "./userOf";
import { shouldUserExprires } from "./userExpires";

export function shouldBehaveLikeERC721Rentable(factory: () => Promise<Contract>) {
  shouldSetUser(factory);
  shouldUserOf(factory);
  shouldUserExprires(factory);
}
