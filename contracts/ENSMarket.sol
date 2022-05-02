// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "hardhat/console.sol";

interface IBaseRegistrarInterface {
	function reclaim(uint256 id, address owner) external;
}

contract ENSMarket {

	

	enum ListingStatus {
		Active,
		Rented,
		Cancelled, 
		Completed
	}

	enum RentalMoneyStatus {
		Initialised,
		Available,
		Claimed
	}

	struct Listing {
		ListingStatus status;
		uint numberOfDays;
		address lister;
		address token;
		uint tokenId;
		uint price;
		uint256 dateRented;
	}

	event Listed(
		uint listingId,
		address lister,
		address token,
		uint tokenId,
		uint price
	);

	event Rental(
		uint listingId,
		address renter,
		address token,
		uint tokenId,
		uint price,
		uint dateRented
	);

	event Cancel(
		uint listingId,
		address lister
	);

	event Reclaim(
		uint listingID,
		ListingStatus status,
		address lister,
		address token,
		uint tokenId,
		uint price
	);

	uint private _listingId = 0;
	mapping(uint => Listing) private _listings;
    Listing[] public listingArray;

	address owner;

	//modifier for onlyOwner
	modifier onlyOwner {
      require(msg.sender == owner);
      _;
   	}

	address private constant BaseRegistrarContract = 0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85;

	function listToken(address token, uint tokenId, uint price, uint256 numberOfDays) external {
		IERC721(token).transferFrom(msg.sender, address(this), tokenId);

		Listing memory listing = Listing(
			ListingStatus.Active,
			numberOfDays,
			msg.sender,
			token,
			tokenId,
			price,
			0
		);

        listingArray.push(listing);

		_listingId++;

		_listings[_listingId] = listing;

		emit Listed(
			_listingId,
			msg.sender,
			token,
			tokenId,
			price
		);
	}

	function getListing(uint listingId) public view returns (Listing memory) {
		return _listings[listingId];
	}

    function getAllListings() public view returns (Listing[] memory) {
        return listingArray;
    }

	receive() external payable{
	}

	fallback() external payable{
	}

	function rentToken(uint listingId) external payable {
		Listing storage listing = _listings[listingId];

		//TODO: Get token's Resolver

		//TODO: Set token's registrant to this contract

		require(msg.sender != listing.lister, "Lister cannot be renter");
		require(listing.status == ListingStatus.Active, "Listing is not active");

		require(msg.value >= listing.price, "Insufficient payment");

		listing.status = ListingStatus.Rented;
		listing.dateRented = block.timestamp;

		//Setting controller to renter
		IBaseRegistrarInterface(BaseRegistrarContract).reclaim(listingId, msg.sender);
		
		payable(listing.lister).transfer(listing.price);

		emit Rental(
			listingId,
			msg.sender,
			listing.token,
			listing.tokenId,
			listing.price,
			listing.dateRented
		);
	}

	function cancel(uint listingId) public {
		Listing storage listing = _listings[listingId];

		require(msg.sender == listing.lister, "Only lister can cancel listing");
		require(listing.status == ListingStatus.Active, "Listing is not active");

		listing.status = ListingStatus.Cancelled;
	
		IERC721(listing.token).transferFrom(address(this), msg.sender, listing.tokenId);
		emit Cancel(listingId, listing.lister);
	}

	function reclaim(uint listingId) public {

		Listing storage listing = _listings[listingId];

		require(msg.sender == listing.lister, "Only lister can reclaim token");
		require(listing.status == ListingStatus.Active, "Token has been rented out");
		require((listing.dateRented + (listing.numberOfDays)*24*60*60) < block.timestamp, "Domain can only be reclaimed after rental period has expired");
		
		IERC721(listing.token).transferFrom(address(this), msg.sender, listing.tokenId);

		//Setting controller to owner
		IBaseRegistrarInterface(BaseRegistrarContract).reclaim(listingId, msg.sender);

		listing.status = ListingStatus.Completed;

		emit Reclaim(
			listingId,
			listing.status,
			msg.sender,
			listing.token,
			listing.tokenId,
			listing.price
		);
	}

	//function selfdestruct to reclaim for testing. Remove in production
	function destroySmartContract(address payable _to) public onlyOwner {
        require(msg.sender == owner, "You are not the owner");
        selfdestruct(_to);
    }
    
}