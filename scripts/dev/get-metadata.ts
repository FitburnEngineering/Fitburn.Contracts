import { ethers } from "hardhat";

// import { blockAwait } from "@gemunion/utils-eth";
// import { baseTokenURI } from "@gemunion/contracts-constants";

async function main() {
  // const rlNum = 100; // royaltyNumerator
  const [_owner] = await ethers.getSigners();

  // ERC721 contract - upgradeable
  const itemUpgradeableFactory = await ethers.getContractFactory("ERC721Gemunion");
  // const itemUpgradeableInstance = await itemUpgradeableFactory.deploy("ITEMG", "ITEMG", rlNum, baseTokenURI);
  const itemUpgradeableInstance = itemUpgradeableFactory.attach("0xa775fd3eb96956b2284e96298bd12624a9c952d2");
  console.info(`ERC721_G_ADDR=${itemUpgradeableInstance.address.toLowerCase()}`);

  // Setup Contracts
  // await blockAwait(ethers.provider);

  // ERC721 getRecordField Template
  const templateKey = await itemUpgradeableInstance.TEMPLATE_ID();
  // 0xe2db241bb2fe321e8c078a17b0902f9429cee78d5f3486725d73d0356e97c842
  console.info("TEMPLATE_ID key", templateKey);

  // ERC721 getRecordField EARN_UPGRADE
  const gradeKey = await itemUpgradeableInstance.EARN_UPGRADE();
  // 0x76e34cd5c7c46b6bfe6b1da94d54447ea83a4af449bc62a0ef3ecae24c08031a
  console.info("EARN_UPGRADE key", gradeKey);

  // ERC721 getRecordField TIME_UPGRADE
  const gradeTKey = await itemUpgradeableInstance.TIME_UPGRADE();
  // 0x76e34cd5c7c46b6bfe6b1da94d54447ea83a4af449bc62a0ef3ecae24c08031a
  console.info("TIME_UPGRADE key", gradeTKey);

  // ERC721 getRecordField Rarity
  const rarityKey = await itemUpgradeableInstance.RARITY();
  // 0xda9488a573bb2899ea5782d71e9ebaeb1d8291bf3812a066ec86608a697c51fc
  console.info("RARITY key", rarityKey);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
