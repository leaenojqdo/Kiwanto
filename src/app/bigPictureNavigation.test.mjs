import test from "node:test";
import assert from "node:assert/strict";
import { keyboardNavigationIntent, semanticNavigationIntent } from "./navigationInput.ts";
import { nearestSpatialCandidate, restoreLibraryContext } from "./bigPictureNavigation.ts";
import { groupGameRelations } from "./gameRelations.ts";

test("keyboard keys map to reusable semantic actions", () => {
  assert.deepEqual(keyboardNavigationIntent("ArrowLeft"), { type: "move-focus", direction: "left" });
  assert.deepEqual(keyboardNavigationIntent("Enter"), { type: "confirm" });
  assert.deepEqual(keyboardNavigationIntent("Escape"), { type: "back" });
  assert.deepEqual(keyboardNavigationIntent("Tab", true), { type: "move-tab-focus", reverse: true });
  assert.deepEqual(keyboardNavigationIntent("F10", true), { type: "open-context-menu" });
  assert.deepEqual(keyboardNavigationIntent("ContextMenu"), { type: "open-context-menu" });
  assert.deepEqual(semanticNavigationIntent("context-menu"), { type: "open-context-menu" });
});

test("spatial navigation chooses a forward visual neighbor", () => {
  assert.equal(nearestSpatialCandidate({x:10,y:10}, [{value:"below",x:11,y:50},{value:"right",x:80,y:12}], "right"), "right");
});

test("canceling search restores prior tab, collection, selection and query", () => {
  const before = { section:"collections", collectionId:"c-1", selectedId:"g-3", query:"old" };
  assert.deepEqual(restoreLibraryContext(before), before);
});

test("related game cards are grouped by their explicit relation type", () => {
  const types=["prequel","sequel","spin_off","remake","remaster","other"];
  const relations=types.map((relationType,index)=>({id:String(index),relationType,relatedGame:{id:String(index)}}));
  const grouped=groupGameRelations(relations);
  assert.equal(grouped.prequel.length,1);
  assert.equal(grouped.sequel.length,1);
  assert.equal(grouped.spinOff.length,1);
  assert.deepEqual(grouped.versions.map(item=>item.relationType),["remake","remaster","other"]);
});
