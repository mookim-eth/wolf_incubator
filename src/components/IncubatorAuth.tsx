import React, { useState } from "react";
import { useIncubator } from "../hooks/useIncubator";
import { useAccount, useWriteContract } from "wagmi";

interface IncubatorAuthProps {
  onAuthSuccess?: () => void;
}

export const IncubatorAuth = ({ onAuthSuccess }: IncubatorAuthProps) => {
  const { status, getApprovalParams, refetch } = useIncubator();
  const { isConnected } = useAccount();
  const [isApproving, setIsApproving] = useState(false);

  // Setup the contract write hook
  const { writeContract, isPending, isError, error } = useWriteContract();

  const handleAuthorize = async () => {
    if (!isConnected) return;

    try {
      setIsApproving(true);
      const params = getApprovalParams();

      writeContract(params, {
        onSuccess: async () => {
          setTimeout(() => {
            refetch();
            setIsApproving(false);
            onAuthSuccess?.();
          }, 2000);
        },
        onError: () => {
          setIsApproving(false);
        },
      });
    } catch (err) {
      console.error("Error authorizing incubator:", err);
      setIsApproving(false);
    }
  };

  if (status.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <button
        onClick={handleAuthorize}
        disabled={isPending || isApproving}
        style={{
          backgroundColor: status.isAuthenticated ? "#dc3545" : "#0d76fc",
          color: "white",
          border: "none",
          padding: "10px 16px",
          borderRadius: "4px",
          cursor: isPending || isApproving ? "not-allowed" : "pointer",
          opacity: isPending || isApproving ? 0.7 : 1,
          fontWeight: "bold",
          width: "100%",
        }}
      >
        {isPending || isApproving
          ? "Processing..."
          : status.isAuthenticated
            ? "Revoke Auto-Feeding"
            : "Authorize Auto-Feeding"}
      </button>

      {isError && (
        <div
          style={{
            color: "#721c24",
            backgroundColor: "#f8d7da",
            padding: "10px",
            borderRadius: "4px",
            marginTop: "10px",
            fontSize: "0.9rem",
          }}
        >
          Error: {error?.message || "Please try again"}
        </div>
      )}
    </div>
  );
};
