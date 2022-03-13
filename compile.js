const path = require('path');
const fs = require('fs-extra');

const solc = require('solc');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const auctionContract = path.resolve(__dirname, 'contracts', 'DutchAuction.sol');
const source = fs.readFileSync(auctionContract, 'utf8');


var input = {
  language: 'Solidity',
  sources: {
    'DutchAuction.sol': {
      content: source
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*']
      }
    }
  }
};

var output = JSON.parse(solc.compile(JSON.stringify(input)));

fs.ensureDirSync(buildPath);

for (let contract in output.contracts["DutchAuction.sol"]) {
  fs.outputJsonSync(path.resolve(buildPath, contract + '.json'), output.contracts["DutchAuction.sol"][contract])
}
