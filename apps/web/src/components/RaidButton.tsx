import { Button } from "@lub-u/ui";

// Placeholder - will wire to buyClicks(channelId) later
export default function RaidButton({ channelId }: { channelId: number }) {
  return (
    <Button
      onClick={() => {
        // To implement: call buyClicks with channelId
      }}
      variant="secondary"
      size="md"
      className="ml-2"
    >
      Start Raid for Channel {channelId}
    </Button>
  );
}