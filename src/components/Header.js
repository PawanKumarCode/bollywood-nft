import '../styles/App.css';
import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import Nft from '../utils/NFT.json';
import { InfinitySpin } from 'react-loader-spinner';

const CONTRACT_ADDRESS = "0x10248Ff1e5F27662f9f47E50FD5a5E5984De8950";
const MUMBAI_CHAINID = "0x13881";
const COLLECTION_ADDRESS = "https://testnets.opensea.io/collection/pawankumarart-v4";
const Header = (props) => {

    //a state varuable we use to store our user's public wallet. Use import useState to use it here
    const [currentAccount, setCurrentAccount] = useState("");

    //use state for totalnumber of nfts
    const [totalNFT, setTotalNFT] = useState(0);

    //use state for loading to show loading renderer while the 
    const [loading, setLoading] = useState(false);



    // connectWallet method

    const connectWallet = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                alert("get MetaMask!");
                return;
            }

            //check if we are on correct network polygon mumbai network
            const chainId = await ethereum.request({ method: 'eth_chainId' });
            console.log("Connected to  chain " + chainId);

            if (chainId !== MUMBAI_CHAINID) {
                alert("you are not connected to the Mumbai Test Network!");
                return;
            }

            //request access to the account 
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });

            //print public address once we have it 
            console.log("Coonected", accounts[0]);
            setCurrentAccount(accounts[0]);

            //For the user who connects his/her wallet for the first time
            setupEventListener();


        } catch (error) {
            console.log(error);
        }
    }


    /*
  
    Function setupEventListener
    */

    const setupEventListener = async () => {
        // Most of this looks the same as our function askContractToMintNft
        try {
            const { ethereum } = window;

            if (ethereum) {
                // Same stuff again
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, Nft.abi, signer);

                // THIS IS THE MAGIC SAUCE.
                // This will essentially "capture" our event when our contract throws it.
                // If you're familiar with webhooks, it's very similar to that!
                connectedContract.on("NewNFTMinted", (from, tokenId) => {
                    console.log(from, tokenId.toNumber())
                    alert(`Hey there! We've minted your NFT and sent it to your wallet. 
          It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: 
          https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
                });

                console.log("Setup event listener!")

            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error)
        }
    }



    /* 
     Get total NFTs minted so far
     */

    const totalNftMinted = async () => {
        try {
            const { ethereum } = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, Nft.abi, signer);
                let totalNfts = await connectedContract.getTotalNftMinted();
                setTotalNFT(totalNfts.toNumber());
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }
    }


    /*
    Ask contract to mint 
    */
    const askContractToMintNft = async () => {
        try {
            const { ethereum } = window;
            if (ethereum) {
                //start loader sppiner animation
                setLoading(true);
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, Nft.abi, signer);

                console.log("Going to pop wallet now to pay gas...");
                // {
                //     loading === true ? render
                // }
                let nftTxn = await connectedContract.makeNFT();


                console.log("Mining...please wait");
                await nftTxn.wait();
                //stop loader sppiner animation
                setLoading(false);
                let totalNfts = await connectedContract.getTotalNftMinted();

                setTotalNFT(totalNfts.toNumber());
                console.log("Total so far", totalNFT);
                console.log(`Mined, see transaction: https://mumbai.polygonscan.com/tx/${nftTxn.hash}`);
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            //some error occured stop loading animation
            setLoading(false);
            console.log(error);
        }
    }

    // Render Methods
    const renderNotConnectedContainer = () => (
        <div>
            <button onClick={connectWallet} className="cta-button connect-wallet-button">
                Connect to Wallet
            </button>
        </div>
    );


    //this runs our function when the page loads
    useEffect(() => {

        /*
      check if the user's wallet is already connected
      */
        const checkIfWalletIsConnected = async () => {

            //First make sure we have access to the windw.ethereum
            const { ethereum } = window;
            if (!ethereum) {
                console.log("make sure you have metamask!");
                return;
            } else {
                console.log("We have the ethereum object", ethereum);
            }

            //check if we are on correct network polygon mumbai network
            const chainId = await ethereum.request({ method: 'eth_chainId' });
            console.log("Connected to  chain " + chainId);

            if (chainId !== MUMBAI_CHAINID) {
                alert("you are not connected to the Mumbai Test Network!");
                return;
            }


            //check if we are authorised to access the user's wallet
            const accounts = await ethereum.request({ method: 'eth_accounts' });

            //user can have multiple authorised accounts, we grab the first one if its there

            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log("Found an authorized account:", account);
                setCurrentAccount(account);



                //for the situation where a user has already connected and authorized their wallet and comes back to out site
                setupEventListener();
            } else {
                console.log("No authorized account found");
            }

        }
        checkIfWalletIsConnected();
        totalNftMinted();




    }, [loading])



    return (
        <div className="header-container">
            <p className="header gradient-text">My NFT Collection</p>
            <p className="sub-text">
                Each unique. Each beautiful. Discover your NFT today.
            </p >

            <p className="sub-text mint-count "> Total NFT minted so far {totalNFT}/50 </p>
            <button onClick={() => { window.open(COLLECTION_ADDRESS, "_blank") }}
                className="opensea-button  cta-button  "> View Collection on OpenSea</button>

            {loading ? <div> <p className="sub-text">Minting</p> <InfinitySpin color="grey" /> </div> :

                currentAccount === ""
                    ? renderNotConnectedContainer()
                    : (
                        <div>
                            <button onClick={askContractToMintNft} className="cta-button mint-button">
                                Mint NFT
                            </button>
                        </div>


                    )

            }






        </div>
    );




}

export default Header;