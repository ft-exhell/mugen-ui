import { useState, useEffect } from "react";
import { ethers } from "ethers";
import BigNumber from 'bignumber.js';
import axios from "axios";
import getWeb3 from "./getWeb3";
import MugenContract from './contracts/MugenTreasury.json'
import usdcContract from './contracts/usdc.json'

import poolAbi from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import quoterAbi from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'

import { getAbi, getPoolImmutables } from './helpers'

import './App.css';

const ETHERSCAN_API_KEY=process.env.REACT_APP_ETHERSCAN_API_KEY

function App() {

  const [web3, setWeb3] = useState(undefined)
  const [mugenTreasury, setMugenTreasury] = useState(undefined)
  const [usdc, setUsdc] = useState(undefined)
  const [accounts, setAccounts] = useState([])
  const [mgnMintPrice, setMgnMintPrice] = useState(null)
  const [mgnMarketPrice, setMgnMarketPrice] = useState(null)
  const [usdcBalance, setUsdcBalance] = useState(null)
  const [usdcToApprove, setUsdcToApprove] = useState(0)
  const [usdcToMintWith, setUsdcToMintWith] = useState(0)

  const [depositCap, setDepositCap] = useState(undefined)
  const [valueDeposited, setValueDeposited] = useState(undefined)

  const [poolContract, setPoolContract] = useState(undefined)
  const [quoterContract, setQuoterContract] = useState(undefined)

  const getMugenUSDCPrice = async () => {
    const immutables = await getPoolImmutables(poolContract)

    const amountIn = ethers.utils.parseUnits('1', 18)

    const quotedAmountOut = await quoterContract.methods.quoteExactInputSingle(
      immutables.token1,
      '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      immutables.fee,
      amountIn,
      0
    ).call()

    const amountOut = ethers.utils.formatUnits(
      quotedAmountOut,
      6
    )

    return amountOut
  }

  const handleUsdcApproval = async (e) => {
    e.preventDefault()
    try {
      await usdc.methods.approve('0xf7bE8476AE27d27eBc236e33020150B23a86F3Dd', (new BigNumber(usdcToApprove).multipliedBy(new BigNumber(1e+6)).toFixed())).send({from: accounts[0]})
    } catch (err) {
      console.log(err.message)
    }
  }

  const handleUsdcMint = async (e) => {
    e.preventDefault()
    try {
      await mugenTreasury.methods['deposit(address,uint256)']('0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', (new BigNumber(usdcToMintWith).multipliedBy(new BigNumber(1e+6)).toFixed())).send({from: accounts[0]})

      const usdcBalance = await usdc.methods.balanceOf(accounts[0]).call()
      setUsdcBalance(usdcBalance)
    } catch (err) {
      console.log(err.message)
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();

        // Get the contracts instance.
        const mugenTreasury = new web3.eth.Contract(
          MugenContract,
          '0xf7bE8476AE27d27eBc236e33020150B23a86F3Dd'
        );
        const usdc = new web3.eth.Contract(
          usdcContract,
          '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'
        );

        const mgnMintPrice = await mugenTreasury.methods.pricePerToken().call()
        const usdcBalance = await usdc.methods.balanceOf(accounts[0]).call()

        const poolAddress = '0xCe3dC36Cd501C00f643a09f2C8d9b69Fb941bB74'
        const quoterAddress = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'

        const poolContract = new web3.eth.Contract(
          poolAbi.abi,
          poolAddress
        )

        const quoterContract = new web3.eth.Contract(
          quoterAbi.abi,
          quoterAddress
        )

        const immutables = await getPoolImmutables(poolContract)

    const amountIn = ethers.utils.parseUnits('1', 18)

    const quotedAmountOut = await quoterContract.methods.quoteExactInputSingle(
      immutables.token1,
      '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      immutables.fee,
      amountIn,
      0
    ).call()

    const amountOut = ethers.utils.formatUnits(
      quotedAmountOut,
      6
    )

        const depositCap = await mugenTreasury.methods.depositCap().call()
        const valueDeposited = await mugenTreasury.methods.valueDeposited().call()

        // Set web3, accounts, contracts and prices.
        setWeb3(web3)
        setAccounts(accounts)
        setMugenTreasury(mugenTreasury)
        setUsdc(usdc)
        setUsdcBalance(web3.utils.BN(usdcBalance).toString().slice(0, -6))
        setMgnMintPrice(mgnMintPrice.slice(0, 3) + '.' +  mgnMintPrice.substring(3))
        setPoolContract(poolContract)
        setQuoterContract(quoterContract)
        setMgnMarketPrice(amountOut.toString().slice(0, -4))
        setDepositCap(depositCap)
        setValueDeposited(valueDeposited)
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error.message);
      }
    };
  
    init();
  }, [])

  setInterval(async () => {
    if (mugenTreasury) {
      const mgnMintPrice = await mugenTreasury.methods.pricePerToken().call()
      const mgnMarketPrice = await getMugenUSDCPrice()

      setMgnMintPrice(mgnMintPrice.slice(0, 3) + '.' +  mgnMintPrice.substring(3))
      setMgnMarketPrice(mgnMarketPrice.toString().slice(0, -4))
    }
  }, 5000);

  return (
    <div className="App">
      <h3>Prices are auto updated every 5 seconds</h3>
      <p>Your account: {accounts[0]}</p>
      <p>MGN mint price: ${mgnMintPrice}</p>
      <p>MGN market price: ${mgnMarketPrice}</p>
      {depositCap &&<p>Deposit cap: ${parseFloat(ethers.utils.formatUnits(depositCap.toString(), 18)).toLocaleString('en')}</p>}
      <p>Deposit cap filled by {(valueDeposited / depositCap * 100).toFixed(2)}%</p>
      <p>Your USDC balance: {usdcBalance} USDC</p>
      <form>
        <label>
          <span>Amount USDC to Approve</span>
          <input 
            type='number'
            onChange={e => setUsdcToApprove(e.target.value)}
            value={usdcToApprove}
          ></input>
        </label>
        <button onClick={handleUsdcApproval}>Approve USDC for minting MGN</button>
      </form>
      <form>
        <label>
          <span>Amount USDC to Mint With</span>
          <input 
            type='number'
            onChange={e => setUsdcToMintWith(e.target.value)}
            value={usdcToMintWith}
          ></input>
        </label>
        <button onClick={handleUsdcMint}>Mint MGN</button>
      </form>
      <a href="https://app.uniswap.org/#/swap?chain=arbitrum&outputCurrency=0xFc77b86F3ADe71793E1EEc1E7944DB074922856e" target='blank' rel='noopener noreferrer'>Buy MGN</a>
    </div>
  );
}

export default App;
