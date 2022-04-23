// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "hardhat/console.sol";

contract ENSMarket {

	enum ListingStatus {
		Active,
		Rented,
		Cancelled
	}

	enum RentalMoneyStatus {
		Initialised,
		Available,
		Claimed
	}

	struct Listing {
		ListingStatus status;
		RentalMoneyStatus rentalStatus;
		address seller;
		address token;
		uint tokenId;
		uint price;
	}

	event Listed(
		uint listingId,
		address seller,
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
		address seller
	);

	event RentalClaimed(
		uint listingID,
		RentalMoneyStatus rentalStatus,
		address seller,
		address token,
		uint tokenId,
		uint price
	);

	uint private _listingId = 0;
	mapping(uint => Listing) private _listings;

	function listToken(address token, uint tokenId, uint price) external {
		IERC721(token).transferFrom(msg.sender, address(this), tokenId);

		Listing memory listing = Listing(
			ListingStatus.Active,
			RentalMoneyStatus.Initialised,
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

		require(msg.sender != listing.seller, "Seller cannot be renter");
		require(listing.status == ListingStatus.Active, "Listing is not active");

		require(msg.value >= listing.price, "Insufficient payment");

		listing.status = ListingStatus.Rented;
		listing.rentalStatus = RentalMoneyStatus.Available;

		IERC721(listing.token).transferFrom(address(this), msg.sender, listing.tokenId);
		payable(listing.seller).transfer(listing.price);

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

		require(msg.sender == listing.seller, "Only seller can cancel listing");
		require(listing.status == ListingStatus.Active, "Listing is not active");

		listing.status = ListingStatus.Cancelled;
	
		IERC721(listing.token).transferFrom(address(this), msg.sender, listing.tokenId);

		emit Cancel(listingId, listing.seller);
	}

	function claimRent(uint listingId) public {

		Listing storage listing = _listings[listingId];

		require(msg.sender == listing.seller, "Only seller can claim rental");
		require(listing.status == ListingStatus.Rented, "Token has not been rented");

		listing.rentalStatus = RentalMoneyStatus.Claimed;
		payable(msg.sender).transfer(listing.price);

		emit RentalClaimed(
			listingId,
			listing.rentalStatus,
			msg.sender,
			listing.token,
			listing.tokenId,
			listing.price
		);
	}
}