const assert = require('assert');
const moment = require('moment');

const ganache = require('ganache-cli');
const Web3 = require('web3');

const compiledAuction = require('../build/DutchAuction.json');

const provider = ganache.provider();
const web3 = new Web3(provider);

let startingPrice = 100000000;

function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}

const Mine = async () => {
  await web3.currentProvider.send({
    jsonrpc: '2.0',
    method: 'evm_mine',
    params: [],
    id: 0,
  }, () => { });
}

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  let startTime = parseInt(moment(new Date()).add(2, 's').toDate().getTime() / 1000);
  let endTime = parseInt(moment(new Date()).add(5, 's').toDate().getTime() / 1000);
  auction = await new web3.eth.Contract(compiledAuction.abi)
    .deploy({data: compiledAuction.evm.bytecode.object, arguments: [startingPrice,startTime,endTime]})
    .send({from: accounts[0], gas: '5000000'});
});

describe('DutchAuction', function() {
  this.timeout(8 * 1000);

  it('deploys', () => {
    assert.ok(auction.options.address);
  });

  it('Current price is starting price before starting time.', async () => {
    let currentPrice = await auction.methods.getCurrentPrice().call();
    assert.equal(currentPrice, startingPrice);
  });

  it('Cannot bid before starting time.', async () => {
    let passedCheck = false;
    try {
        await auction.methods.bid().send({from: accounts[1], value: startingPrice.toString()});
        passedCheck = true;
    } catch(err) {
        assert(err);
    }
    if(passedCheck) assert(false);
  });

  it('Can bid while active.', async () => {
    await sleep(2);
    await Mine();

    await auction.methods.bid().send({from: accounts[1], value: startingPrice.toString()});
  });

  it('Bidding Completes Auction.', async () => {
    await sleep(2);
    await Mine();
    await auction.methods.bid().send({from: accounts[1], value: startingPrice.toString()});

    let isSold = await auction.methods.isSold().call();
    assert(isSold);

    let salePrice = await auction.methods.salePrice().call();
    assert.equal(salePrice, startingPrice);

  });

  it('Cannot double bid.', async () => {
    await sleep(2);
    await Mine();
    await auction.methods.bid().send({from: accounts[1], value: startingPrice.toString()});

    let passedCheck = false;
    try {
        await auction.methods.bid().send({from: accounts[2], value: startingPrice.toString()});
        passedCheck = true;
    } catch(err) {
        assert(err);
    }
    if(passedCheck) assert(false);
  });

  it('Bidder gets & can access item.', async () => {
    await sleep(2);
    await Mine();
    await auction.methods.bid().send({from: accounts[1], value: startingPrice.toString()});
    await auction.methods.getItem().call({from: accounts[1]});

    let isSold = await auction.methods.isSold().call();
    assert(isSold);
  });

  it('Non-bidder cannot access item.', async () => {
    await sleep(2);
    await Mine();
    await auction.methods.bid().send({from: accounts[1], value: startingPrice.toString()});

    let passedCheck = false;
    try {
        await auction.methods.getItem().call({from: accounts[2]});
        passedCheck = true;
    } catch(err) {
        assert(err);
    }
    if(passedCheck) assert(false);
  });

  it('Price goes to 0 at end.', async () => {
    await sleep(5);
    await Mine();

    let currentPrice = await auction.methods.getCurrentPrice().call();
    assert.equal(currentPrice, '0');
  });

  it('Cannot bid after end date.', async () => {
    await sleep(5);
    await Mine();

    let passedCheck = false;
    try {
        await auction.methods.bid().send({from: accounts[2], value: startingPrice.toString()});
        passedCheck = true;
    } catch(err) {
        assert(err);
    }
    if(passedCheck) assert(false);
  });

  it('Price decreases to value x after time.', async () => {
    await sleep(3);
    await Mine()

    let currentPrice = await auction.methods.getCurrentPrice().call();
    assert.equal(currentPrice, parseInt(startingPrice * 2 / 3));

    await auction.methods.bid().send({from: accounts[1], value: currentPrice.toString()});
  });

  it('Money collected on bid.', async () => {
    await sleep(2);
    await Mine();

    await auction.methods.bid().send({from: accounts[1], value: startingPrice.toString()});
    
    let balance = await web3.eth.getBalance(auction.options.address);
    assert.equal(balance, startingPrice);
  });
});
