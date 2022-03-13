const fs = require('fs');
const moment = require('moment');

const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');

const compiledAuction = require('./build/DutchAuction.json');

const web3 = new Web3('http://localhost:8545');

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log('Deploying from : ', accounts[0]);

  let startTime = parseInt(moment(new Date()).add(10, 's').toDate().getTime() / 1000);
  let endTime = parseInt(moment(new Date()).add(360, 's').toDate().getTime() / 1000);
  let startingPrice = 10000000000;
  const result = await new web3.eth.Contract(compiledAuction.abi)
    .deploy({data: compiledAuction.evm.bytecode.object, arguments: [startingPrice,startTime,endTime]})
    .send({gas: '5000000', from: accounts[0]});

  console.log('ABI : ', JSON.stringify(compiledAuction.abi));
  console.log('Deployed to : ', result.options.address);

  fs.writeFile('build/dutchAuction.address.json', JSON.stringify({"address": result.options.address}), err => {
    if(err) {
      console.error(err);
      return;
    }
  });

  //provider.engine.stop();
};
deploy();
