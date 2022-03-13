const fs = require('fs');

const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');

const compiledAuction = require('./build/DutchAuction.json');

const web3 = new Web3('http://localhost:8545');

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log('Deploying from : ', accounts[0]);

  let now = parseInt((new Date()).getTime() / 1000);
  const result = await new web3.eth.Contract(compiledAuction.abi)
    .deploy({data: compiledAuction.evm.bytecode.object, arguments: [0,0,0]}) // TODO: fix args
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
