const hre = require("hardhat");

async function main() {

  const ENSMarket = await hre.ethers.getContractFactory("ENSMarket");
  const ensMarket = await ENSMarket.deploy();

  await ensMarket.deployed();

  console.log("ENSMarket deployed to:", ensMarket.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
