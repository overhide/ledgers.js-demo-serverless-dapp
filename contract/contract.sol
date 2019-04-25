  pragma solidity ^0.4.18;

  contract TollEnforce {

    address owner;

    // ensure owner of contract calls function
    modifier isOwner() {
        require(owner == msg.sender);
        _;
    }

    constructor() public {
        owner = msg.sender;
    }

    // @param who - who signed
    // @param hash - of message: keccak256("\x19Ethereum Signed Message:\n", len(message), message)
    // @param v,r,s - signature tuple
    // @returns [true] if signature hash checks out for address
    function verify(address who, bytes32 hash, uint8 v, bytes32 r, bytes32 s) public view isOwner returns (bool) {
        return ecrecover(hash, v, r, s) == who;
    }
  }