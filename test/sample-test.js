const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ENSMarket", function () {

    const tokenId = new ethers.BigNumber.from(1);
    let listingId = new ethers.BigNumber.from(1);
    const price = new ethers.BigNumber.from(1000);
    const numDays = new ethers.BigNumber.from(60);
    let lister;


    beforeEach(async() => {
        const ENSMarket = await ethers.getContractFactory("ENSMarket");
        ensMarket = await ENSMarket.deploy();
        await ensMarket.deployed();

        const MockENS = await ethers.getContractFactory("MockENS");
        mockENS = await MockENS.deploy();
        await mockENS.deployed();

        token = await mockENS.mint();
        console.log("Address:", mockENS.address);

        const signers = await ethers.getSigners();
        lister = signers[0].address;
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
    });

    it("Should not be able to list", async function () {
        await expect(
            ensMarket.listToken(
                mockENS.address,
                tokenId,
                price,
                numDays
            )
        ).to.be.revertedWith('ERC721: transfer caller is not owner nor approved')        
    });

    it("Should execute listing", async function () {
        const msg = await mockENS.approve(ensMarket.address, tokenId);
        console.log(msg)
        await expect(
            ensMarket.listToken(
                mockENS.address,
                tokenId,
                price,
                numDays
            )
        ).to.emit(ensMarket, "Listed")
        .withArgs(
            listingId,
            lister,
            mockENS.address,
            tokenId,
            price
        );
        
    });

});

