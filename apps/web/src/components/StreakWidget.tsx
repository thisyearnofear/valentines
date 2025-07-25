import { useStreak } from "@lub-u/hooks";
import { Button, Skeleton } from "@lub-u/ui";
import dayjs from "dayjs";

function canClaim(lastTimestamp: number) {
  if (!lastTimestamp) return true;
  // less than 24h since last claim
  return (Date.now() / 1000) - Number(lastTimestamp) >= 24 * 60 * 60;
}

export default function StreakWidget() {
  const { streak, lastTimestamp, loading, claimStreak } = useStreak();
  const claimable = canClaim(lastTimestamp);

  return (
    <section className="my-4 p-4 max-w-xl rounded-xl bg-white/80 dark:bg-gray-800 shadow border flex flex-col items-center">
      <div className="text-lg font-semibold mb-2">Your Lub Streak</div>
      {loading ? (
        <Skeleton size="lg" className="h-12 w-24 mb-4" />
      ) : (
        <div className="text-5xl font-bold text-pink-600 mb-2">{streak}</div>
      )}
      <Button
        onClick={claimStreak}
        disabled={loading || !claimable}
        variant="primary"
        size="md"
      >
        {claimable ? "Claim Today" : "Already Claimed"}
      </Button>
      {lastTimestamp ? (
        <div className="text-xs mt-2 text-gray-500">Last: {dayjs.unix(Number(lastTimestamp)).format("MMM D, HH:mm")}</div>
      ) : null}
    </section>
  );
}