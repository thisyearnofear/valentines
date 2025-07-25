import { usePets } from "@lub-u/hooks";
import { Button, Skeleton } from "@lub-u/ui";

function HeartSVG({ level }: { level: number }) {
  return (
    <svg width={64} height={64} viewBox="0 0 64 64">
      <defs>
        <linearGradient id="heart-gradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#be185d" />
        </linearGradient>
      </defs>
      <path
        d="M32 58s-18-13.5-18-26.2C14 18.1 32 18 32 31.6 32 18 50 18.1 50 31.8 50 44.5 32 58 32 58z"
        fill="url(#heart-gradient)"
        stroke="#fff"
        strokeWidth={2}
      />
      <text
        x="50%"
        y="56%"
        textAnchor="middle"
        fill="#fff"
        fontSize="18"
        fontWeight="bold"
        dy=".3em"
      >
        {level}
      </text>
    </svg>
  );
}

export default function PetGallery() {
  const { pets, loading, mintPet } = usePets();

  return (
    <section className="my-8 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-semibold">Your Heart Pets</div>
        <Button onClick={mintPet} disabled={loading} variant="primary" size="sm">
          Mint Pet
        </Button>
      </div>
      {loading ? (
        <Skeleton size="lg" className="h-16 w-full" />
      ) : (
        <div className="flex gap-4 flex-wrap">
          {pets.length === 0 ? (
            <span className="text-gray-400">No pets yet</span>
          ) : (
            pets.map((pet: any) => (
              <div key={pet.id} className="flex flex-col items-center">
                <HeartSVG level={Number(pet.level)} />
                <div className="text-xs text-gray-600 mt-1">#{pet.id}</div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}