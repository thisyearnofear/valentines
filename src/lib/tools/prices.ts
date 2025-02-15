import { z } from "zod";

export const getEthPriceUsd = async (): Promise<string> => {
  const fetchedPrice = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  ).catch((error) => {
    throw new Error("Error fetching data from CoinGecko:" + error);
  });

  const ethPriceData = await fetchedPrice.json();
  const ethPriceUsd = ethPriceData?.ethereum?.usd;

  if (!ethPriceUsd) {
    throw new Error("Could not fetch ETH price");
  }

  return `The price of 1 ETH is $${ethPriceUsd.toLocaleString("en-US")} USD.`;
};

export const getEthPriceUsdMetadata = {
  name: "getEthPriceUsd",
  description: "Get the current price of ETH in USD from CoinGecko.",
  schema: z.object({}),
};
