import { fromLegacyDescription } from "../library/description";

interface GameDescriptionViewProps {
  text: string;
  className?: string;
}

/** Renders the current text-only format while keeping Desktop and Big Picture on one adapter. */
export function GameDescriptionView({ text, className }: GameDescriptionViewProps) {
  const document = fromLegacyDescription(text);
  return <>{document.blocks.map((block, index) => block.type === "paragraph"
    ? <p className={className} key={`paragraph-${index}`}>{block.text}</p>
    : null)}</>;
}
