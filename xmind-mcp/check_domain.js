const ethers = require('ethers');

const provider = new ethers.JsonRpcProvider('https://evm-t3.cronos.org/');
const contractAddress = '0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0';

const abi = [
  'function name() view returns (string)',
  'function version() view returns (string)',
  'function DOMAIN_SEPARATOR() view returns (bytes32)'
];

const contract = new ethers.Contract(contractAddress, abi, provider);

(async () => {
  try {
    const name = await contract.name();
    const version = await contract.version();
    const domainSep = await contract.DOMAIN_SEPARATOR();
    
    console.log('EIP-712 Domain:');
    console.log('  name:', name);
    console.log('  version:', version);
    console.log('  DOMAIN_SEPARATOR:', domainSep);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
