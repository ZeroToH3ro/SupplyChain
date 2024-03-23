import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

//INTERNAL IMPORT
import tracking from "./Tracking.json";
const ContractAddress = "0x84F7DAE20121d2d06f74c3e506A6F9D403A5E14d";
const ContractAbi = tracking.abi;

//FETCHING SMART CONTRACT
const fetchContract = (signerOrProvider) =>
    new ethers.Contract(ContractAddress, ContractAbi, signerOrProvider);

export const TrackingContext = React.createContext();;

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
            //TODO: what is JsonRpcProvider ?
            const provider = new ethers.providers.JsonRpcProvider();
            const contract = fetchContract(provider);

            const shipments = await contract.getAllTransactions();
            const allShipments = shipments.map((shipment) => ({
                sender: shipment.sender,
                receiver: shipment.receiver,
                price: ethers.utils.formatEther(shipment.price.toString()),
                pickupTime: shipment.pickupTime.toNumber(),
                deliveryTime: shipment.deliveryTime.toNumber(),
                distance: shipment.distance.toNumber(),
                isPaid: shipment.isPaid,
                status: shipment.status,
            }));

            return allShipments;
        } catch (error) {
            console.log("error", error);
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
            const shipment = await contract.getShipment(account[0], index * 1);

            const SingleShiplent = {
                sender: shipment[0],
                receiver: shipment[1],
                pickupTime: shipment[2].toNumber(),
                deliveryTime: shipment[3].toNumber(),
                distance: shipment[4].toNumber(),
                price: ethers.utils.formatEther(shipment[5].toString()),
                status: shipment[6],
                isPaid: shipment[7]
            };

            return SingleShiplent;
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
                methods: "eth_accounts"
            });

            setCurrentUser(accounts[0]);
        } catch (error) {
            console.log("error", error);
        }
    }

    useEffect(() => {
        checkIfWalletConnected();
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