pragma solidity ^0.8.10;

contract DutchAuction {
    // Winner takes it all auction

    uint public startPrice;
    uint public startDate;
    uint public endDate;

    uint timeEndShifted;
    uint public createdTime;

    address itemOwner;
    bool public isSold;
    uint public salePrice;

    constructor(uint _startPrice, uint _startDate, uint _endDate) {
        startPrice = _startPrice;
        startDate = _startDate;
        endDate = _endDate;
        
        timeEndShifted = endDate - startDate;

        itemOwner = msg.sender;
        isSold = false;

        createdTime = block.timestamp;
    }

    function getCurrentPrice() public returns(uint) {
        uint timeNow = block.timestamp;
        
        if(timeNow < startDate) return startPrice;
        if(timeNow > endDate) return 0;

        return (startPrice * (endDate - timeNow)) / timeEndShifted;
    }

    function bid() public payable active_auction {
        require(msg.value >= getCurrentPrice());

        isSold = true;
        itemOwner = msg.sender;
        salePrice = msg.value;
    }

    function getItem() public item_owner returns(address) {
        return address(0);
    }

    modifier active_auction() {
        require(!isSold);

        uint now = block.timestamp;
        require(now >= startDate && now < endDate);
        _;
    }

    modifier item_owner() {
        require(msg.sender == itemOwner);
        _;
    }
}
