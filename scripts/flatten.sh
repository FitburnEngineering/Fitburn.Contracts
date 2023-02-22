mkdir dist

hardhat flatten contracts/ContractManager/ContractManager.sol > dist/ContractManager.sol

hardhat flatten contracts/ERC20/ERC20Blacklist.sol > dist/ERC20Blacklist.sol
hardhat flatten contracts/ERC721/random/ERC721Binance.sol > dist/ERC721Binance.sol
hardhat flatten contracts/ERC721/random/ERC721BinanceV2.sol > dist/ERC721BinanceV2.sol

hardhat flatten contracts/Exchange/Exchange.sol > dist/Exchange.sol

hardhat flatten contracts/Mechanics/Staking/Staking.sol > dist/Staking.sol

hardhat flatten contracts/Mechanics/Vesting/Advisors.sol > dist/Advisors.sol
hardhat flatten contracts/Mechanics/Vesting/Marketing.sol > dist/Marketing.sol
hardhat flatten contracts/Mechanics/Vesting/Partnership.sol > dist/Partnership.sol
hardhat flatten contracts/Mechanics/Vesting/PreSeedSale.sol > dist/PreSeedSale.sol
hardhat flatten contracts/Mechanics/Vesting/PrivateSale.sol > dist/PrivateSale.sol
hardhat flatten contracts/Mechanics/Vesting/PublicSale.sol > dist/PublicSale.sol
hardhat flatten contracts/Mechanics/Vesting/SeedSale.sol > dist/SeedSale.sol
hardhat flatten contracts/Mechanics/Vesting/Team.sol > dist/Team.sol
