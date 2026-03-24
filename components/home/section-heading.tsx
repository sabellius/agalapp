interface SectionHeadingProps {
  children: React.ReactNode;
}

export function SectionHeading({ children }: SectionHeadingProps) {
  return <h2 className="text-2xl md:text-3xl font-bold mb-6">{children}</h2>;
}
