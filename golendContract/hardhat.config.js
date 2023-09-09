require("@nomicfoundation/hardhat-toolbox");
require('@oasisprotocol/sapphire-hardhat');
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks:{
    sapphire_testnet:{
      url:"https://testnet.sapphire.oasis.dev",
      accounts:["ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"],
      chainId: 0x5aff,
    }
  }
};
