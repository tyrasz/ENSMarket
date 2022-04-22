const { expect } = require("chai");
const { ethers } = require("hardhat");

beforeEach(async() => {

});

describe("ENSMarket", function () {
  it("Should deploy a ENSMarket contract", async function () {
    const ENSMarket = await ethers.getContractFactory("ENSMarket");
    const ensMarket = await ENSMarket.deploy();
    await ensMarket.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
