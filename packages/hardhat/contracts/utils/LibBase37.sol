// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/// @notice Efficient library for turning decimal into base37 representation and vice versa.
/// @author oemerfurkan
/// @author Modified from solmate (https://github.com/transmissions11/solmate/blob/main/src/utils/LibString.sol)
library LibBase37 {
    function toBase37(uint256 value) internal pure returns (string memory str) {
        bytes memory base37 = "0123456789abcdefghijklmnopqrstuvwxyz-";
        /// @solidity memory-safe-assembly
        assembly {
            // The maximum value of a uint256 contains 78 digits (1 byte per digit), but we allocate 229 bytes
            // to keep the free memory pointer word aligned. We'll need 1 word for the length, 1 word for the
            // trailing zeros padding, 69 bytes for the line above and 3 other words for a max of 78 digits.
            //In total: 5 * 32 + 69 = 229 bytes.
            let newFreeMemoryPointer := add(mload(0x40), 229)

            // Update the free memory pointer to avoid overriding our string.
            mstore(0x40, newFreeMemoryPointer)

            // Assign str to the end of the zone of newly allocated memory.
            str := sub(newFreeMemoryPointer, 32)

            // Clean the last word of memory it may not be overwritten.
            mstore(str, 0)

            // Cache the end of the memory to calculate the length later.
            let end := str

            // We write the string from rightmost digit to leftmost digit.
            // The following is essentially a do-while loop that also handles the zero case.
            // prettier-ignore
            for { let temp := value } 1 {} {
                // Move the pointer 1 byte to the left.
                str := sub(str, 1)

                let index := mod(temp, 37)
                //start of base37 array in memory
                let base37offset := add(base37, 32)

                //index > 31 is special case since stack elements are 32 bytes
                if gt(index, 31) {
                    //decrease index and mload from furhter instead
                    index := sub(index, 31)
                    base37offset := add(base37offset, 31)
                }

                mstore8(str, byte(index, mload(base37offset)))

                // Keep dividing temp until zero.
                temp := div(temp, 37)

                // prettier-ignore
                if iszero(temp) { break }
            }

            // Compute and cache the final total length of the string.
            let length := sub(end, str)

            // Move the pointer 32 bytes leftwards to make room for the length.
            str := sub(str, 32)

            // Store the string's length at the start of memory allocated for our string.
            mstore(str, length)
        }
    }

    function toDecimal(string memory value) internal pure returns (uint256) {
        uint256 result = 0;
        for (uint256 i = 0; i < bytes(value).length; i++) {
            result = result * 37;
            uint256 char = uint256(uint8(bytes(value)[i]));
            if (char >= 48 && char <= 57) {
                result = result + (char - 48);
            } else if (char >= 97 && char <= 122) {
                result = result + (char - 87);
            } else if (char == 45) {
                result = result + 36;
            } else {
                revert("Invalid character");
            }
        }
        return result;
    }
}