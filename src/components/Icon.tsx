import { createContext, useContext } from "react";
import type { CSSProperties, SVGProps, ReactNode } from "react";

export type IconName =
  | "desktop"
  | "library"
  | "heart"
  | "collections"
  | "statistics"
  | "extensions"
  | "settings"
  | "hide"
  | "show"
  | "search"
  | "close"
  | "list"
  | "covers"
  | "sliders"
  | "chevron"
  | "play"
  | "check"
  | "filter"
  | "plus"
  | "archive";

const paths: Record<IconName, string[]> = {
  desktop: [
    "M3 4.5h18v12H3z",
    "M8 20h8",
    "M12 16.5V20",
    "M8 8h8",
    "M8 11.5h5",
  ],
  library: [
    "M4 5.5h16",
    "M4 10h16",
    "M4 14.5h11",
    "M4 19h11",
    "M18 14v5",
  ],
  heart: ["M20.2 8.8c0 4.1-8.2 9-8.2 9s-8.2-4.9-8.2-9A4.3 4.3 0 0 1 12 7.1a4.3 4.3 0 0 1 8.2 1.7Z"],
  collections: [
    "M4 5h16v13H4z",
    "M8 9h8",
    "M8 13h5",
    "M7 21h10",
    "M7 18v3",
    "M17 18v3",
  ],
  statistics: [
    "M4 19V5",
    "M4 19h17",
    "M8 15v-4",
    "M12 15V7",
    "M16 15V9",
    "M20 15V4",
  ],
  extensions: [
    "M4 7h6a2 2 0 0 0 4 0h6v5a2 2 0 0 1 0 4v3h-6a2 2 0 0 0-4 0H4v-5a2 2 0 0 0 0-4z",
    "M12 10v4",
  ],
  settings: [
    "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z",
    "m19.4 15 .1.1a1.8 1.8 0 1 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3 .8v.2a1.8 1.8 0 1 1-3.6 0v-.2a1.8 1.8 0 0 0-3-.8l-.1.1a1.8 1.8 0 1 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-.8-3h-.2a1.8 1.8 0 1 1 0-3.6h.2a1.8 1.8 0 0 0 .8-3l-.1-.1a1.8 1.8 0 1 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3-.8v-.2a1.8 1.8 0 1 1 3.6 0v.2a1.8 1.8 0 0 0 3 .8l.1-.1a1.8 1.8 0 1 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 .8 3h.2a1.8 1.8 0 1 1 0 3.6h-.2a1.8 1.8 0 0 0-.8 3Z",
  ],
  hide: ["M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Z", "M9.5 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z"],
  show: ["M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Z", "M9.5 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z"],
  search: ["m20 20-4.4-4.4", "M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"],
  close: ["m6 6 12 12", "M18 6 6 18"],
  list: ["M9 6h11", "M9 12h11", "M9 18h11", "M4 6h.01", "M4 12h.01", "M4 18h.01"],
  covers: ["M4 5h7v7H4z", "M14 5h6v7h-6z", "M4 15h7v5H4z", "M14 15h6v5h-6z"],
  sliders: ["M4 7h9", "M17 7h3", "M4 17h3", "M11 17h9", "M13 4v6", "M7 14v6"],
  chevron: ["m7 10 5 5 5-5"],
  play: ["m8 5 11 7-11 7z"],
  check: ["m5 12 4 4L19 6"],
  filter: ["M4 6h16", "M7 12h10", "M10 18h4"],
  plus: ["M12 5v14", "M5 12h14"],
  archive: ["M3 5h18v4H3z", "M5 9v10h14V9", "M10 13h4"],
};

export type IconResourceMap = Partial<Record<IconName,string>>;
const IconResourceContext=createContext<IconResourceMap>({});
export function IconResourceProvider({resources,children}:{resources:IconResourceMap;children:ReactNode}) { return <IconResourceContext.Provider value={resources}>{children}</IconResourceContext.Provider>; }

export function Icon({
  name,
  source,
  className,
  width = 20,
  height = 20,
  ...props
}: SVGProps<SVGSVGElement> & { name?: IconName; source?: string }) {
  const resources=useContext(IconResourceContext);
  const imageSource=source??(name?resources[name]:undefined);
  if (imageSource) return <img alt="" aria-hidden="true" className={`kiwanto-icon-image${className?` ${className}`:""}`} height={height} src={imageSource} style={props.style as CSSProperties} width={width}/>;
  if (!name) return null;
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
      className={className}
      {...props}
    >
      {paths[name].map((path) => (
        <path d={path} key={path} />
      ))}
    </svg>
  );
}
