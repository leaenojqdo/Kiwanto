import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import type { Game, GameLibraryState } from "../library/models";
import { addGameToCollection, listCollections, removeGameFromCollection } from "../library/service";
import type { CollectionSummary } from "../library/service";
import { keyboardNavigationIntent } from "../app/navigationInput";
import { Icon } from "./Icon";

interface Props {
  game: Game; state: GameLibraryState; children: ReactNode; mode: "desktop"|"big-picture";
  archived?: boolean; activeCollectionId?: string|null;
  onOpen: ()=>void; onEdit?: ()=>void; onToggleFavorite: ()=>void; onArchive?: ()=>void; onRestore?: ()=>void;
  onError?: (message:string)=>void;
  onCollectionChanged?:()=>void;
}

export function GameContextMenu({game,state,children,mode,archived=false,activeCollectionId=null,onOpen,onEdit,onToggleFavorite,onArchive,onRestore,onError,onCollectionChanged}:Props) {
  const [position,setPosition]=useState<{x:number;y:number}|null>(null);
  const [collections,setCollections]=useState<CollectionSummary[]>([]);
  const [busy,setBusy]=useState(false);
  const root=useRef<HTMLDivElement>(null); const menu=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLElement|null>(null);
  function open(x:number,y:number,source:HTMLElement){trigger.current=source;setPosition({x:Math.max(8,Math.min(x,window.innerWidth-300)),y:Math.max(8,Math.min(y,window.innerHeight-340))});void listCollections().then(setCollections).catch((error:unknown)=>onError?.(error instanceof Error?error.message:String(error)));requestAnimationFrame(()=>menu.current?.querySelector<HTMLElement>("button:not(:disabled)")?.focus());}
  function handleContext(event:MouseEvent){event.preventDefault();open(event.clientX,event.clientY,event.target as HTMLElement);}
  function closeAndRestore(){setPosition(null);requestAnimationFrame(()=>trigger.current?.focus());}
  function handleKey(event:KeyboardEvent<HTMLDivElement>){if(position&&event.key==="Escape"){event.preventDefault();event.stopPropagation();setPosition(null);requestAnimationFrame(()=>trigger.current?.focus());return;}if(position&&["ArrowDown","ArrowUp","ArrowLeft","ArrowRight"].includes(event.key)){event.preventDefault();event.stopPropagation();const items=[...(menu.current?.querySelectorAll<HTMLElement>("button:not(:disabled)")??[])];const current=items.indexOf(document.activeElement as HTMLElement);const step=event.key==="ArrowUp"||event.key==="ArrowLeft"?-1:1;items[(current+step+items.length)%items.length]?.focus();return;}if(keyboardNavigationIntent(event.key,event.shiftKey)?.type==="open-context-menu"){event.preventDefault();event.stopPropagation();const target=event.target as HTMLElement;const rect=target.getBoundingClientRect();open(rect.left,rect.bottom,target);}}
  useEffect(()=>{if(!position)return;const close=(event:globalThis.PointerEvent)=>{const target=event.target as Node;if(!root.current?.contains(target)&&!menu.current?.contains(target))setPosition(null);};const key=(event:globalThis.KeyboardEvent)=>{if(event.key==="Escape"){event.preventDefault();setPosition(null);}};window.addEventListener("pointerdown",close);window.addEventListener("keydown",key);return()=>{window.removeEventListener("pointerdown",close);window.removeEventListener("keydown",key);};},[position]);
  async function addToCollection(collectionId:string){setBusy(true);try{await addGameToCollection(collectionId,game.id);onCollectionChanged?.();closeAndRestore();}catch(error){onError?.(error instanceof Error?error.message:String(error));}finally{setBusy(false);}}
  async function removeFromCollection(){if(!activeCollectionId)return;setBusy(true);try{await removeGameFromCollection(activeCollectionId,game.id);onCollectionChanged?.();closeAndRestore();}catch(error){onError?.(error instanceof Error?error.message:String(error));}finally{setBusy(false);}}
  return <div className={`game-context-target game-context-target--${mode}`} onContextMenu={handleContext} onKeyDown={handleKey} ref={root}>
    {children}
    {position&&createPortal(<div aria-label={`Acciones para ${game.metadata.title}`} className="game-context-menu" onContextMenu={event=>event.preventDefault()} onKeyDown={handleKey} ref={menu} role="menu" style={{left:position.x,top:position.y}} tabIndex={-1}>
      <p className="game-context-menu__title">{game.metadata.title}</p>
      <button role="menuitem" onClick={()=>{setPosition(null);onOpen();}} type="button"><Icon name="library"/> Abrir información</button>
      {!archived&&onEdit&&<button role="menuitem" onClick={()=>{setPosition(null);onEdit();}} type="button"><Icon name="sliders"/> Editar</button>}
      {!archived&&<button role="menuitem" onClick={()=>{onToggleFavorite();closeAndRestore();}} type="button"><Icon name="heart"/>{state.favorite?"Quitar de favoritos":"Añadir a favoritos"}</button>}
      {activeCollectionId&&!archived&&<button disabled={busy} role="menuitem" onClick={()=>void removeFromCollection()} type="button">Quitar de esta colección</button>}
      {!archived&&collections.some(collection=>collection.id!==activeCollectionId)&&<div className="game-context-menu__collections"><span>Añadir a colección</span>{collections.filter(collection=>collection.id!==activeCollectionId).map(collection=><button disabled={busy} key={collection.id} role="menuitem" onClick={()=>void addToCollection(collection.id)} type="button"><Icon name="collections"/> {collection.name}</button>)}</div>}
      {archived&&onRestore?<button role="menuitem" onClick={()=>{setPosition(null);onRestore();}} type="button"><Icon name="library"/> Restaurar</button>:!archived&&onArchive?<button role="menuitem" onClick={()=>{setPosition(null);onArchive();}} type="button"><Icon name="archive"/> Archivar</button>:null}
    </div>,document.body)}
  </div>;
}
