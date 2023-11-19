// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {HarbergerNft} from "./HarbergerNft.sol";
import {IPublicResolver} from "./interfaces/IPublicResolver.sol";

contract PublicResolver is IPublicResolver {
    /*//////////////////////////////////////////////////////////////
                              BASE RESOLVER
    //////////////////////////////////////////////////////////////*/
    HarbergerNft immutable harberger;

    modifier onlyOwner(uint256 id) {
        require(msg.sender == harberger.ownerOf(id), "Not owner");
        _;
    }

    constructor(address _harbergerAddress) {
        harberger = HarbergerNft(_harbergerAddress);
    }

    function multicall(bytes[] calldata data) external returns (bytes[] memory results) {
        results = new bytes[](data.length);
        for (uint256 i = 0; i < data.length; i++) {
            (bool success, bytes memory result) = address(this).delegatecall(data[i]);
            require(success);
            results[i] = result;
        }
        return results;
    }

    /*//////////////////////////////////////////////////////////////
                            ADDRESS RESOLVER
    //////////////////////////////////////////////////////////////*/

    mapping(uint256 => mapping(uint256 => bytes)) addresses;

    function setAddress(uint256 id, uint256 coinType, bytes calldata addr) external onlyOwner(id) {
        addresses[id][coinType] = addr;
        emit AddressChanged(id, coinType, addr);
    }

    function getAddress(uint256 id, uint256 coinType) external view override returns (bytes memory) {
        return addresses[id][coinType];
    }

    /*//////////////////////////////////////////////////////////////
                              TEXT RESOLVER
    //////////////////////////////////////////////////////////////*/

    mapping(uint256 => mapping(string => string)) texts;

    function setText(uint256 id, string calldata key, string calldata value) external onlyOwner(id) {
        texts[id][key] = value;
        emit TextChanged(id, key, value);
    }

    function getText(uint256 id, string calldata key) external view override returns (string memory) {
        return texts[id][key];
    }

    /*//////////////////////////////////////////////////////////////
                          CONTENT HASH RESOLVER
    //////////////////////////////////////////////////////////////*/

    mapping(uint256 => bytes) public contentHashes;

    function setContentHash(uint256 id, bytes calldata hash) external onlyOwner(id) {
        contentHashes[id] = hash;
        emit ContentHashChanged(id, hash);
    }

    function getContentHash(uint256 id) external view override returns (bytes memory) {
        return contentHashes[id];
    }

    /*//////////////////////////////////////////////////////////////
                           PUBLIC KEY RESOLVER
    //////////////////////////////////////////////////////////////*/

    struct PublicKey {
        uint256 x;
        uint256 y;
    }

    mapping(uint256 => PublicKey) publicKeys;

    function setPublicKey(uint256 id, uint256 x, uint256 y) external onlyOwner(id) {
        publicKeys[id] = PublicKey(x, y);
        emit PublicKeyChanged(id, x, y);
    }

    function getPublicKey(uint256 id) external view override returns (uint256 x, uint256 y) {
        PublicKey memory key = publicKeys[id];
        return (key.x, key.y);
    }
}