const { expect } = require("chai");
const { ethers } = require("hardhat");

beforeEach(async() => {
  const ENSMarket = await ethers.getContractFactory("ENSMarket");
  ensMarket = await ENSMarket.deploy();

  const MockENS = await ethers.getContractFactory("MockENS");
  const mockENS = await MockENS.deploy();
  await mockENS.deployed();
});

describe("ENSMarket", function () {
  it("Should deploy a ENSMarket contract", async function () {
    const contractAddress = ensMarket.address;
    console.log(contractAddress);
  });
});
