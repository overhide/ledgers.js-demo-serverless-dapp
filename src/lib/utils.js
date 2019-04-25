/**
 * Utilities to help with all the other components
 */

import {Accounts} from 'web3-eth-accounts';

let accounts = new Accounts('http://localhost:8545');

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
