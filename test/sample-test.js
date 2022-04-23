const { expect } = require("chai");
const { ethers } = require("hardhat");
const { expectRevert, expectEvent, BN } = require('@openzeppelin/test-helpers');


describe("ENSMarket", function () {

    const tokenId = new BN(1);
    let listingId = new BN(1);
    const price = new BN(1000);


    beforeEach(async() => {
        const ENSMarket = await ethers.getContractFactory("ENSMarket");
        ensMarket = await ENSMarket.deploy();
        await ensMarket.deployed();

        const MockENS = await ethers.getContractFactory("MockENS");
        mockENS = await MockENS.deploy();
        await mockENS.deployed();

        const token = await mockENS.mint();

        console.log("TOKEN2", await mockENS.mint());
        // console.log("TOKEN:", token);
        [lister] = await ethers.getSigners();
    });

    it("Should deploy a ENSMarket contract", async function () {
        const contractAddress = ensMarket.address;
        console.log(contractAddress);
    });

    it("Should deploy a MockENS contract", async function () {
        const contractAddress = mockENS.address;
        console.log(contractAddress);
    });

    it("Should mint some mockENS tokens", async function () {
        const mint = await mockENS.mint();
        console.log(mint);
    });

    it("Should not be able to list", async function () {
        await expect(
            ensMarket.listToken(
            mockENS.address,
            tokenId,
            price,
            ethers.getSigner[0]
        )).to.be.revertedWith("ERC721: transfer caller not approved")        
    });

    it("Should execute listing", async function () {
        msg = await token.approve(ensMarket.address, tokenId, ethers.getSigner[0]) 
        console.log(msg);
        const tx = await market.listToken(
            token.address,
            tokenId, 
            price, 
            1,
            ethers.getSigner[0]
        );
        
        expectEvent(tx, 'Listed', {
            listingId,
            address: ethers.getSigner[0],
            token: token.address,
            tokenId,
            price
        })
        console.log("I'm in danger!")
    });

});

