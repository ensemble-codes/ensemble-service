import { Injectable } from '@nestjs/common';
import { AbiService } from 'apps/ensemble-service/src/abi/abi.service';
import { ContractEntity } from 'libs/shared/src/workflows/entities/contract.entity';
import { ethers } from 'ethers';
import { getNetwork } from './networks';

@Injectable()
export class BlockchainProviderService {
  private providers: { [networkName: string]: ethers.providers.JsonRpcProvider } = {};
  
  private networkUrls = {
    fuse: process.env.PROVIDER_URL_FUSE,
    sepolia: process.env.PROVIDER_URL_SEPOLIA,
    base_sepolia: process.env.PROVIDER_URL_BASE_SEPOLIA,
    op_sepolia: process.env.PROVIDER_URL_OP_SEPOLIA,
    avalanche_fuji: process.env.PROVIDER_URL_AVALANCHE_FUJI,
  }

  constructor(
    private readonly abiService: AbiService,
  ) {
    for (const [network, url] of Object.entries(this.networkUrls)) {
      if (url) {
        console.log(`Initializing provider for ${network}.`);
        this.providers[network] = new ethers.providers.JsonRpcProvider(url);
        console.log(`Initialized provider for ${network} with url endpoint: ${url}.`);
      } else {
        console.warn(`RPC URL for ${network} is not set`);
      }
    }
  }


  getProvider(networkName: string): ethers.providers.JsonRpcProvider {
    if (!this.networkUrls[networkName]) {
      const errorMessage = `RPC URL for ${networkName} is not set`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return this.providers[networkName];
  }

  getChainId(networkName: string): number {
    const network = getNetwork(networkName);
    return network.chainId
  }


  async loadContract(contractName: string, contracts: ContractEntity[]) {
    console.log(`loading contract ${contractName}`);
    const contractEntity = contracts.find(c => c.name === contractName);
    const contractABI = await this.abiService.findByName(contractEntity.abi)
    const provider = this.getProvider(contractEntity.network);
    const contract = new ethers.Contract(contractEntity.address, contractABI.abi, provider);
    console.log(`contract ${contractName} loaded, address: ${contractEntity.address}, network: ${contractEntity.network}`);

    return contract
  }

  async fetchTokenDetails(tokenAddress: string, network: string) {
    const provider = this.getProvider(network);
    const chainId = this.getChainId(network);
    const tokenContract = new ethers.Contract(tokenAddress, ['function name() view returns (string)', 'function symbol() view returns (string)', 'function decimals() view returns (uint8)'], provider);
    const name = await tokenContract.name();
    const symbol = await tokenContract.symbol();
    const decimals = Number(await tokenContract.decimals());
    return { name, symbol, decimals, address: tokenAddress, chainId }
  }
}
