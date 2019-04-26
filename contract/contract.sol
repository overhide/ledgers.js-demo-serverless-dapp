pragma solidity ^0.4.22;

contract TollEnforce {

  address owner;

  constructor() public {
      owner = msg.sender;
  }

  modifier isOwner() {
      require(owner == msg.sender);
      _;
  }

  // @param who - who signed, which car
  // @param hash - of message: keccak256("\x19Ethereum Signed Message:\n", len(message), message)
  // @param v,r,s - signature tuple
  // @returns [true] if signature hash checks out for address
  modifier validateCar(address who, bytes32 hash, uint8 v, bytes32 r, bytes32 s) {
      require(ecrecover(hash, v, r, s) == who);
      _;
  }

  
} 