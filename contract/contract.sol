pragma solidity ^0.4.25;

contract TollEnforce {

    address owner;
    
    uint public rewardValue;                                           // current reward in Wei when perpetrator nabbed by enforcer, paid out on GoodReport
    uint public minStakeValue;                                         // current bounty hunter stake in Wei for reporting perpetrator, returned on GoodReport or ExpiredReport
    uint public bountyTimePeriodSeconds;                               // how many seconds--since report--a bounty is active for
    
    struct Report {                                                    // bounty report by hunter
        bool isPending;                                                // is report still pending reconciliation?
        address payable bountyHunter;                                  // address of hunter
        uint bountyExpirationUnixTime;                                 // Unix time seconds when bounty will timeout
        uint carXCoordinate;                                           // X coordinate of car on map
        uint carYCoordinate;                                           // Y coordinate of car on map
        uint stakedValue;                                              // bounty hunter's stake in Wei, returned on GoodReport or ExpiredReport
        uint rewardValue;                                              // bounty hunter's reward in Wei, paid out on GoodReport
    }
    
    mapping (address => Report) public reports;                        // all current reports: car address to report
    address[] public currentReports;                                   // addresses of all reports since last expiration run
    
    mapping (bytes32 => uint) public payeeHashToLastPaymentUnixTime;   // sha256 of payee `<address>@<imparterTag>` to last payment considered
    mapping (address => uint) public carToZoneATimeoutUnixTime;        // map when zone A permit expires for cars
    mapping (address => uint) public carToZoneBTimeoutUnixTime;        // map when zone B permit expires for cars
    mapping (address => uint) public carToZoneCTimeoutUnixTime;        // map when zone C permit expires for cars
    address[] public cars;                                             // list all cars tracked
    
    event Topup(address indexed forCar, bytes32 byWhom, uint newZoneATimeout, uint newZoneBTimeout, uint newZoneCTimeout);

    event NewReport(address indexed forCar, uint carXCoordinate, uint carYCoordinate, uint zoneIndex);
    event BadReport(address indexed forCar);
    event GoodReport(address indexed forCar);
    event ExpiredReport(address indexed forCar);

    constructor() public {
        owner = msg.sender;
    }

    modifier isOwner() {
        require(owner == msg.sender);
        _;
    }

    // @param who - who signed
    // @param hash - of message: keccak256("\x19Ethereum Signed Message:\n", len(message), message)
    // @param v,r,s - signature tuple
    // @returns [true] if signature hash checks out for address
    modifier validate(address who, 
                      bytes32 hash, 
                      uint8 v, 
                      bytes32 r, 
                      bytes32 s) {
        require(ecrecover(hash, v, r, s) == who);
        _;
    }
    
    // setup admin values
    function admin(uint _rewardValue,
                   uint _minStakeValue,
                   uint _bountyTimePeriodSeconds) public isOwner {
        rewardValue = _rewardValue;
        minStakeValue = _minStakeValue;
        bountyTimePeriodSeconds = _bountyTimePeriodSeconds;
    }
  
    // @param forCar - which car the topup is for
    // @param byWhom - who made the topup payment: sha256 hash with format `<address>@<imparterTag>` where imparterTag is as per ledgers.js
    // @param newZoneTimeouts - Unix time seconds when zone permits expires forCar:  [zonaA, zoneB, zoneC]
    // @param carSig* - signature checking values, see 'validate' modifier
    function topup(address forCar, 
                   bytes32 byWhom, 
                   uint[] memory newZoneTimeouts, 
                   bytes32 carSigHash,
                   uint8 carSigV,
                   bytes32 carSigR,
                   bytes32 carSigS) public isOwner validate(forCar, carSigHash, carSigV, carSigR, carSigS) {
        require(newZoneTimeouts[0] > 0 || newZoneTimeouts[1] > 0 || newZoneTimeouts[2] > 0);
        payeeHashToLastPaymentUnixTime[byWhom] = now;
        if (carToZoneATimeoutUnixTime[forCar] == 0
            && carToZoneBTimeoutUnixTime[forCar] == 0
            && carToZoneCTimeoutUnixTime[forCar] == 0) {
            // car not tracked yet
            cars.push(forCar);
        }
        carToZoneATimeoutUnixTime[forCar] = newZoneTimeouts[0];
        carToZoneBTimeoutUnixTime[forCar] = newZoneTimeouts[1];
        carToZoneCTimeoutUnixTime[forCar] = newZoneTimeouts[2];
        emit Topup(forCar, byWhom, newZoneTimeouts[0], newZoneTimeouts[1], newZoneTimeouts[2]);
    }

    // @param forCar - which car to check
    // @returns Unix time seconds when zone A permit expires forCar
    function getZoneATimeout(address forCar) public view returns (uint) {
        return carToZoneATimeoutUnixTime[forCar];
    }
    
    // @param forCar - which car to check
    // @returns Unix time seconds when zone A permit expires forCar
    function getZoneBTimeout(address forCar) public view returns (uint) {
        return carToZoneBTimeoutUnixTime[forCar];
    }

    // @param forCar - which car to check
    // @returns Unix time seconds when zone A permit expires forCar
    function getZoneCTimeout(address forCar) public view returns (uint) {
        return carToZoneCTimeoutUnixTime[forCar];
    }
    
    // @param forCar - which car to check
    // @returns [true] of permitted
    function isPermittedInZoneA(address forCar) public view returns (bool) {
        if (carToZoneATimeoutUnixTime[forCar] == 0) return false;
        return carToZoneATimeoutUnixTime[forCar] > now;    
    }

    // @param forCar - which car to check
    // @returns [true] of permitted
    function isPermittedInZoneB(address forCar) public view returns (bool) {
        if (carToZoneBTimeoutUnixTime[forCar] == 0) return false;
        return carToZoneBTimeoutUnixTime[forCar] > now;    
    }

    // @param forCar - which car to check
    // @returns [true] of permitted
    function isPermittedInZoneC(address forCar) public view returns (bool) {
        if (carToZoneCTimeoutUnixTime[forCar] == 0) return false;
        return carToZoneCTimeoutUnixTime[forCar] > now;    
    }

    // msg.sender == bountyHunter
    // msg.value == stakedValue
    // @param carAddress - being reported
    // @param carXCoordinate - of car on map
    // @param carYCoordinate - of car on map
    // @param zoneIndex - 0 for zoneA, 1 for zoneB, 2 for zoneC, zone for coordinates 
    //   if zone mis-reported for coordinates; stakedValue will be lost upon reconciliation
    function doReport(address carAddress, 
                      uint carXCoordinate,
                      uint carYCoordinate,
                      uint zoneIndex) public payable {
        require(msg.value >= minStakeValue);
        require(!reports[carAddress].isPending);
        if (zoneIndex == 0) require(carToZoneATimeoutUnixTime[carAddress] < now);
        if (zoneIndex == 1) require(carToZoneBTimeoutUnixTime[carAddress] < now);
        if (zoneIndex == 2) require(carToZoneCTimeoutUnixTime[carAddress] < now);
        reports[carAddress] = Report(true, msg.sender, now + bountyTimePeriodSeconds, carXCoordinate, carYCoordinate, msg.value, rewardValue);
        currentReports.push(carAddress);
        emit NewReport(carAddress, carXCoordinate, carYCoordinate, zoneIndex);
    }

    // msg.sender == enforcer
    // @param carAddress - being reported
    // @param isGood - [true] if car found and ticketed
    //    A good report means:
    //    - reported car found at reported coordinates
    //    - reported coordinates do lie in reported zone (zone cannot be misreported)
    function reconcileReport(address carAddress,
                             bool isGood) public isOwner {
        require(reports[carAddress].isPending);  // report must exist
        if (isGood) {
            reports[carAddress].bountyHunter.send(reports[carAddress].stakedValue + reports[carAddress].rewardValue);        
            emit GoodReport(carAddress);
        } else {
            emit BadReport(carAddress);
        }
        delete reports[carAddress];  // remove report
    }

    // To be run periodically to expire reports.
    //
    // Cleans up reconciled and expired reports.
    function expireReports() public isOwner {
        uint newLength = 0;
        for (uint i = 0; i < currentReports.length; i++) {
            // reconciled
            if (!reports[currentReports[i]].isPending) {
                continue;
            }
            // expired
            if (reports[currentReports[i]].bountyExpirationUnixTime < now) {
                reports[currentReports[i]].bountyHunter.send(reports[currentReports[i]].stakedValue); // refund stake
                delete reports[currentReports[i]];
                emit ExpiredReport(currentReports[i]);
                continue;
            }
            // still pending report
            currentReports[newLength] = currentReports[i];
            newLength++;
        }
        // by now we removed all expired and reconciled reports
        currentReports.length = newLength;
    }

    // To be run periodically to purge cars
    function purgeCars() public isOwner {
        uint newLength = 0;
        for (uint i = 0; i < cars.length; i++) {
            if (carToZoneATimeoutUnixTime[cars[i]] > now 
                || carToZoneBTimeoutUnixTime[cars[i]] > now 
                || carToZoneCTimeoutUnixTime[cars[i]] > now) {
                cars[newLength] = cars[i];
                newLength++;
            } else {
                delete carToZoneATimeoutUnixTime[cars[i]];
                delete carToZoneBTimeoutUnixTime[cars[i]];
                delete carToZoneCTimeoutUnixTime[cars[i]];
            }
        }
        // by now we removed all expired cars-zone allotments
        cars.length = newLength;
    }
} 