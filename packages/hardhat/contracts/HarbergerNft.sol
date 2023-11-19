// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./solmate/src/auth/Owned.sol";
import "./solmate/src/tokens/ERC721.sol";
import {FixedPointMathLib} from "./solmate/src/utils/FixedPointMathLib.sol";
import {LibBase37} from "./utils/LibBase37.sol";
import "hardhat/console.sol";

/// @title HarbergerNft
/// @author oemerfurkan
/// @notice Name service that uses harberger tax
contract HarbergerNft is ERC721, Owned {
    using FixedPointMathLib for uint256;

    /*//////////////////////////////////////////////////////////////
                                IMMUTABLES  
    //////////////////////////////////////////////////////////////*/

    uint256 public immutable YEARLY_REGULAR_PRICE;

    /// @notice starting price of mint dutch auction
    uint256 public immutable INITIAL_HARBERGER_MINT_PRICE;

    /// @notice starting time of mint dutch auction
    uint256 public immutable MINT_START_TIMESTAMP;

    /// @notice decrease rate of initial mint price
    /// @dev mint price decreases to 1/20 after 10 days
    uint256 public immutable MINT_PRICE_DECREASE_RATE = 19;

    uint256 immutable MAX_BPS = 10000;

    /*//////////////////////////////////////////////////////////////
                             STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /// @notice yearly tax in bps
    /// @dev initialized in constructor, can be changed by the contract owner
    uint256 public yearlyTaxBps;

    /// @notice minimum required remaining time after buy, mint or tax payment
    /// @dev initialized in constructor, can be changed by the contract owner
    uint256 public minimumPeriod;

    /// @notice address of the default public resolver
    /// @dev initialized in constructor, can be changed by the contract owner
    address public publicResolver;

    /// @notice whether the contract is paused
    /// @notice pauses every state changing non-owner function except approve and setApprovalForAll
    /// @dev can be changed by the contract owner
    bool public paused = false;

    /// @notice token id to its harberger price determined by the token owner
    mapping(uint256 => uint256) public prices;

    /// @notice token id to its expiration date
    /// @dev token buy price starts decreasing after expiration date is less than 30 days
    mapping(uint256 => uint256) public expirationDates;

    /// @notice token id to its resolver contracts address
    /// @dev public resolver is used if a custom resolver is not set by token owner
    mapping(uint256 => address) public resolvers;

    /// @notice primary name of an address for reverse resolution
    /// @dev set to zero if owner transfers primary name to another address
    mapping(address => uint256) public primaryNames;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /// @notice emitted when contract is paused or unpaused
    /// @param _paused whether the contract is paused
    event Pause(bool _paused);

    /// @notice emitted when a token is minted
    /// @param id token id
    /// @param price mint price of the token
    /// @param expirationDate expiration date of the token after mint
    event Mint(uint256 id, uint256 price, uint256 expirationDate);

    /// @notice emitted when a new harberger price is set for a token
    /// @param id token id
    /// @param price new harberger price of the token
    /// @param newExpirationDate expiration date of the token after setting new harberger price
    event SetPrice(uint256 id, uint256 price, uint256 newExpirationDate);

    /// @notice emitted when tax is paid for a token
    /// @param id token id
    /// @param newExpirationDate expiration date of the token after paying tax
    event PayTax(uint256 id, uint256 newExpirationDate);

    /// @notice emitted when a token is bought
    /// @param id token id
    /// @param newPrice new harberger price of the token set by the buyer
    /// @param newExpirationDate expiration date of the token after buy
    event Buy(uint256 id, uint256 newPrice, uint256 newExpirationDate);

    /// @notice emitted when a custom resolver is set for a token
    /// @param id token id
    /// @param resolver address of the custom resolver contract
    event SetResolver(uint256 id, address resolver);

    /// @notice emitted when a new primary name is set for an address
    /// @param owner address of the owner
    /// @param id token id of the new primary name
    event SetPrimaryName(address owner, uint256 id);

    /// @notice emitted when a new yearly tax is set
    /// @param yearlyTaxBps new yearly tax in bps
    event SetYearlyTaxBps(uint256 yearlyTaxBps);

    /// @notice emitted when a new minimum period is set
    /// @param minimumPeriod new minimum required remaining time after buy, mint or tax payment
    event SetMinimumPeriod(uint256 minimumPeriod);

    /// @notice emitted when a new public resolver is set
    /// @param resolver address of the new public resolver contract
    event SetPublicResolver(address resolver);

    /*//////////////////////////////////////////////////////////////
                                MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier notPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @notice sets initial values
    /// @param _name name of the contract
    /// @param _symbol symbol of the contract
    /// @param yearlyRegularPrice yearly regular price
    /// @param initialHarbergerMintPrice starting price of mint dutch auction
    /// @param mintStartTimestamp starting time of mint dutch auction
    /// @param _yearlyTaxBps yearly tax in bps
    /// @param _minimumPeriod minimum required remaining time after buy, mint or tax payment
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 yearlyRegularPrice,
        uint256 initialHarbergerMintPrice,
        uint256 mintStartTimestamp,
        uint256 _yearlyTaxBps,
        uint256 _minimumPeriod
    ) ERC721(_name, _symbol) Owned(msg.sender) {
        YEARLY_REGULAR_PRICE = yearlyRegularPrice;
        INITIAL_HARBERGER_MINT_PRICE = initialHarbergerMintPrice;
        MINT_START_TIMESTAMP = mintStartTimestamp;
        yearlyTaxBps = _yearlyTaxBps;
        minimumPeriod = _minimumPeriod;
    }

    /*//////////////////////////////////////////////////////////////
                             HARBERGER LOGIC
    //////////////////////////////////////////////////////////////*/

    function mintRegular(uint256 id) external payable notPaused {
        require(!isHarberger(id));
        require(msg.value == YEARLY_REGULAR_PRICE, "Insufficient payment");

        expirationDates[id] = block.timestamp + 365 days;
        _safeMint(msg.sender, id);
    }

    function confiscate(uint256 id) external payable notPaused {
        require(!isHarberger(id));
        require(expirationDates[id] < block.timestamp, "Token is not expired");
        require(msg.value == YEARLY_REGULAR_PRICE, "Insufficient payment");

        expirationDates[id] = block.timestamp + 365 days;
        forcedTransferFrom(ownerOf(id), msg.sender, id);
    }

    /// @notice mints a new token and sets its parameters
    /// @dev reverts if expiration date is less than minimumPeriod after mint or id is zero
    /// @dev sets public resolver as default resolver
    /// @param id id of the minted token
    /// @param price harberger price of the token
    function mintHarberger(uint256 id, uint256 price) external payable notPaused {
        require(id > 0, "zero id can not be minted");
        require(isHarberger(id));
        console.log(isHarberger(id));
        uint256 expirationDate = expirationDateAfterMint(price, msg.value);
        console.log("expirationDate: %s", expirationDate);
        require(expirationDate > block.timestamp + minimumPeriod, "Insufficient payment");

        expirationDates[id] = expirationDate;
        prices[id] = price;
        resolvers[id] = publicResolver;

        _safeMint(msg.sender, id);
        emit Mint(id, price, expirationDate);
    }

    /// @notice sets a new harberger price for a token and updates its expiration date
    /// @dev reverts if not called by token owner
    /// @dev reverts if expiration date is less than minimumPeriod after setting new harberger price
    /// @param id id of the token
    /// @param newPrice new harberger price of the token
    function setPrice(uint256 id, uint256 newPrice) external notPaused {
        require(isHarberger(id), "Wrong type");
        require(ownerOf(id) == msg.sender, "Not owner");
        uint256 newExpirationDate = expirationDateAfterSetPrice(id, newPrice);
        require(newExpirationDate > block.timestamp + minimumPeriod, "Expiration date too soon");

        expirationDates[id] = newExpirationDate;
        prices[id] = newPrice;
        emit SetPrice(id, newPrice, newExpirationDate);
    }

    /// @notice pays the tax for a token and updates its expiration date
    /// @dev reverts if expiration date is less than minimumPeriod after paying tax
    /// @param id id of the token
    function payTax(uint256 id) external payable notPaused {
        require(isHarberger(id), "Wrong type");
        uint256 newExpirationDate = expirationDateAfterPayTax(id, msg.value);
        require(newExpirationDate > block.timestamp + minimumPeriod, "Insufficient payment");

        expirationDates[id] = newExpirationDate;
        emit PayTax(id, newExpirationDate);
    }

    /// @notice convenience function for setting harberger price and paying tax in one transaction
    /// @dev reverts if not called by token owner
    /// @dev reverts if time to new expiration date is less than minimumPeriod
    /// @param id id of the token
    /// @param newPrice new harberger price of the token
    function setPriceAndPayTax(uint256 id, uint256 newPrice) external payable notPaused {
        require(isHarberger(id));
        require(ownerOf(id) == msg.sender, "Not owner");
        uint256 newExpirationDate = expirationDateAfterSetPriceAndPayTax(id, newPrice, msg.value);
        require(newExpirationDate > block.timestamp + minimumPeriod, "Insufficient payment");

        expirationDates[id] = newExpirationDate;
        prices[id] = newPrice;
        emit SetPrice(id, newPrice, newExpirationDate);
    }

    /// @notice buys a token by paying its buy price and sets its new harberger price and expiration date
    /// @dev reverts if expiration date is less than minimumPeriod after buy
    /// @param id id of the token to buy
    /// @param newPrice new harberger price of the token
    function buy(uint256 id, uint256 newPrice) external payable notPaused {
        require(isHarberger(id), "Wrong type");
        uint256 buyPrice = calculateBuyPrice(id);
        uint256 newExpirationDate = expirationDateAfterBuy(id, buyPrice, newPrice, msg.value);
        require(newExpirationDate >= block.timestamp + minimumPeriod, "Insufficient payment");

        address payable oldOwner = payable(ownerOf(id));

        expirationDates[id] = newExpirationDate;
        prices[id] = newPrice;

        forcedTransferFrom(oldOwner, msg.sender, id);
        oldOwner.call{value: buyPrice}("");
        emit Buy(id, newPrice, newExpirationDate);
    }

    /// @notice sets custom resolver address for a token
    /// @dev reverts if not called by token owner
    /// @param id id of the token
    /// @param resolver address of the custom resolver
    function setResolver(uint256 id, address resolver) external notPaused {
        require(ownerOf(id) == msg.sender, "Not owner");
        resolvers[id] = resolver;
        emit SetResolver(id, resolver);
    }

    /// @notice sets primary name for an address
    /// @dev reverts if owner does not have a token with the given id
    /// @param id id of the token
    function setPrimaryName(uint256 id) external notPaused {
        require(ownerOf(id) == msg.sender, "Not owner");
        primaryNames[msg.sender] = id;
        emit SetPrimaryName(msg.sender, id);
    }

    /*//////////////////////////////////////////////////////////////
                             OWNER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice pauses or unpauses the contract
    /// @dev reverts if not called by contract owner
    /// @param _paused true to pause, false to unpause
    function pause(bool _paused) external onlyOwner {
        paused = _paused;
        emit Pause(_paused);
    }

    /// @notice sets a new yearly tax bps
    /// @dev reverts if not called by contract owner
    /// @param _yearlyTaxBps new yearly tax bps
    function setYearlyTaxBps(uint256 _yearlyTaxBps) external onlyOwner {
        yearlyTaxBps = _yearlyTaxBps;
        emit SetYearlyTaxBps(_yearlyTaxBps);
    }

    /// @notice sets a new minimum period
    /// @dev reverts if not called by contract owner
    /// @param _minimumPeriod new minimum period
    function setMinimumPeriod(uint256 _minimumPeriod) external onlyOwner {
        minimumPeriod = _minimumPeriod;
        emit SetMinimumPeriod(_minimumPeriod);
    }

    /// @notice sets a new public resolver address
    /// @dev reverts if not called by contract owner
    /// @param _publicResolver address of the new public resolver
    function setPublicResolver(address _publicResolver) external onlyOwner {
        publicResolver = _publicResolver;
        emit SetPublicResolver(_publicResolver);
    }

    /*//////////////////////////////////////////////////////////////
                          PUBLIC VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Returns a token's URI if it has been minted
    /// @param id The id of the token to get the URI for
    /// @return uri URI of the token with given id.
    function tokenURI(uint256 id) public view override returns (string memory uri) {}

    /// @notice calculates expiration date after mint with given harberger price and payment
    /// @param price harberger price
    /// @param payment price paid for mint
    /// @return expirationDate expiration date after mint
    function expirationDateAfterMint(uint256 price, uint256 payment) public view returns (uint256 expirationDate) {
        console.log("price: %s", payment);
        console.log("payment: %s", calculateMintPrice());
        uint256 extensionPayment = payment - calculateMintPrice();
        uint256 yearlyTax = price.mulDivUp(yearlyTaxBps, MAX_BPS);
        expirationDate = block.timestamp + extensionPayment.mulDivDown(365 days, yearlyTax);
    }

    /// @notice calculates expiration date after setPrice with given new harberger price for given id
    /// @param id id of the token
    /// @param newPrice new harberger price of the token
    /// @return expirationDate expiration date after setPrice
    function expirationDateAfterSetPrice(uint256 id, uint256 newPrice) public view returns (uint256 expirationDate) {
        uint256 durationLeft = expirationDates[id] - block.timestamp;
        uint256 oldPrice = prices[id];
        expirationDate = block.timestamp + oldPrice.mulDivDown(durationLeft, newPrice);
    }

    /// @notice calculates expiration date after payTax with given payment for given id
    /// @param id id of the token
    /// @param payment price paid for tax
    /// @return expirationDate expiration date after payTax
    function expirationDateAfterPayTax(uint256 id, uint256 payment) public view returns (uint256 expirationDate) {
        uint256 yearlyTax = prices[id].mulDivUp(yearlyTaxBps, MAX_BPS);
        expirationDate = expirationDates[id] + (payment.mulDivDown(365 days, yearlyTax));
    }

    /// @notice calculates expiration date after setPriceAndPayTax with given new harberger price and payment for given id
    /// @param id id of the token
    /// @param newPrice new harberger price of the token
    /// @param payment price paid for tax
    /// @return expirationDate expiration date after setPriceAndPayTax
    function expirationDateAfterSetPriceAndPayTax(uint256 id, uint256 newPrice, uint256 payment)
        public
        view
        returns (uint256 expirationDate)
    {
        uint256 durationLeft = expirationDates[id] - block.timestamp;
        uint256 durationLeftAfterNewPrice = durationLeft.mulDivDown(prices[id], newPrice);
        uint256 yearlyTax = newPrice.mulDivUp(yearlyTaxBps, MAX_BPS);
        expirationDate = block.timestamp + durationLeftAfterNewPrice + payment.mulDivDown(365 days, yearlyTax);
    }

    /// @notice calculates expiration date after buy with given buy price, new harberger price and payment for given id
    /// @param id id of the token
    /// @param buyPrice buy price of the token
    /// @param newPrice new harberger price of the token
    /// @param payment price paid for buy
    function expirationDateAfterBuy(uint256 id, uint256 buyPrice, uint256 newPrice, uint256 payment)
        public
        view
        returns (uint256 expirationDate)
    {
        uint256 extensionPayment = payment - buyPrice;
        uint256 durationLeft;
        if (block.timestamp < expirationDates[id]) {
            durationLeft = expirationDates[id] - block.timestamp;
        }
        uint256 durationLeftAfterNewPrice = durationLeft.mulDivDown(prices[id], newPrice);
        uint256 yearlyTax = newPrice.mulDivUp(yearlyTaxBps, MAX_BPS);
        expirationDate = block.timestamp + durationLeftAfterNewPrice + extensionPayment.mulDivDown(365 days, yearlyTax);
    }

    /// @notice calculates mint price for current time
    /// @dev starts at INITIAL_MINT_PRICE and decreases by MINT_PRICE_DECREASE_RATE gradually
    /// @return mintPrice mint price at the time of transaction
    function calculateMintPrice() public view returns (uint256 mintPrice) {
        uint256 passedTime = block.timestamp - MINT_START_TIMESTAMP;
        uint256 denominator = passedTime * MINT_PRICE_DECREASE_RATE + 864000;
        mintPrice = INITIAL_HARBERGER_MINT_PRICE.mulDivUp(864000, denominator);
    }

    /// @notice calculates buy price for token
    /// @dev equals harberger price if expirationDate is more than 30 days away gradually decreases after that
    /// @param id id of the token
    /// @return buyPrice buy price of the token
    function calculateBuyPrice(uint256 id) public view returns (uint256 buyPrice) {
        if (expirationDates[id] <= block.timestamp) {
            return 0;
        }

        uint256 durationLeft = expirationDates[id] - block.timestamp;
        uint256 fullPrice = prices[id];
        if (durationLeft > 30 days) {
            buyPrice = fullPrice;
        } else {
            buyPrice = fullPrice.mulDivDown(durationLeft, 30 days);
        }
    }

    /*//////////////////////////////////////////////////////////////
                         EXTERNAL VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice convenience function for calculating minimum payment for a non reverting mint
    /// @dev equals to price of minting and paying tax for 3 months
    /// @param harbergerPrice harberger price
    /// @return minimumMintPrice minimum payment for non reverting mint
    function calculateMinimumMintPrice(uint256 harbergerPrice) external view returns (uint256 minimumMintPrice) {
        uint256 mintPrice = calculateMintPrice();
        uint256 yearlyTax = harbergerPrice.mulDivUp(yearlyTaxBps, MAX_BPS);
        minimumMintPrice = mintPrice + minimumPeriod.mulDivUp(yearlyTax, 365 days);
    }

    /// @notice convenience function for calculating minimum payment for a non reverting buy
    /// @dev equals to harberger price if expiration date of token is farther than 3 months
    /// else equals to buying and setting expiration date to 3 months from now
    /// @param id id of the token
    /// @param newPrice new harberger price of the token
    /// @return minimumBuyPrice minimum payment for non reverting buy
    function calculateMinimumBuyPrice(uint256 id, uint256 newPrice) external view returns (uint256 minimumBuyPrice) {
        require(isHarberger(id));
        uint256 durationLeft = expirationDates[id] - block.timestamp;
        uint256 durationLeftAfterNewPrice = durationLeft.mulDivDown(prices[id], newPrice);
        uint256 buyPrice = calculateBuyPrice(id);

        if (durationLeftAfterNewPrice > minimumPeriod) {
            minimumBuyPrice = buyPrice;
        } else {
            uint256 requiredExtension = minimumPeriod - durationLeftAfterNewPrice;
            uint256 yearlyTax = newPrice.mulDivUp(yearlyTaxBps, MAX_BPS);
            minimumBuyPrice = buyPrice + requiredExtension.mulDivUp(yearlyTax, 365 days);
        }
    }

    /*//////////////////////////////////////////////////////////////
                           TRANSFER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @dev modified transferFrom that unsets primary name when an owner transfers their primary name
    function transferFrom(address from, address to, uint256 id) public override notPaused {
        if (primaryNames[from] == id) {
            primaryNames[from] = 0;
            emit SetPrimaryName(from, 0);
        }

        super.transferFrom(from, to, id);
    }

    /// @dev modified transferFrom to use in buy function
    function forcedTransferFrom(address from, address to, uint256 id) internal {
        if (primaryNames[from] == id) {
            primaryNames[from] = 0;
        }

        unchecked {
            _balanceOf[from]--;

            _balanceOf[to]++;
        }

        _ownerOf[id] = to;

        delete getApproved[id];

        emit Transfer(from, to, id);
    }

    /*//////////////////////////////////////////////////////////////
                           INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function isHarberger(uint256 id) internal pure returns (bool) {
        return id < 3512479453921;
    }
}