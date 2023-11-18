// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IPublicResolver {
    event AddressChanged(uint256 id, uint256 coinType, bytes addr);
    event ContentHashChanged(uint256 id, bytes hash);
    event TextChanged(uint256 id, string indexed indexedKey, string key);
    event PublicKeyChanged(uint256 id, uint256 x, uint256 y);

    function multicall(bytes[] calldata data) external returns (bytes[] memory results);
    function setAddress(uint256 id, uint256 coinType, bytes calldata addr) external;
    function getAddress(uint256 id, uint256 coinType) external view returns (bytes memory);
    function setText(uint256 id, string calldata key, string calldata value) external;
    function getText(uint256 id, string calldata key) external view returns (string memory);
    function setContentHash(uint256 id, bytes calldata hash) external;
    function getContentHash(uint256 id) external view returns (bytes memory);
    function setPublicKey(uint256 id, uint256 x, uint256 y) external;
    function getPublicKey(uint256 id) external view returns (uint256 x, uint256 y);
}