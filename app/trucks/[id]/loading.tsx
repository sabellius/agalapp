import { Skeleton } from "@/components/ui/skeleton";

export default function TruckDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col gap-4">
            <Skeleton className="h-64 rounded-lg" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        </div>
        <div className="flex flex-col gap-4 mt-4">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
