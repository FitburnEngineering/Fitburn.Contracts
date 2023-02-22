import { Contract } from "ethers";

import { shouldSetBaseURI } from "./setBaseURI";
import { shouldTokenURI } from "./tokenURI";

export function shouldBaseUrl(factory: () => Promise<Contract>) {
  shouldSetBaseURI(factory);
  shouldTokenURI(factory);
}
