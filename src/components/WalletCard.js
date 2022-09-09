import { useState, useEffect } from 'react'

const WalletCard = () => {
    const [errorMessage, setErrorMessage] = useState(null)
    const [defaultAccount, setDefaultAccount] = useState(null)
    const [userBalance, setUserBalance] = useState(null)
    const [connectButtonText, setConnectButtonText] = useState('Connect Wallet')

    const connectWalletHandler = async () => {
        if (window.ethereum) {
            try {
                const accounts = window.ethereum.request({
                    method: 'eth_requestAccounts'
                })
                setDefaultAccount(accounts[0])
            } catch (err) {
                setErrorMessage(err.message)
            }
        } else {
            setErrorMessage('Install Metamask')
        }
    }

    const accountChangeHandler = (newAccount) => {
        setDefaultAccount(newAccount)
        getUserBalance(newAccount)
    }

    const getUserBalance = (address) => {

    }

    useEffect(() => {
        if (window.ethereum) {
            setDefaultAccount(window.ethereum.selectedAddress)
            console.log(window.ethereum.selectedAddress)
        }
    }, [])
    
    window.ethereum.on('accountsChanged', (accounts) => {
        })

    window.ethereum.on('disconnect', () => {
        setDefaultAccount(null)
    });


    return (
        <div className='wallet-card'>
            {defaultAccount ? (
                <>
                    <span>bob</span>
                </>
            ) : (
                <button onClick={connectWalletHandler}>{connectButtonText}</button>
            )}
        </div>
    )
}
export default WalletCard