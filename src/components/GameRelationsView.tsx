import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { Game } from "../library/models";
import { listGameCollections, listGameRelations } from "../library/service";
import type { CollectionSummary, GameRelation } from "../library/service";
import { groupGameRelations } from "../app/gameRelations";

interface Props { gameId: string; games: Game[]; onOpenGame: (game: Game) => void; onOpenCollection?: (collectionId:string)=>void; className?: string; }

export function GameRelationsView({ gameId, games, onOpenGame, onOpenCollection, className = "" }: Props) {
  const [relations,setRelations]=useState<GameRelation[]>([]);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);
  const [collectionsByRelation,setCollectionsByRelation]=useState<Record<string,CollectionSummary[]>>({});
  useEffect(()=>{let active=true;setLoading(true);setError("");Promise.all([listGameRelations(gameId),listGameCollections(gameId)]).then(async([items,ownCollections])=>{const relatedCollections=await Promise.all(items.map(item=>listGameCollections(item.relatedGame.id)));if(!active)return;setRelations(items);setCollectionsByRelation(Object.fromEntries(items.map((item,index)=>[item.id,ownCollections.filter(collection=>relatedCollections[index].some(candidate=>candidate.id===collection.id))])));}).catch((reason:unknown)=>{if(active)setError(reason instanceof Error?reason.message:String(reason));}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[gameId]);
  if(loading)return <p className="game-relations__status" role="status">Cargando relaciones…</p>;
  if(error)return <p className="game-relations__status" role="alert">{error}</p>;
  const grouped=groupGameRelations(relations);
  if(!relations.length)return null;
  const labels={prequel:"Precuela",sequel:"Secuela",spin_off:"Spin-off",remake:"Remake",remaster:"Remasterización",other:"Other"};
  return <section aria-label="Juegos relacionados" className={`game-relations ${className}`}>
    {([["prequel",grouped.prequel],["sequel",grouped.sequel],["spin-off",grouped.spinOff],["versions",grouped.versions]] as const).map(([group,items])=>items.length>0&&<div className={`game-relations__group game-relations__group--${group}`} key={group}>{items.map(relation=>{const game=games.find(candidate=>candidate.id===relation.relatedGame.id)??relation.relatedGame;return <div className="game-relations__item" key={relation.id}><button className="game-relations__card" data-bp-nav="true" onClick={()=>onOpenGame(game)} title={`Abrir ${game.metadata.title}`} type="button"><span className="game-relations__art" style={{"--relation-accent":game.presentation.accent} as CSSProperties}>{game.presentation.cover?<img alt="" loading="lazy" src={game.presentation.cover}/>:<span>{game.presentation.initials}</span>}</span><span className="game-relations__copy"><strong>{game.metadata.title}</strong><small>{labels[relation.relationType]}</small></span></button>{onOpenCollection&&collectionsByRelation[relation.id]?.map(collection=><button className="game-relations__collection" data-bp-nav="true" key={collection.id} onClick={()=>onOpenCollection(collection.id)} title="Ver la colección que incluye ambos juegos" type="button">Colección compartida · {collection.name}</button>)}</div>})}</div>)}
  </section>;
}
