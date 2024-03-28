import React, {useEffect, useState} from "react";
import Web3Modal from "web3modal";
import {ethers} from "ethers";

//INTERNAL IMPORT
import tracking from "./Tracking.json";

const ContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ContractAbi = tracking.abi;

//FETCHING SMART CONTRACT
const fetchContract = (signerOrProvider) =>
    new ethers.Contract(ContractAddress, ContractAbi, signerOrProvider);

export const TrackingContext = React.createContext();

export const TrackingProvider = ({ children }) => {
    //STATE VARIABLE
    const DappName = "Product Tracking Dapp";
    const [currentUser, setCurrentUser] = useState("");

    const createShipment = async (items) => {
        console.log("items", items);
        const { receiver, pickupTime, distance, price } = items;

        try {
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);
            const createItem = await contract.createShipment(
                receiver,
                new Date(pickupTime).getTime(),
                distance,
                ethers.utils.parseUnits(price, 18),
                {
                    value: ethers.utils.parseUnits(price, 18)
                }
            );
            await createItem.wait();
            console.log("createItem", createItem);
        } catch (error) {
            console.log("error", error);
        }
    }

    const getAllShipment = async () => {
        try {
            // TODO: what is JsonRpcProvider ?
            // JsonRpcProvider is a class provided by ethers.js, a popular JavaScript library for interacting with the Ethereum blockchain.
            // In the context of ethers.js, a JSON-RPC provider is an object that facilitates communication between your application
            // and an Ethereum node via JSON-RPC (Remote Procedure Call) protocol. JSON-RPC is a stateless,
            // lightweight remote procedure call (RPC) protocol that uses JSON for encoding request and response data.
            const provider = new ethers.providers.JsonRpcProvider();
            const contract = fetchContract(provider);

            const shipments = await contract.getAllTransactions();
            console.log("shipments", shipments);
            return shipments.map((shipment) => ({
                sender: shipment.sender,
                receiver: shipment.receiver,
                price: ethers.utils.formatEther(shipment.price.toString()),
                pickupTime: shipment.pickupTime.toNumber(),
                deliveryTime: shipment.deliveryTime.toNumber(),
                distance: shipment.distance.toNumber(),
                isPaid: shipment.isPaid,
                status: shipment.status,
            }));
        } catch (error) {
            console.log("error shipment", error);
        }
    }

    const getShipmentsCount = async () => {
        try {
            if (!window.ethereum) return "Install Metamask";

            const accounts = await window.ethereum.request({
                method: "eth_accounts",
            });

            const provider = new ethers.providers.JsonRpcProvider();
            const contract = fetchContract(provider);
            const shipmentsCount = await contract.getShipmentsCount(accounts[0]);
            return shipmentsCount.toNumber();
        } catch (error) {
            console.log("error", error);
        }
    }

    const completeShipment = async (completeShip) => {
        console.log(completeShip);

        const { receiver, index } = completeShip;
        try {
            if (!window.ethereum) return "Install Metamask";
            const accounts = await window.ethereum.request({
                method: "eth_accounts"
            });
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);

            const transaction = await contract.completeShipment(
                accounts[0],
                receiver,
                index,
                {
                    gasLimit: 300000,
                }
            );

            transaction.wait();
            console.log("transaction", transaction);
        } catch (error) {
            console.log("error", error);
        }
    }

    const getShipment = async (index) => {
        console.log(index * 1);

        try {
            if (!window.ethereum) return "Install Metamask";

            const accounts = await window.ethereum.request({
                method: "eth_accounts",
            });

            const provider = new ethers.providers.JsonRpcProvider();
            const contract = fetchContract(provider);
            const shipment = await contract.getShipment(accounts[0], index * 1);

            return {
                sender: shipment[0],
                receiver: shipment[1],
                pickupTime: shipment[2].toNumber(),
                deliveryTime: shipment[3].toNumber(),
                distance: shipment[4].toNumber(),
                price: ethers.utils.formatEther(shipment[5].toString()),
                status: shipment[6],
                isPaid: shipment[7]
            };
        } catch (error) {
            console.log("error", error);
        }
    }

    const startShipment = async (getProduct) => {
        const { receiver, index } = getProduct;

        try {
            if (!window.ethereum) return "Install Metamask";

            const accounts = await window.ethereum.request({
                method: "eth_accounts",
            });

            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);
            const shipment = await contract.startShipment(
                accounts[0],
                receiver,
                index * 1,
            )

            shipment.wait();
            console.log("shipment", shipment);
        } catch (error) {
            console.log("error", error);
        }
    }

    //CHECK WALLET CONNECTION
    const checkIfWalletConnected = async () => {
        try {
            if (!window.ethereum) return "Install MetaMask";

            const accounts = await window.ethereum.request({
                method: "eth_accounts"
            });

            if (accounts.length) {
                setCurrentUser(accounts[0]);
            } else {
                return "No Account";
            }
        } catch (error) {
            console.log("error", error);
        }
    }

    //CONNECT WALLET FUNCTION
    const connectWallet = async () => {
        try {
            if (!window.ethereum) return "Install Metamask";

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts"
            });

            setCurrentUser(accounts[0]);
        } catch (error) {
            console.log("error connect wallet", error);
        }
    }

    useEffect(() => {
        checkIfWalletConnected().then(r => console.log("wallet is connected"));
    }, []);

    return (
        <TrackingContext.Provider
            value={{
                connectWallet,
                createShipment,
                getAllShipment,
                completeShipment,
                getShipment,
                startShipment,
                getShipmentsCount,
                DappName,
                currentUser
            }}
        >
            {children}
        </TrackingContext.Provider>
    )
}
