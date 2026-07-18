"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CITIES, MIN_RATING_OPTIONS } from "@/lib/validations/common";

export function TrucksSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const city = searchParams.get("city") || "";
  const minRating = searchParams.get("minRating") || "0";

  const [localSearch, setLocalSearch] = useState(search);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    const queryString = params.toString();
    const url = queryString ? `/trucks?${queryString}` : "/trucks";

    router.push(url);
  };

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: localSearch || null });
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    updateParams({ search: null });
  };

  const hasFilters = search || (city && city !== "all") || minRating !== "0";

  const handleClearAll = () => {
    setLocalSearch("");
    router.push("/trucks");
  };

  return (
    <div className="bg-card border rounded-lg p-4 mb-6">
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="חיפוש לפי שם או כתובת..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              aria-label="חיפוש עגלות קפה"
              className={cn("pe-10", localSearch && "ps-10")}
            />
            {localSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="נקה חיפוש"
                className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Select
            value={city}
            onValueChange={(value) =>
              updateParams({ city: value === "all" ? null : value })
            }
          >
            <SelectTrigger aria-label="סינון לפי עיר">
              <SelectValue placeholder="כל הערים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הערים</SelectItem>
              {CITIES.map((cityOption) => (
                <SelectItem key={cityOption} value={cityOption}>
                  {cityOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={minRating}
            onValueChange={(value) => updateParams({ minRating: value })}
          >
            <SelectTrigger aria-label="סינון לפי דירוג">
              <SelectValue placeholder="כל הדירוגים" />
            </SelectTrigger>
            <SelectContent>
              {MIN_RATING_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit">חפש</Button>
          {hasFilters && (
            <Button type="button" variant="ghost" onClick={handleClearAll}>
              נקה סינון
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
