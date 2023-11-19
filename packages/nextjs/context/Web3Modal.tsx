"use client";

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'

import { WagmiConfig } from 'wagmi'
import { 
  scrollSepolia, sepolia, hardhat, baseGoerli, mantleTestnet
 } from 'viem/chains'

// 1. Get projectId
const projectId = '87b19285bd7e81f2a2dc76728f6eb331'

// 2. Create wagmiConfig
const metadata = {
  name: 'meETH',
  description: 'Domain Service',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [scrollSepolia, sepolia, mantleTestnet, baseGoerli, hardhat]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains })

export function Web3Modal({ children }) {
  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
}