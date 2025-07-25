import { useGetClickStatsQuery } from "@lub-u/data";
import { graphClient } from "@lub-u/data/src/client";

export default function StatsWidget() {
  const { data, isLoading, error } = useGetClickStatsQuery(graphClient);

  if (isLoading) return <div>Loading stats...</div>;
  if (error) return <div>Failed to load stats.</div>;

  const totalClicks =
    data?.clicks?.reduce((sum, click) => sum + Number(click.amount), 0) ?? 0;

  return (
    <section className="mt-6 mb-2 p-4 bg-white/70 rounded-xl shadow border w-full max-w-xl">
      <div className="font-semibold text-lg mb-2">On-chain Lub Stats</div>
      <dl>
        <dt className="font-bold">Total Lub Clicks</dt>
        <dd className="mb-2">{totalClicks}</dd>
        <dt className="font-bold">Top Lub Holders</dt>
        <dd>
          <ol className="list-decimal ml-6 space-y-1">
            {(data?.ownershipShares ?? []).map((owner: any, i: number) => (
              <li key={owner.id}>
                <span className="font-mono">{owner.id}</span>: {Number(owner.shares)}
              </li>
            ))}
          </ol>
        </dd>
      </dl>
    </section>
  );
}