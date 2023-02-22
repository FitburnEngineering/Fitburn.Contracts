import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners();

  const link = await ethers.getContractFactory("LinkToken");
  const linkInstance = await link.deploy();
  console.info(`LINK_ADDR=${linkInstance.address}`);
  const vrfFactory = await ethers.getContractFactory("VRFCoordinatorMock");
  const vrfInstance = await vrfFactory.deploy(linkInstance.address);
  console.info(`VRF_ADDR=${vrfInstance.address}`);
  // await blockAwait(ethers.provider);
  const linkBalanceOwner = await linkInstance.balanceOf(owner.address);
  console.info("linkBalanceOwner", linkBalanceOwner);

  // Next, add LINK and VRF addresses to MOCK test contract:
  // contracts/binance/contracts/MOCKS/ChainLink/ERC721ChainLinkBesu.sol
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
