import { useAccount } from "wagmi";
import { createPublicClient, http } from "viem";
import { sonic } from "../wagmi";
import { useQuery } from "@tanstack/react-query";
import WolfABI from "../constants/WolfABI.json";

export interface NFT {
  id: number;
  uri?: string;
  metadata?: {
    name?: string;
    image?: string;
    attributes?: Array<{ trait_type: string; value: string | number }>;
  };
  // Wolf-specific properties
  hungryTime?: number;
  starvedTime?: number;
  hungerAmount?: number;
  eatenFromMarket?: number;
}

// Create a public client outside the hook to avoid recreating it on each render
const publicClient = createPublicClient({
  chain: sonic,
  transport: http(),
});

export function useNFTs(contractAddress: string) {
  const { address } = useAccount();
  const isConnected = !!address;

  // Query to fetch NFT balance
  const balanceQuery = useQuery({
    queryKey: ["nftBalance", contractAddress, address],
    queryFn: async () => {
      if (!address) return 0;

      try {
        const balance = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: WolfABI,
          functionName: "balanceOf",
          args: [address as `0x${string}`],
        });

        return Number(balance);
      } catch (error) {
        console.error("Error fetching NFT balance:", error);
        throw new Error("Failed to fetch NFT balance");
      }
    },
    enabled: isConnected,
  });

  // Query to fetch NFT data
  const nftsQuery = useQuery({
    queryKey: ["nfts", contractAddress, address, balanceQuery.data],
    queryFn: async () => {
      if (
        !address ||
        balanceQuery.data === undefined ||
        balanceQuery.data === 0
      ) {
        return [];
      }

      try {
        const balance = balanceQuery.data;
        const nftPromises = [];

        for (let i = 0; i < balance; i++) {
          nftPromises.push(fetchNFTData(i));
        }

        const nftResults = await Promise.all(nftPromises);
        return nftResults.filter(Boolean) as NFT[];
      } catch (error) {
        console.error("Error fetching NFTs:", error);
        throw new Error("Failed to fetch NFT data");
      }
    },
    enabled: isConnected && balanceQuery.isSuccess,
  });

  const fetchNFTData = async (index: number): Promise<NFT | null> => {
    try {
      // Get token ID for the index
      const tokenId = await fetchTokenId(index);
      if (tokenId === null) return null;

      // Get token URI
      const uri = await fetchTokenURI(tokenId);

      // Initialize NFT object
      const nft: NFT = { id: tokenId };

      // Try to fetch metadata if URI is available
      if (uri) {
        nft.uri = uri;
        try {
          // Clean the URI if it's ipfs or other protocol
          const cleanUri = uri.startsWith("ipfs://")
            ? `https://ipfs.io/ipfs/${uri.split("ipfs://")[1]}`
            : uri;

          const response = await fetch(cleanUri);
          const metadata = await response.json();
          nft.metadata = metadata;
        } catch (error) {
          console.error(`Error fetching metadata for token ${tokenId}:`, error);
        }
      }

      // Fetch wolf-specific data
      try {
        const [hungryTime, starvedTime, hungerAmount, eatenFromMarket] =
          await Promise.all([
            fetchHungryTime(tokenId),
            fetchStarvedTime(tokenId),
            fetchHungerAmount(tokenId),
            fetchEatenFromMarket(tokenId),
          ]);

        nft.hungryTime = hungryTime;
        nft.starvedTime = starvedTime;
        nft.hungerAmount = hungerAmount;
        nft.eatenFromMarket = eatenFromMarket;
      } catch (error) {
        console.error(`Error fetching wolf data for token ${tokenId}:`, error);
      }

      return nft;
    } catch (error) {
      console.error(`Error fetching NFT at index ${index}:`, error);
      return null;
    }
  };

  const fetchTokenId = async (index: number): Promise<number | null> => {
    try {
      const tokenId = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: WolfABI,
        functionName: "tokenOfOwnerByIndex",
        args: [address as `0x${string}`, BigInt(index)],
      });

      return Number(tokenId);
    } catch (error) {
      console.error(`Error fetching token ID at index ${index}:`, error);
      return null;
    }
  };

  const fetchTokenURI = async (tokenId: number): Promise<string | null> => {
    try {
      const uri = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: WolfABI,
        functionName: "tokenURI",
        args: [BigInt(tokenId)],
      });

      return uri as string;
    } catch (error) {
      console.error(`Error fetching token URI for token ${tokenId}:`, error);
      return null;
    }
  };

  // Wolf-specific data fetching functions
  const fetchHungryTime = async (
    tokenId: number,
  ): Promise<number | undefined> => {
    try {
      const hungry = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: WolfABI,
        functionName: "hungry",
        args: [BigInt(tokenId)],
      });

      return Number(hungry);
    } catch (error) {
      console.error(`Error fetching hungry time for token ${tokenId}:`, error);
      return undefined;
    }
  };

  const fetchStarvedTime = async (
    tokenId: number,
  ): Promise<number | undefined> => {
    try {
      const starved = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: WolfABI,
        functionName: "starved",
        args: [BigInt(tokenId)],
      });

      return Number(starved);
    } catch (error) {
      console.error(`Error fetching starved time for token ${tokenId}:`, error);
      return undefined;
    }
  };

  const fetchHungerAmount = async (
    tokenId: number,
  ): Promise<number | undefined> => {
    try {
      const hunger = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: WolfABI,
        functionName: "hunger",
        args: [BigInt(tokenId)],
      });

      return Number(hunger) / 1e18; // Convert from wei to token units
    } catch (error) {
      console.error(
        `Error fetching hunger amount for token ${tokenId}:`,
        error,
      );
      return undefined;
    }
  };

  const fetchEatenFromMarket = async (
    tokenId: number,
  ): Promise<number | undefined> => {
    try {
      const eatenFromMarket = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: WolfABI,
        functionName: "eatenFromMarket",
        args: [BigInt(tokenId)],
      });

      return Number(eatenFromMarket);
    } catch (error) {
      console.error(
        `Error fetching eaten from market for token ${tokenId}:`,
        error,
      );
      return undefined;
    }
  };

  return {
    nfts: nftsQuery.data || [],
    loading: balanceQuery.isLoading || nftsQuery.isLoading,
    error:
      balanceQuery.error || nftsQuery.error ? "Failed to fetch NFT data" : null,
    isRefetching: balanceQuery.isRefetching || nftsQuery.isRefetching,
    refetch: () => {
      balanceQuery.refetch();
      nftsQuery.refetch();
    },
  };
}
