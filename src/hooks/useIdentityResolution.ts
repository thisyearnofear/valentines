import { useState, useCallback } from "react";

interface IdentityProfile {
  address: string;
  identity: string;
  platform: string;
  displayName: string;
  avatar: string;
  description: string | null;
}

export function useIdentityResolution() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<IdentityProfile[]>([]);

  const resolveIdentity = useCallback(async (identity: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`https://api.web3.bio/profile/${identity}`);
      if (!response.ok) {
        throw new Error("Failed to resolve identity");
      }
      const data = await response.json();
      setProfiles(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPreferredProfile = useCallback(
    (platform?: string) => {
      if (!profiles.length) return null;
      if (!platform) return profiles[0];
      return profiles.find((p) => p.platform === platform) || profiles[0];
    },
    [profiles]
  );

  return {
    resolveIdentity,
    getPreferredProfile,
    profiles,
    loading,
    error,
  };
}
