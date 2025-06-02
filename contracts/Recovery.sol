// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Recovery {
    address public owner;
    mapping(address => bool) public guardian;
    uint256 public confirmedCount;
    mapping(address => bool) public confirmed;

    constructor(address[] memory _guardians) {
        owner = msg.sender;
        for (uint i = 0; i < _guardians.length; i++) {
            guardian[_guardians[i]] = true;
        }
    }

    function confirmRecovery(address _newOwner) external {
        require(guardian[msg.sender], "Not guardian");
        require(!confirmed[msg.sender], "Already confirmed");
        confirmed[msg.sender] = true;
        confirmedCount++;
        if (confirmedCount >= 2) {
            owner = _newOwner;
            reset();
        }
    }

    function reset() internal {
        confirmedCount = 0;
    }
}