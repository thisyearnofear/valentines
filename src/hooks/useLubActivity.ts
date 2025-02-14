"use client";

import { useState, useEffect } from "react";
import { usePublicClient, useWatchContractEvent, useChainId } from "wagmi";
import { CLICKER_ABI, CLICKER_ADDRESS } from "../config/contracts";
import { useIdentityResolution } from "./useIdentityResolution";

interface LubEvent {
  type: "purchase" | "click";
  timestamp: Date;
  message: string;
  buyer?: string;
  recipient?: string;
  amount?: number;
}

interface ContractLog {
  args: {
    buyer: string;
    recipient: string;
    amount: bigint;
  };
}

// Add fun message variations
const getRandomMessage = (
  buyerName: string,
  recipientName: string,
  amount: number | bigint,
  isSelfLub: boolean
): string => {
  if (isSelfLub) {
    const selfLubMessages = [
      `${buyerName} self-lubbed ${amount} times 💝`,
      `${buyerName} is practicing self-lub (${amount} times) 🫂`,
      `${buyerName} knows self-lub is important (${amount} lub) ❤️`,
      `${buyerName} sent ${amount} lub to the mirror 🪞`,
      `${buyerName} is feeling the self-lub today (${amount}x) 🥰`,
    ];
    return selfLubMessages[Math.floor(Math.random() * selfLubMessages.length)];
  }

  const multiLubMessages = [
    `${buyerName} showered ${recipientName} with ${amount} lub 💕`,
    `${buyerName} sprinkled ${amount} lub on ${recipientName} ✨`,
    `${buyerName} sent a lub cascade (${amount}x) to ${recipientName} 💫`,
    `${buyerName} lub-bombed ${recipientName} ${amount} times 💝`,
    `${amount} lub energy from ${buyerName} to ${recipientName} 🌟`,
  ];

  const specialMessages = [
    ...(amount.toString() === "69"
      ? [
          `${buyerName} nice-lubbed ${recipientName} 😏`,
          `${buyerName} sent ${recipientName} the nicest lub 👀`,
        ]
      : []),
    ...(amount.toString() === "420"
      ? [
          `${buyerName} blazed ${recipientName} with maximum lub 🔥`,
          `${buyerName} hit ${recipientName} with that high lub energy ⚡️`,
        ]
      : []),
  ];

  const messages = [...multiLubMessages, ...specialMessages];
  return messages[Math.floor(Math.random() * messages.length)];
};

// Add fun lub puns and jokes
const lubPuns = [
  "All you need is lub 💝",
  "To lub or not to lub 🤔",
  "Lub at first sight ✨",
  "Can't buy me lub... oh wait! 💸",
  "Lub makes the world go round 🌍",
  "Keep calm and lub on 💫",
  "May the lub be with you ⚡️",
  "Lub yourself first 🫂",
  "In lub with the blockchain 🔗",
  "Lub is in the air 🌸",
  "Spreading lub like confetti 🎉",
  "Lub you to the moon and back 🚀",
  "Lub is all you need 💕",
  "Lub actually... is all around 🌟",
  "Got lub? 💝",
  "Lub me tender 🎵",
  "Lub story, bro 📖",
  "Infinite lub glitch 🎮",
  "Task failed successfully: too much lub ❤️",
  "404: Lub not found (jk, found it!) 🔍",
];

export function useLubActivity() {
  const [events, setEvents] = useState<LubEvent[]>([]);
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const { resolveIdentity } = useIdentityResolution();

  // Watch for ClicksAttributed events
  useWatchContractEvent({
    address: CLICKER_ADDRESS[11155420] as `0x${string}`,
    abi: CLICKER_ABI,
    eventName: "ClicksAttributed",
    onLogs: async (logs) => {
      console.log("New lub event received", logs);

      for (const log of logs) {
        try {
          // Properly decode the event data
          const args = (log as ContractLog).args;
          if (!args) {
            console.error("No args in log:", log);
            continue;
          }

          const buyer = args.buyer;
          const recipient = args.recipient;
          const amount = args.amount;

          if (!buyer || !recipient || !amount) {
            console.error("Missing required event data", {
              buyer,
              recipient,
              amount,
            });
            continue;
          }

          // Try to resolve identities
          const buyerProfile = await resolveIdentity(buyer);
          const recipientProfile =
            recipient !== buyer
              ? await resolveIdentity(recipient)
              : buyerProfile;

          const buyerName = buyerProfile?.[0]?.displayName || buyer.slice(0, 6);
          const recipientName =
            recipientProfile?.[0]?.displayName || recipient.slice(0, 6);

          const isSelfLub = recipient === buyer;
          const message = getRandomMessage(
            buyerName,
            recipientName,
            amount,
            isSelfLub
          );

          const newEvent = {
            type: "purchase" as const,
            timestamp: new Date(),
            message,
            buyer,
            recipient,
            amount: Number(amount),
          };

          console.log("Adding new event:", newEvent);
          setEvents((prev) => {
            // Deduplicate events by checking if we already have this transaction
            const isDuplicate = prev.some(
              (e) =>
                e.buyer === newEvent.buyer &&
                e.recipient === newEvent.recipient &&
                e.amount === newEvent.amount &&
                Math.abs(e.timestamp.getTime() - newEvent.timestamp.getTime()) <
                  5000 // Within 5 seconds
            );
            if (isDuplicate) {
              console.log("Duplicate event, skipping");
              return prev;
            }
            return [newEvent, ...prev.slice(0, 49)];
          });
        } catch (error) {
          console.error("Error processing lub event:", error);
        }
      }
    },
  });

  // Load past events on mount and when chain changes
  useEffect(() => {
    const loadPastEvents = async () => {
      if (!publicClient) {
        console.log("No public client available");
        return;
      }

      // Always try to load events if we have a public client
      try {
        // Get current block number
        const currentBlock = await publicClient.getBlockNumber();
        console.log("Current block:", currentBlock.toString());

        // Start from 20000 blocks ago (or 0 if less than 20000 blocks have passed)
        const startBlock =
          currentBlock - BigInt(20000) > 0
            ? currentBlock - BigInt(20000)
            : BigInt(0);

        // Split into chunks of 10000 blocks to handle RPC limitations
        const chunkSize = BigInt(9500); // Slightly less than 10000 to be safe
        let allLogs = [];

        for (
          let fromBlock = startBlock;
          fromBlock < currentBlock;
          fromBlock += chunkSize
        ) {
          const toBlock =
            fromBlock + chunkSize > currentBlock
              ? currentBlock
              : fromBlock + chunkSize;

          console.log("Fetching logs:", {
            address: CLICKER_ADDRESS[11155420],
            fromBlock: fromBlock.toString(),
            toBlock: toBlock.toString(),
            chainId,
          });

          try {
            const logs = await publicClient.getLogs({
              address: CLICKER_ADDRESS[11155420],
              fromBlock,
              toBlock,
              event: {
                type: "event",
                name: "ClicksAttributed",
                inputs: [
                  {
                    indexed: true,
                    name: "buyer",
                    type: "address",
                  },
                  {
                    indexed: true,
                    name: "recipient",
                    type: "address",
                  },
                  {
                    indexed: false,
                    name: "amount",
                    type: "uint256",
                  },
                ],
              },
            });
            allLogs.push(...logs);
          } catch (error) {
            console.error("Error fetching logs for range:", {
              fromBlock: fromBlock.toString(),
              toBlock: toBlock.toString(),
              error,
            });
          }
        }

        console.log("Found logs:", {
          count: allLogs.length,
          logs: allLogs,
          chainId,
        });

        // Process past events
        const pastEvents = await Promise.all(
          allLogs.map(async (log) => {
            try {
              // Get block timestamp for accurate event time
              const block = await publicClient.getBlock({
                blockNumber: log.blockNumber,
              });

              // Properly decode the event data
              const args = (log as ContractLog).args;
              if (!args) {
                console.error("No args in log:", log);
                return null;
              }

              const buyer = args.buyer;
              const recipient = args.recipient;
              const amount = args.amount;

              if (!buyer || !recipient || !amount) {
                console.error("Missing required event data", {
                  buyer,
                  recipient,
                  amount,
                });
                return null;
              }

              const buyerProfile = await resolveIdentity(buyer);
              const recipientProfile =
                recipient !== buyer
                  ? await resolveIdentity(recipient)
                  : buyerProfile;

              const buyerName =
                buyerProfile?.[0]?.displayName || buyer.slice(0, 6);
              const recipientName =
                recipientProfile?.[0]?.displayName || recipient.slice(0, 6);

              const isSelfLub = recipient === buyer;
              const message = getRandomMessage(
                buyerName,
                recipientName,
                amount,
                isSelfLub
              );

              return {
                type: "purchase" as const,
                timestamp: new Date(Number(block.timestamp) * 1000), // Convert to JS timestamp
                message,
                buyer,
                recipient,
                amount: Number(amount),
              };
            } catch (error) {
              console.error("Error processing past event:", error);
              return null;
            }
          })
        );

        const validEvents = pastEvents.filter(Boolean) as LubEvent[];
        console.log("Processed events:", validEvents);

        // Sort events by timestamp, most recent first
        const sortedEvents = validEvents.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );

        // Update events, deduplicating with any existing events
        setEvents((prev) => {
          const newEvents = sortedEvents.filter(
            (newEvent) =>
              !prev.some(
                (existingEvent) =>
                  existingEvent.buyer === newEvent.buyer &&
                  existingEvent.recipient === newEvent.recipient &&
                  existingEvent.amount === newEvent.amount &&
                  Math.abs(
                    existingEvent.timestamp.getTime() -
                      newEvent.timestamp.getTime()
                  ) < 5000
              )
          );
          return [...newEvents, ...prev].slice(0, 50); // Keep max 50 events
        });
      } catch (error) {
        console.error("Error loading past events:", error);
      }
    };

    loadPastEvents();
  }, [publicClient, resolveIdentity, chainId]); // Re-run when chain changes

  // Add random pun every 30-60 seconds if no recent activity
  useEffect(() => {
    if (events.length === 0) {
      const addRandomPun = () => {
        const pun = lubPuns[Math.floor(Math.random() * lubPuns.length)];
        setEvents((prev) => [
          {
            type: "purchase",
            timestamp: new Date(),
            message: pun,
          },
          ...prev.slice(0, 49),
        ]);
      };

      // Add initial pun
      addRandomPun();

      // Add new puns periodically
      const interval = setInterval(() => {
        const timeSinceLastEvent =
          Date.now() - (events[0]?.timestamp.getTime() || 0);
        if (timeSinceLastEvent > 30000) {
          // 30 seconds
          addRandomPun();
        }
      }, Math.random() * 30000 + 30000); // Random interval between 30-60 seconds

      return () => clearInterval(interval);
    }
  }, [events]);

  // Format event for display with random emoji for puns
  const formatEvent = (event: LubEvent) => {
    const timeStr = event.timestamp.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

    // If it's a pun (no buyer/recipient), use a different format
    if (!event.buyer && !event.recipient) {
      return `[${timeStr}] ${event.message}`;
    }

    return `[${timeStr}] ${event.message}`;
  };

  // Calculate ownership distribution
  const getDistribution = (totalClicks: number) => {
    const maxClicksNum = 69420;
    const communityPercentage = (totalClicks / maxClicksNum) * 100;
    const remainingPercentage = 100 - communityPercentage;

    return {
      community: communityPercentage,
      remaining: remainingPercentage,
      total: totalClicks,
      max: maxClicksNum,
      pricePerLub: "0.0001",
    };
  };

  return {
    events: events.map(formatEvent),
    getDistribution,
  };
}
