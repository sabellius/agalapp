import { SearchHero } from "./search-hero";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/3 to-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />

      <div className="container mx-auto px-4 py-20 md:py-28 relative">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            גלה את עגלות הקפה
            <br />
            <span className="text-primary">הטובות בישראל</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            מצא, דרג ושתף את העגלות האהובות עליך.
            <br className="hidden md:block" />
            המלצות אמיתיות מאנשים אמיתיים.
          </p>
        </div>

        <SearchHero />
      </div>
    </section>
  );
}
