import type { GameRelation } from "../library/service";

export interface GroupedGameRelations {
  prequel: GameRelation[];
  sequel: GameRelation[];
  spinOff: GameRelation[];
  versions: GameRelation[];
}

export function groupGameRelations(relations:GameRelation[]):GroupedGameRelations {
  return {
    prequel:relations.filter(relation=>relation.relationType==="prequel"),
    sequel:relations.filter(relation=>relation.relationType==="sequel"),
    spinOff:relations.filter(relation=>relation.relationType==="spin_off"),
    versions:relations.filter(relation=>["remake","remaster","other"].includes(relation.relationType)),
  };
}
