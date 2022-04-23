// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "hardhat/console.sol";

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
		uint price
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

	function listToken(address token, uint tokenId, uint price, uint256 numberOfDays) external {
		IERC721(token).safeTransferFrom(msg.sender, address(this), tokenId);

		Listing memory listing = Listing(
			ListingStatus.Active,
			numberOfDays,
			msg.sender,
			token,
			tokenId,
			price
		);

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

	function rentToken(uint listingId) external payable {
		Listing storage listing = _listings[listingId];

		//TODO: Get token's Resolver

		//TODO: Set token's registrant to this contract

		require(msg.sender != listing.lister, "Lister cannot be renter");
		require(listing.status == ListingStatus.Active, "Listing is not active");

		require(msg.value >= listing.price, "Insufficient payment");

		listing.status = ListingStatus.Rented;

		payable(address(this)).transfer(listing.price);

		emit Rental(
			listingId,
			msg.sender,
			listing.token,
			listing.tokenId,
			listing.price
		);
	}

	function cancel(uint listingId) public {
		Listing storage listing = _listings[listingId];

		require(msg.sender == listing.lister, "Only lister can cancel listing");
		require(listing.status == ListingStatus.Active, "Listing is not active");

		listing.status = ListingStatus.Cancelled;
	
		IERC721(listing.token).safeTransferFrom(address(this), msg.sender, listing.tokenId);

		emit Cancel(listingId, listing.lister);
	}

	function reclaim(uint listingId) public {

		Listing storage listing = _listings[listingId];

		require(msg.sender == listing.lister, "Only lister can reclaim token");
		require(listing.status == ListingStatus.Active, "Token has been rented out");
		
		IERC721(listing.token).safeTransferFrom(address(this), msg.sender, listing.tokenId);

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
}