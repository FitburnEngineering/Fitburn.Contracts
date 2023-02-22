import { Contract } from "ethers";

import { shouldGetBalanceOf } from "./balanceOf";
import { shouldTransferFrom } from "./transferFrom";
import { shouldApprove } from "./approve";
import { shouldGetOwnerOf } from "./ownerOf";
import { shouldSafeTransferFrom } from "./safeTransferFrom";
import { shouldSetApprovalForAll } from "./setApprovalForAll";
import { shouldMint } from "./mint";
import { shouldSafeMint } from "./safeMint";

export function shouldBehaveLikeERC721(factory: () => Promise<Contract>) {
  shouldApprove(factory);
  shouldGetBalanceOf(factory);
  shouldGetOwnerOf(factory);
  shouldSetApprovalForAll(factory);
  shouldTransferFrom(factory);
  shouldSafeTransferFrom(factory);

  shouldMint(factory);
  shouldSafeMint(factory);
}
