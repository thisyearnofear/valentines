import { Button, Skeleton } from "@lub-u/ui";
import { useRaid } from "@lub-u/hooks";
import { useState } from "react";

export default function RaidButton({ channelId }: { channelId: number }) {
  const { startRaid, isPending } = useRaid();
  const [amount] = useState(1); // for now, always 1

  const handleRaid = async () => {
    await startRaid(channelId, amount);
  };

  return (
    isPending ? (
      <Skeleton size="md" className="w-32" />
    ) : (
      <Button
        onClick={handleRaid}
        variant="secondary"
        size="md"
        className="ml-2"
      >
        Start Raid for Channel {channelId}
      </Button>
    )
  );
}