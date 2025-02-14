"use client";

import { useClicker } from "../hooks/useClicker";
import { useLubActivity } from "../hooks/useLubActivity";
import { useAccount, useChainId, usePublicClient, useSwitchChain } from "wagmi";
import { useState, useEffect } from "react";
import {
  IoClose,
  IoWarning,
  IoHeart,
  IoStatsChart,
  IoHelpCircle,
} from "react-icons/io5";
import { FaGift } from "react-icons/fa";
import { useIdentityResolution } from "../hooks/useIdentityResolution";
import Image from "next/image";
import { useContractRead } from "wagmi";
import { CLICKER_ABI, CLICKER_ADDRESS } from "../config/contracts";
import WalletConnect from "./WalletConnect";

// Updated terminal-style component
const Terminal = ({ messages }: { messages: string[] }) => (
  <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 max-h-64 overflow-y-auto border border-gray-700">
    {messages.length === 0 ? (
      <div className="text-gray-500 italic">Spreading lub vibes...</div>
    ) : (
      messages.map((msg, i) => (
        <div key={i} className="mb-1">
          <span className="text-pink-500">❯</span>{" "}
          <span className="text-green-400">{msg}</span>
        </div>
      ))
    )}
  </div>
);

// Chain warning component
const ChainWarning = () => {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const needsSwitch = chainId !== 11155420; // OP Sepolia

  if (!needsSwitch) return null;

  const handleSwitch = async () => {
    try {
      await switchChain({ chainId: 11155420 });
    } catch (error) {
      console.error("Failed to switch chain:", error);
    }
  };

  return (
    <div className="bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
      <div className="flex items-center gap-2 mb-2">
        <IoWarning className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
        <span>Please switch to OP Sepolia testnet to gift lub</span>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleSwitch}
          className="w-full px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-colors flex items-center justify-center gap-2"
        >
          Switch to OP Sepolia
        </button>

        <div className="text-xs space-y-2">
          <p className="opacity-75">If the automatic switch doesnt work:</p>
          <ol className="list-decimal list-inside space-y-1 opacity-75">
            <li>Open Wallet app</li>
            <li>Tap the network selector (usually shows Ethereum)</li>
            <li>Tap Add or edit network</li>
            <li>Add custom network with these details:</li>
          </ol>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded p-2 font-mono text-xs">
            <p>Network Name: OP Sepolia</p>
            <p>RPC URL: https://sepolia.optimism.io</p>
            <p>Chain ID: 11155420</p>
            <p>Currency Symbol: ETH</p>
          </div>
          <p className="mt-2">
            Need testnet ETH?{" "}
            <a
              href="https://www.alchemy.com/faucets/optimism-sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              Get from OP Sepolia faucet →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

// Success message component
const SuccessMessage = ({
  hash,
  onClose,
}: {
  hash: string;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    />
    <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 text-center space-y-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <IoClose size={24} />
      </button>
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center">
          <IoHeart className="w-12 h-12 text-pink-500 animate-pulse" />
        </div>
      </div>
      <h2 className="text-2xl font-bold">Lub sent! 💕</h2>
      <p className="text-gray-600 dark:text-gray-400">
        Your love is now forever on the blockchain
      </p>
      <a
        href={`https://sepolia-optimistic.etherscan.io/tx/${hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-pink-500 hover:text-pink-600 dark:hover:text-pink-400"
      >
        View on Explorer →
      </a>
    </div>
  </div>
);

// Add tab type
type Tab = "send" | "stats" | "faq";

// FAQ Component
const FAQ = () => (
  <div className="space-y-4 text-sm">
    <div>
      <h4 className="font-medium text-center mb-2">What is lub-u? 💝</h4>
      <p className="text-gray-600 dark:text-gray-400 text-center">
        A spcial experiment combining organic clicks with on-chain ownership.
        Every lub counts towards the total of 69,420!
      </p>
    </div>
    <div>
      <h4 className="font-medium text-center mb-2">
        How does ownership work? 🤔
      </h4>
      <p className="text-gray-600 dark:text-gray-400 text-center">
        When we reach 69,420 total lub: • Offchain clicks represent the total
        allocated to treasury (upcoming agent + devs + dao) • Onchain lubs
        allocated according to recipients (self lub encouraged) •
      </p>
    </div>
    <div>
      <h4 className="font-medium text-center mb-2">
        What happens at 69,420? 🎯
      </h4>
      <p className="text-gray-600 dark:text-gray-400 text-center">
        For this test run the contract will be manually finalized (no more lub
        gifting) • This locks in everyones percentage and is subject to some
        final tweaks before the mainnet launch
      </p>
    </div>
    <div>
      <h4 className="font-medium text-center mb-2">How to participate? ❤️</h4>
      <p className="text-gray-600 dark:text-gray-400 text-center">
        1. Click the heart (free, offchain, open to anyone) 2. Gift lub (0.0001
        ETH each) 3. Spread the lub 4. Be chill, things will break/change, its a
        fun experiment
      </p>
    </div>
  </div>
);

// Stats Component
const Stats = ({
  distribution,
  userAddress,
}: {
  distribution: {
    community: number;
    remaining: number;
    total: number;
    max: number;
    pricePerLub: string;
  };
  userAddress?: string;
}) => {
  const { data: userShare } = useContractRead({
    address: CLICKER_ADDRESS[11155420] as `0x${string}`,
    abi: CLICKER_ABI,
    functionName: "getCurrentOwnershipShare",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return (
    <div className="space-y-6 text-center">
      {/* Progress to 69,420 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress to 69,420</span>
          <span>
            {((distribution.total / distribution.max) * 100).toFixed(2)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-pink-500 h-2.5 rounded-full transition-all duration-500"
            style={{
              width: `${(distribution.total / distribution.max) * 100}%`,
            }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {distribution.total.toLocaleString()} /{" "}
          {distribution.max.toLocaleString()} total lub
        </p>
      </div>

      {/* Ownership Distribution */}
      <div className="space-y-2">
        <h4 className="font-medium">Current Distribution</h4>
        <div className="flex justify-center gap-4 text-sm">
          <div>
            <div className="text-pink-500 font-medium">
              {distribution.community.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Community</div>
          </div>
          <div>
            <div className="text-gray-500 font-medium">
              {distribution.remaining.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Remaining</div>
          </div>
          {userAddress && userShare && (
            <div>
              <div className="text-green-500 font-medium">
                {(Number(userShare) / 100).toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500">Your Share</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Updated SendLub component to be more compact
const SendLub = ({
  maxPerWallet,
  onSend,
  pricePerLub,
}: {
  userRemainingClicks: bigint | undefined;
  maxPerWallet: bigint | undefined;
  onSend: (
    amount: number,
    recipient: string,
    platform?: string
  ) => Promise<`0x${string}`>;
  pricePerLub: string;
}) => {
  const [buyAmount, setBuyAmount] = useState(1);
  const [recipient, setRecipient] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<
    string | undefined
  >();
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { resolveIdentity, getPreferredProfile, profiles } =
    useIdentityResolution();

  // Watch transaction
  useEffect(() => {
    if (!txHash || !publicClient) return;

    setIsConfirming(true);
    const checkTransaction = async () => {
      try {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash as `0x${string}`,
        });
        if (receipt.status === "success") {
          // Keep success message for 5 seconds
          setTimeout(() => setTxHash(null), 5000);
        }
      } catch (error) {
        console.error("Transaction failed:", error);
      } finally {
        setIsConfirming(false);
      }
    };

    checkTransaction();
  }, [txHash, publicClient]);

  const selectedProfile = getPreferredProfile(selectedPlatform);
  const isValidAddress = recipient.startsWith("0x") && recipient.length === 42;
  const hasProfiles = profiles.length > 0;
  const isValid = isValidAddress || hasProfiles;

  // Calculate validation states - updated for new contract logic
  const maxPurchase = Number(maxPerWallet || BigInt(420));
  const isValidAmount = buyAmount > 0 && buyAmount <= maxPurchase;
  const isValidRecipient = !recipient || isValid;
  const canSend = isValidAmount && isValidRecipient;

  // Get error message - updated for new contract logic
  const getErrorMessage = () => {
    if (!isValidAmount) {
      if (buyAmount <= 0) return "Amount must be greater than 0";
      if (buyAmount > maxPurchase)
        return `You can only gift up to ${maxPurchase} lub at a time`;
    }
    if (!isValidRecipient) return "Invalid address/identity, try searching";
    return null;
  };

  const handleSearch = async () => {
    if (!recipient || recipient.length < 3) return;
    setIsSearching(true);
    await resolveIdentity(recipient);
    setIsSearching(false);
  };

  const handleSend = async () => {
    try {
      setError(null);
      const targetAddress = selectedProfile
        ? selectedProfile.address
        : isValidAddress
        ? recipient
        : address!;
      const hash = await onSend(buyAmount, targetAddress, selectedPlatform);
      setTxHash(hash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to gift lub");
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-sm">
          {error}
        </div>
      )}
      {txHash && (
        <SuccessMessage hash={txHash} onClose={() => setTxHash(null)} />
      )}

      <div className="space-y-4">
        {/* Amount Input */}
        <div className="flex items-center gap-2 justify-center">
          <input
            type="number"
            min="1"
            max={maxPurchase}
            value={buyAmount}
            onChange={(e) => setBuyAmount(Number(e.target.value))}
            className="w-20 px-2 py-1 text-black dark:text-white dark:bg-gray-800 rounded-md border border-pink-200 dark:border-pink-800 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            lub to
          </span>
        </div>

        {/* Stacked Recipient Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ENS, Lens, FC, or address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className={`flex-1 px-2 py-1 text-black dark:text-white dark:bg-gray-800 rounded-md border ${
                !recipient
                  ? "border-pink-200 dark:border-pink-800"
                  : isValidAddress
                  ? "border-green-500 dark:border-green-500"
                  : hasProfiles
                  ? "border-green-500 dark:border-green-500"
                  : "border-pink-200 dark:border-pink-800"
              } focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none`}
            />
            <button
              onClick={handleSearch}
              disabled={!recipient || recipient.length < 3 || isSearching}
              className="px-3 py-1 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white rounded-md transition-colors whitespace-nowrap"
            >
              {isSearching ? "🔍" : "Search"}
            </button>
          </div>

          <select
            value={selectedPlatform ?? "default"}
            onChange={(e) =>
              setSelectedPlatform(
                e.target.value === "default" ? undefined : e.target.value
              )
            }
            className="w-full px-2 py-1 text-black dark:text-white dark:bg-gray-800 rounded-md border border-pink-200 dark:border-pink-800 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
          >
            <option value="default">🌈 Any Platform</option>
            <option value="ens">🟦 ENS</option>
            <option value="lens">🟣 Lens</option>
            <option value="farcaster">🟪 Farcaster</option>
          </select>
        </div>

        {/* Profile Display */}
        {selectedProfile && (
          <div className="flex items-center gap-2 justify-center text-sm bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
            <div className="relative w-6 h-6">
              <Image
                src={selectedProfile.avatar}
                alt={selectedProfile.displayName}
                fill
                sizes="24px"
                className="rounded-full object-cover"
                unoptimized
              />
            </div>
            <span>{selectedProfile.displayName}</span>
            {selectedProfile.description && (
              <span className="text-gray-500">
                • {selectedProfile.description}
              </span>
            )}
          </div>
        )}

        {/* Error Message */}
        {!canSend && (
          <p className="text-xs text-red-500 dark:text-red-400 text-center">
            {getErrorMessage()}
          </p>
        )}

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!canSend || isConfirming}
          className="w-full px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center justify-center gap-2"
        >
          {isConfirming ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>Confirming...</span>
            </>
          ) : (
            <>
              <FaGift className="w-4 h-4" />
              <span>Gift {buyAmount} lub</span>
            </>
          )}
        </button>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Max {maxPurchase} lub at a time • {Number(pricePerLub).toFixed(4)} ETH
          per lub
        </p>
      </div>
    </div>
  );
};

// Main Modal Component
export default function LubModal({
  isOpen,
  onClose,
  totalClicks,
}: {
  isOpen: boolean;
  onClose: () => void;
  totalClicks: number;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("send");
  const { maxPerWallet, userRemainingClicks, buyClicks } = useClicker();
  const { events, getDistribution } = useLubActivity();
  const { isConnected, address } = useAccount();
  const chainId = useChainId();

  if (!isOpen) return null;

  const distribution = getDistribution(totalClicks);
  const isCorrectChain = chainId === 11155420;

  const handleSend = async (
    amount: number,
    recipient: string
  ): Promise<`0x${string}`> => {
    if (!isCorrectChain) throw new Error("Wrong network");
    try {
      const result = await buyClicks(amount, recipient);
      return result;
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <IoClose size={24} />
        </button>

        {/* Tabs */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setActiveTab("send")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === "send"
                ? "bg-pink-100 dark:bg-pink-900/50 text-pink-500"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <FaGift size={16} />
            <span className="text-sm">Send</span>
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === "stats"
                ? "bg-pink-100 dark:bg-pink-900/50 text-pink-500"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <IoStatsChart size={16} />
            <span className="text-sm">Stats</span>
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === "faq"
                ? "bg-pink-100 dark:bg-pink-900/50 text-pink-500"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <IoHelpCircle size={16} />
            <span className="text-sm">FAQ</span>
          </button>
        </div>

        {/* Chain Warning */}
        {isConnected && <ChainWarning />}

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {activeTab === "send" && (
            <SendLub
              userRemainingClicks={userRemainingClicks}
              maxPerWallet={maxPerWallet}
              onSend={handleSend}
              pricePerLub={distribution.pricePerLub}
            />
          )}
          {activeTab === "stats" && (
            <Stats distribution={distribution} userAddress={address} />
          )}
          {activeTab === "faq" && <FAQ />}
        </div>

        {/* Wallet Connection Prompt */}
        {!isConnected && (
          <div className="text-center py-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Connect your wallet to see who is spreading the lub 💕
            </p>
            <div className="flex justify-center">
              <WalletConnect />
            </div>
          </div>
        )}

        {/* Activity Feed */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <Terminal messages={events} />
        </div>
      </div>
    </div>
  );
}
