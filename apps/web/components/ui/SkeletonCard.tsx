export default function SkeletonCard({ tall = false }: { tall?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-border overflow-hidden ${
        tall ? 'row-span-2' : ''
      }`}
      style={{
        background: 'linear-gradient(135deg, #0D1424 0%, #131D33 100%)',
      }}
    >
      {/* image placeholder */}
      <div className="relative w-full aspect-[16/10] overflow-hidden">
        <div
          className="absolute inset-0 animate-shimmer"
          style={{
            background: 'linear-gradient(90deg, #0D1424 0%, #131D33 50%, #0D1424 100%)',
            backgroundSize: '200% 100%',
          }}
        />
      </div>

      {/* text placeholders */}
      <div className="p-4 space-y-3">
        <div
          className="h-4 w-3/4 rounded animate-shimmer"
          style={{
            background: 'linear-gradient(90deg, #0D1424 0%, #131D33 50%, #0D1424 100%)',
            backgroundSize: '200% 100%',
          }}
        />
        <div
          className="h-3 w-1/2 rounded animate-shimmer"
          style={{
            background: 'linear-gradient(90deg, #0D1424 0%, #131D33 50%, #0D1424 100%)',
            backgroundSize: '200% 100%',
          }}
        />
        <div className="flex gap-2 mt-4">
          <div
            className="h-5 w-16 rounded-full animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, #0D1424 0%, #131D33 50%, #0D1424 100%)',
              backgroundSize: '200% 100%',
            }}
          />
          <div
            className="h-5 w-12 rounded-full animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, #0D1424 0%, #131D33 50%, #0D1424 100%)',
              backgroundSize: '200% 100%',
            }}
          />
        </div>
      </div>
    </div>
  );
}
