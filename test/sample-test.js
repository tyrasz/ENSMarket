const { expect } = require("chai");
const { ethers } = require("hardhat");


beforeEach(async() => {
  const ENSMarket = await ethers.getContractFactory("ENSMarket");
  ensMarket = await ENSMarket.deploy();

  //deploy ENS on local
  const ENSRegistry = await ethers.getContractFactory("LOCALENSRegistry")
  ensSetup = await ENSRegistry.deploy();
  // const ENSProvider = await provider.setupENS();
  // ensRegistry = await ENSRegistry.deploy()

  
});

describe("ENSMarket", function () {
  it("Should deploy a ENSMarket contract", async function () {
    const contractAddress = ensMarket.address;
    console.log(contractAddress);
  });

  it("Should deploy a ENSRegistry contract", async function () {
    const contractAddress2 = ensSetup.address;
    console.log(contractAddress2);
  });
});
