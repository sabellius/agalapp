"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { CITIES } from "@/lib/validations/common";

export function SearchHero() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (city && city !== "all") params.set("city", city);
    const queryString = params.toString();
    router.push(queryString ? `/trucks?${queryString}` : "/trucks");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-card/80 backdrop-blur-sm border rounded-xl p-4 shadow-lg"
    >
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="שם עגלה או כתובת..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 h-12"
          />
        </div>

        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="md:w-44 h-12!">
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

        <Button type="submit" size="lg" className="h-12 px-8">
          חפש
        </Button>
      </div>
    </form>
  );
}
