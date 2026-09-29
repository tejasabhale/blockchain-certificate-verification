import { ethers } from "ethers";
import CertificateRegistryArtifact from "../abi/CertificateRegistry.json";

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";
export const RPC_URL = import.meta.env.VITE_RPC_URL || "http://127.0.0.1:8545";

const ABI = CertificateRegistryArtifact.abi || CertificateRegistryArtifact;

/**
 * Returns a read-only ethers JsonRpcProvider for querying the contract
 * without requiring the user to have MetaMask or a connected wallet.
 */
export function getReadOnlyProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

/**
 * Returns a read-only instance of the CertificateRegistry contract.
 */
export function getReadOnlyContract() {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address is not configured. Set VITE_CONTRACT_ADDRESS in .env");
  }
  const provider = getReadOnlyProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
}

/**
 * Returns a browser provider connected to MetaMask/injected wallet.
 */
export function getBrowserProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }
  return new ethers.BrowserProvider(window.ethereum);
}

/**
 * Connects to MetaMask and returns the active signer and account address.
 */
export async function connectWallet() {
  const provider = getBrowserProvider();
  if (!provider) {
    throw new Error("MetaMask is not installed. Please install MetaMask to issue certificates.");
  }
  const accounts = await provider.send("eth_requestAccounts", []);
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts found in MetaMask.");
  }
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  return { signer, address };
}

/**
 * Returns a writable contract instance connected to the user's MetaMask signer.
 */
export async function getContractWithSigner() {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address is not configured. Set VITE_CONTRACT_ADDRESS in .env");
  }
  const provider = getBrowserProvider();
  if (!provider) {
    throw new Error("MetaMask is not installed.");
  }
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}

/**
 * Fetches the contract owner address.
 */
export async function getContractOwner() {
  const contract = getReadOnlyContract();
  return await contract.owner();
}

/**
 * Helper to shorten an Ethereum address (e.g. 0x1234...abcd).
 */
export function shortenAddress(address) {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}
