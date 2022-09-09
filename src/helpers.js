import axios from 'axios'

const getAbi = async (address) => {
    const ETHERSCAN_API_KEY = process.env.REACT_APP_ETHERSCAN_API

    const url = `https://api.arbiscan.io/api?module=contract&action=getabi&address=${address}&apikey=${ETHERSCAN_API_KEY}`
    const res = await axios.get(url)
    const abi = JSON.parse(res.data.result)

    return abi
}

const getPoolImmutables = async (poolContract) => {
    const [token0, token1, fee] = await Promise.all([
        poolContract.methods.token0().call(),
        poolContract.methods.token1().call(),
        poolContract.methods.fee().call()
    ])

    return {
        token0,
        token1,
        fee
    }
}

export {
    getAbi,
    getPoolImmutables
}