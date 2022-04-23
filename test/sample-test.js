const { expect } = require("chai");
const { ethers } = require("hardhat");



describe("ENSMarket", function () {

    beforeEach(async() => {
        const ENSMarket = await ethers.getContractFactory("ENSMarket");
        ensMarket = await ENSMarket.deploy();
        await ensMarket.deployed();
        [lister] = await ethers.getSigners();
    });

    it("Should deploy a ENSMarket contract", async function () {
        const contractAddress = ensMarket.address;
        console.log(contractAddress);
    });

});

