import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import {
  INCUBATOR_CONTRACT_ADDRESS,
  WOLF_CONTRACT_ADDRESS,
} from "../constants/addresses";
import IncubatorABI from "../constants/IncubatorABI.json";
import WolfABI from "../constants/WolfABI.json";

export interface IncubatorStatus {
  isAuthorized: boolean;
  isAuthenticated: boolean; // Alias for isAuthorized for backward compatibility
  isLoading: boolean;
  error: Error | null;
  userRatio?: number;
}

interface WriteContractCallbacks {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useIncubator() {
  const { address } = useAccount();
  const [status, setStatus] = useState<IncubatorStatus>({
    isAuthorized: false,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Setup contract read for authorization check
  const {
    data: isApprovedForAll,
    isPending: isCheckLoading,
    error: readError,
    refetch,
  } = useReadContract({
    address: WOLF_CONTRACT_ADDRESS as `0x${string}`,
    abi: WolfABI,
    functionName: "isApprovedForAll",
    args: address ? [address, INCUBATOR_CONTRACT_ADDRESS] : undefined,
    query: {
      enabled: !!address,
      retry: false, // Disable retries to prevent endless loops on expected errors
    },
  });

  // Read user's fee ratio if they're authorized
  const { data: userRatio, isPending: isRatioLoading } = useReadContract({
    address: INCUBATOR_CONTRACT_ADDRESS as `0x${string}`,
    abi: IncubatorABI,
    functionName: "userRatio",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!isApprovedForAll,
    },
  });

  // Setup contract write hooks
  const { writeContract, isPending: isWritePending } = useWriteContract();

  // Use useEffect to properly handle state updates
  useEffect(() => {
    if (!isCheckLoading && address) {
      console.log("Authorization check result:", isApprovedForAll);
      console.log("Error if any:", readError);

      // If we get an execution reverted error, treat as not authorized
      // This is expected behavior when a user hasn't authorized yet
      if (readError) {
        console.log("Authorization check failed - treating as not authorized");
        setStatus({
          isAuthorized: false,
          isAuthenticated: false,
          isLoading: false,
          error: null, // Don't treat this as an error
        });
      } else {
        setStatus({
          isAuthorized: !!isApprovedForAll,
          isAuthenticated: !!isApprovedForAll,
          isLoading: false,
          error: null,
          userRatio: userRatio ? Number(userRatio) : undefined,
        });
      }
    }
  }, [isApprovedForAll, isCheckLoading, readError, address, userRatio]);

  // Function to get contract write parameters for authorization
  const getApprovalParams = () => {
    return {
      address: WOLF_CONTRACT_ADDRESS as `0x${string}`,
      abi: WolfABI,
      functionName: "setApprovalForAll",
      args: [INCUBATOR_CONTRACT_ADDRESS, true],
    };
  };

  // Handler for authorize action
  const handleAuthorize = async (callbacks?: WriteContractCallbacks) => {
    try {
      writeContract(getApprovalParams(), callbacks);
      return true;
    } catch (error) {
      console.error("Error in handleAuthorize:", error);
      setStatus((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
      callbacks?.onError?.(error as Error);
      return false;
    }
  };

  // Handler for deauthorize action
  const handleDeauthorize = async (callbacks?: WriteContractCallbacks) => {
    try {
      writeContract(
        {
          address: WOLF_CONTRACT_ADDRESS as `0x${string}`,
          abi: WolfABI,
          functionName: "setApprovalForAll",
          args: [INCUBATOR_CONTRACT_ADDRESS, false],
        },
        callbacks,
      );
      return true;
    } catch (error) {
      console.error("Error in handleDeauthorize:", error);
      setStatus((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
      callbacks?.onError?.(error as Error);
      return false;
    }
  };

  return {
    status,
    handleAuthorize,
    handleDeauthorize,
    getApprovalParams,
    isAuthorizationLoading: isWritePending,
    isDeauthorizationLoading: isWritePending,
    refetch,
  };
}
