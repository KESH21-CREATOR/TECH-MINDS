import React, { useState, useEffect } from "react";
import { Wallet, Check, AlertCircle, ExternalLink, Power } from "lucide-react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const MetaMaskButton: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnected = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
          setChainId(currentChainId);
        } else {
          setAccount(null);
        }
      } catch (err) {
        console.warn("MetaMask connection check error:", err);
      }
    }
  };

  useEffect(() => {
    checkConnected();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });

      window.ethereum.on("chainChanged", (newChainId: string) => {
        setChainId(newChainId);
      });
    }
  }, []);

  const connectWallet = async () => {
    setError(null);
    if (!window.ethereum) {
      setShowModal(true);
      return;
    }

    try {
      setConnecting(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
        setChainId(currentChainId);

        // Check if on Hardhat Local (31337 / 0x7a69)
        if (currentChainId !== "0x7a69" && currentChainId !== "0x539") {
          trySwitchToHardhat();
        }
      }
    } catch (err: any) {
      console.error("MetaMask connection error:", err);
      setError(err.message || "Failed to connect to MetaMask.");
    } finally {
      setConnecting(false);
    }
  };

  const trySwitchToHardhat = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x7a69" }]
      });
    } catch (switchError: any) {
      // Chain not added yet -> Add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x7a69",
                chainName: "Hardhat Local (CredentialChain)",
                nativeCurrency: {
                  name: "Ethereum",
                  symbol: "ETH",
                  decimals: 18
                },
                rpcUrls: ["http://127.0.0.1:8545"]
              }
            ]
          });
        } catch (addError) {
          console.error("Error adding Hardhat network to MetaMask:", addError);
        }
      }
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  const isHardhat = chainId === "0x7a69" || chainId === "0x539";

  return (
    <>
      {account ? (
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-brand-500/30 rounded-xl text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-slate-200">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
            {isHardhat ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-500/20 text-brand-300">
                Hardhat
              </span>
            ) : (
              <button
                onClick={trySwitchToHardhat}
                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                title="Click to switch MetaMask to Hardhat Local (8545)"
              >
                Switch to EVM
              </button>
            )}
          </div>
          <button
            onClick={disconnectWallet}
            className="p-2 text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 rounded-xl transition"
            title="Disconnect MetaMask"
          >
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={connecting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-orange-600/20 to-amber-600/20 hover:from-orange-600/30 hover:to-amber-600/30 border border-orange-500/40 text-orange-200 hover:text-white transition shadow-sm"
        >
          <Wallet className="w-3.5 h-3.5 text-orange-400" />
          <span>{connecting ? "Connecting..." : "Connect MetaMask (Optional)"}</span>
        </button>
      )}

      {/* Modal if MetaMask not installed */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">MetaMask Not Detected</h3>
                <p className="text-xs text-slate-400">Browser extension required for Web3 wallet</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              MetaMask is <strong>optional</strong> for this demo! CredentialChain is already connected to the local <strong>Hardhat EVM node</strong> using an automated institutional signer.
            </p>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs">
              <div className="text-slate-400 text-[11px] font-bold">Hardhat Local Configuration:</div>
              <div className="font-mono text-[11px] text-slate-300">• Network Name: Hardhat Local</div>
              <div className="font-mono text-[11px] text-slate-300">• RPC URL: http://127.0.0.1:8545</div>
              <div className="font-mono text-[11px] text-slate-300">• Chain ID: 31337</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
              >
                Continue in Demo Mode
              </button>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition flex items-center gap-1.5"
              >
                <span>Install MetaMask</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
