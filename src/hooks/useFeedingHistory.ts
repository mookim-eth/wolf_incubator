import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";

export interface FeedingRecord {
  txhash: string;
  timestamp: number;
  victim: string;
  sheepburn: number;
  sheepearn: number;
  sheepprice: number;
  paidfee: number;
  userearn: number;
  wolfid: number;
}

export const useFeedingHistory = () => {
  const { address } = useAccount();
  const isConnected = !!address;

  const fetchFeedingHistory = async (): Promise<FeedingRecord[]> => {
    if (!address) return [];

    try {
      const response = await fetch(
        `https://r2.moo.kim/wolf/${address.toLowerCase()}.json`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          return []; // No feeding history yet
        }
        throw new Error(`HTTP error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching feeding history:", error);
      throw error;
    }
  };

  const fetchSheepPrice = async (): Promise<number> => {
    try {
      const response = await fetch(
        "https://hermes.pyth.network/api/latest_price_feeds?ids[]=f490b178d0c85683b7a0f2388b40af2e6f7c90cbe0f96b31f315f08d0e5a2d6d",
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const priceData = await response.json();
      const price = parseInt(priceData[0].price.price);
      const expo = priceData[0].price.expo;
      return price * Math.pow(10, expo);
    } catch (error) {
      console.error("Error fetching price:", error);
      return 0;
    }
  };

  const historyQuery = useQuery({
    queryKey: ["feeding-history", address],
    queryFn: fetchFeedingHistory,
    enabled: isConnected,
  });

  const priceQuery = useQuery({
    queryKey: ["sheep-price"],
    queryFn: fetchSheepPrice,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const calculateTotalEarnings = (): number => {
    if (!historyQuery.data) return 0;
    return historyQuery.data.reduce((sum, record) => sum + record.userearn, 0);
  };

  return {
    feedingHistory: historyQuery.data || [],
    isLoading: historyQuery.isLoading,
    isError: historyQuery.isError,
    error: historyQuery.error,
    refetch: historyQuery.refetch,
    sheepPrice: priceQuery.data || 0,
    totalEarnings: calculateTotalEarnings(),
    totalValueUSD: calculateTotalEarnings() * (priceQuery.data || 0),
  };
};
