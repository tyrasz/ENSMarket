const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("ENSMarket", function () {

    const tokenId = new ethers.BigNumber.from(1);
    let listingId = new ethers.BigNumber.from(1);
    const price = new ethers.BigNumber.from(1000);
    const numDays = new ethers.BigNumber.from(60);
    const DAYS = 24 * 60 * 60;
    const now = Date.now() / 1000 | 0;
    const dateRented = now + 0.5 * DAYS;
    const invalidFutureTimestamp = now + 1 * DAYS; 
    let lister;
    let renter;

    beforeEach(async() => {
        const ENSMarket = await ethers.getContractFactory("ENSMarket");
        ensMarket = await ENSMarket.deploy();
        await ensMarket.deployed();

        const MockENS = await ethers.getContractFactory("MockENS");
        mockENS = await MockENS.deploy();
        await mockENS.deployed();
        
        token = await mockENS.mint();
        console.log("Address mock ENS:", mockENS.address);
        

        const signers = await ethers.getSigners();
        lister = signers[0].address;
        renter = signers[1];
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

    it("Should execute listing and cancel", async function () {
        const msg = await mockENS.approve(ensMarket.address, tokenId);
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
        const listingID = listingId;
        console.log("Cancelling!");
        await expect(
            ensMarket.cancel(
                listingID
            )
        ).to.emit(ensMarket, "Cancel")
        .withArgs(
            listingID,
            lister
        )
        
    });

    it("Should execute listing and fail rent", async function () {
        const msg = await mockENS.approve(ensMarket.address, tokenId);
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
        const listingID = listingId;
        console.log("Fail renting!");
        await expect(
            ensMarket.rentToken(
                listingID
            )
        ).to.be.revertedWith('Lister cannot be renter') 
        
    });

    it("Should execute listing and pass rent", async function () {

        const msg = await mockENS.approve(ensMarket.address, tokenId);

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
        const listingID = listingId;
        console.log("Pass renting!");

        await expect(
            ensMarket.connect(renter).rentToken(
                listingID,
                {value: price}
            )
        ).to.emit(ensMarket, "Rental")
        .withArgs(
            listingId,
            renter,
            token,
            tokenId,
            price,
            dateRented
        );
        
    });

    it("Should execute listing and fail reclaim", async function () {
        const msg = await mockENS.approve(ensMarket.address, tokenId);
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
        const listingID = listingId;
        console.log("Fail reclaim!");
        await expect(
            ensMarket.connect(renter).reclaim(
                listingID
            )
        ).to.be.revertedWith('Only lister can reclaim token') 
        
    });

    it("Should execute listing and fail reclaim if time is not up yet", async function () {
        snapShotId = await network.provider.request({
            method: 'evm_snapshot',
        });

        await network.provider.request({
            method: 'evm_increaseTime',
            params: [1 * DAYS]
        }); 
        const msg = await mockENS.approve(ensMarket.address, tokenId);
        const listing = await expect(
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
        const listingID = listingId;
        console.log("Fail reclaim!");
        assert(((dateRented + (numDays)*24*60*60) < block.timestamp), "Still being rented out!")
        
        // await expect(
        //     ensMarket.connect(renter).reclaim(
        //         listingID
        //     )
        // ).to.be.revertedWith('Only lister can reclaim token') 
        
    });

});

