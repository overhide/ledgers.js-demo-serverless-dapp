/**
 * Utilities to help with all the other components
 */
import {Accounts} from 'web3-eth-accounts';

/** initialization **/

let accounts = new Accounts('http://localhost:8545');

let admin = {}; // admin from Azure

/**
 * @param {} newAdmin - from Azure
 */
export function setAdmin(newAdmin) {
  admin = newAdmin;
  console.log('new admin :: ' + JSON.stringify(admin, null, 2));
}

/**
 * @returns {} admin from Azure
 */
export function getAdmin() {
  return admin;
}

/**
 * Creates a new Ethereum account
 * 
 * @returns {address:.., privateKey;..} the new account as per web3 lib
 */
export function getNewAccount() {
  return accounts.create();
}

/**
 * @param {string} privateKey - to sign with
 * 
 * @returns {messageHash, r, s, v} of signed (make pretend) challenge
 */
export function makePretendChallengeAndSign(privateKey) {
  var challenge = new String(new Date() / 1000) // make pretend challenge
  var { messageHash, r, s, v } = accounts.sign(challenge, privateKey);
  v = parseInt(v);
  return { messageHash, r, s, v };
}
