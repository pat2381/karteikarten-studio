import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, Edit3, Eye, Printer, ChevronLeft, ChevronRight, Copy, Layers, BookOpen, Save, FolderPlus, RotateCcw, X, Check, Lightbulb, HelpCircle, MessageSquare, Star, AlertTriangle, Bold, Italic, List, ListOrdered, Type, Palette, AlertCircle, CheckCircle } from "lucide-react";

const COLORS=["#dc2626","#ea580c","#d97706","#ca8a04","#16a34a","#059669","#0891b2","#2563eb","#4f46e5","#7c3aed","#9333ea","#be123c","#78716c","#64748b"];
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const DEFAULT_CAT={id:"allgemein",name:"Allgemein",color:"#64748b"};
const strip=h=>{if(!h)return"";const d=document.createElement("div");d.innerHTML=h;return d.textContent?.trim()||""};

async function load(k,fb){try{const r=await window.storage.get(k);return r?JSON.parse(r.value):fb;}catch{return fb;}}
async function sv(k,d){try{await window.storage.set(k,JSON.stringify(d));}catch(e){console.error(e);}}

/* ━━━ RICH EDITOR with resize handle ━━━ */
function RichEditor({value,onChange,placeholder,minH=60,label}){
  const ref=useRef(null);
  const init=useRef(false);
  const [showColor,setShowColor]=useState(false);
  const [height,setHeight]=useState(minH);
  const dragRef=useRef(null);
  const txtC=["#111827","#dc2626","#ea580c","#16a34a","#2563eb","#7c3aed","#be123c","#ca8a04"];

  useEffect(()=>{if(ref.current&&!init.current){ref.current.innerHTML=value||"";init.current=true;}},[]);
  useEffect(()=>{if(ref.current&&init.current&&ref.current.innerHTML!==(value||""))ref.current.innerHTML=value||"";},[value]);

  const exec=(cmd,val=null)=>{ref.current?.focus();document.execCommand(cmd,false,val);onChange(ref.current?.innerHTML||"");};
  const hi=()=>onChange(ref.current?.innerHTML||"");

  // Resize drag
  const onDragStart=useCallback(e=>{
    e.preventDefault();
    const startY=e.clientY||e.touches?.[0]?.clientY;
    const startH=height;
    const onMove=ev=>{
      const y=ev.clientY||ev.touches?.[0]?.clientY;
      setHeight(Math.max(minH,startH+(y-startY)));
    };
    const onUp=()=>{document.removeEventListener("mousemove",onMove);document.removeEventListener("mouseup",onUp);document.removeEventListener("touchmove",onMove);document.removeEventListener("touchend",onUp);};
    document.addEventListener("mousemove",onMove);document.addEventListener("mouseup",onUp);
    document.addEventListener("touchmove",onMove);document.addEventListener("touchend",onUp);
  },[height,minH]);

  return(
    <div style={{border:"1px solid #2a3040",borderRadius:8,overflow:"hidden",background:"#0c0f14"}}>
      <div style={{display:"flex",gap:1,padding:"3px 5px",background:"#151a25",borderBottom:"1px solid #2a3040",flexWrap:"wrap",alignItems:"center"}}>
        <TB icon={<Bold size={13}/>} t="Fett" onClick={()=>exec("bold")}/>
        <TB icon={<Italic size={13}/>} t="Kursiv" onClick={()=>exec("italic")}/>
        <Sep/>
        <TB icon={<List size={13}/>} t="Aufzaehlung" onClick={()=>exec("insertUnorderedList")}/>
        <TB icon={<ListOrdered size={13}/>} t="Nummeriert" onClick={()=>exec("insertOrderedList")}/>
        <Sep/>
        <TB icon={<span style={{fontSize:13,fontWeight:800}}>A</span>} t="Groesser" onClick={()=>exec("fontSize","5")}/>
        <TB icon={<span style={{fontSize:10,fontWeight:800}}>A</span>} t="Kleiner" onClick={()=>exec("fontSize","2")}/>
        <Sep/>
        <div style={{position:"relative"}}>
          <TB icon={<Palette size={13}/>} t="Farbe" onClick={()=>setShowColor(!showColor)}/>
          {showColor&&<div style={{position:"absolute",top:26,left:0,background:"#1a1f2b",border:"1px solid #2a3040",borderRadius:8,padding:5,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:3,zIndex:20}}>
            {txtC.map(c=><div key={c} onClick={()=>{exec("foreColor",c);setShowColor(false);}} style={{width:20,height:20,borderRadius:3,background:c,cursor:"pointer",border:"2px solid #2a3040"}}/>)}
          </div>}
        </div>
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning onInput={hi} onBlur={hi} data-placeholder={placeholder}
        style={{height,padding:"8px 11px",color:"#e2e8f0",fontSize:13,lineHeight:1.6,fontFamily:F,outline:"none",wordBreak:"break-word",overflowY:"auto",transition:"height 0s"}}/>
      {/* Resize handle */}
      <div onMouseDown={onDragStart} onTouchStart={onDragStart}
        style={{height:8,cursor:"ns-resize",background:"#151a25",borderTop:"1px solid #2a3040",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{width:30,height:3,borderRadius:2,background:"#334155"}}/>
      </div>
      <style>{`[data-placeholder]:empty::before{content:attr(data-placeholder);color:#4a5568;pointer-events:none}[contenteditable] ul,[contenteditable] ol{padding-left:18px;margin:3px 0}[contenteditable] li{margin:1px 0}`}</style>
    </div>
  );
}
function TB({icon,t,onClick}){return<button onClick={onClick} title={t} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",padding:"2px 5px",borderRadius:3,display:"flex",alignItems:"center"}} onMouseEnter={e=>e.currentTarget.style.background="#2a3040"} onMouseLeave={e=>e.currentTarget.style.background="none"}>{icon}</button>}
function Sep(){return<div style={{width:1,height:16,background:"#2a3040",margin:"0 2px"}}/>}
function Fmt({html,style={}}){return html?<div dangerouslySetInnerHTML={{__html:html}} style={{lineHeight:1.6,wordBreak:"break-word",...style}}/>:null}

/* ━━━ LIVE CARD FIT PREVIEW ━━━ */
function CardFitPreview({card,catColor,catName}){
  const frontRef=useRef(null);
  const backRef=useRef(null);
  const [frontOk,setFrontOk]=useState(true);
  const [backOk,setBackOk]=useState(true);
  const [showSide,setShowSide]=useState("front");

  // A6 landscape ratio: 148:105 ≈ 1.41, scaled to preview width
  const previewW=280;
  const previewH=Math.round(previewW/1.41);

  useEffect(()=>{
    const timer=setTimeout(()=>{
      if(frontRef.current) setFrontOk(frontRef.current.scrollHeight<=frontRef.current.clientHeight);
      if(backRef.current) setBackOk(backRef.current.scrollHeight<=backRef.current.clientHeight);
    },200);
    return()=>clearTimeout(timer);
  },[card.question,card.answer,card.hint,card.detail]);

  const hasExtra=card.hint||card.detail;

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
        <span style={{color:"#94a3b8",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:.4}}>Live-Vorschau (A6)</span>
        <div style={{display:"flex",gap:4}}>
          <button onClick={()=>setShowSide("front")} style={{...S.tabMini,borderBottom:showSide==="front"?"2px solid #f59e0b":"2px solid transparent",color:showSide==="front"?"#f59e0b":"#64748b"}}>Frage</button>
          <button onClick={()=>setShowSide("back")} style={{...S.tabMini,borderBottom:showSide==="back"?"2px solid #f59e0b":"2px solid transparent",color:showSide==="back"?"#f59e0b":"#64748b"}}>Antwort</button>
        </div>
      </div>

      {/* Status badges */}
      <div style={{display:"flex",gap:6,marginBottom:6}}>
        <StatusBadge ok={frontOk} label="Frage"/>
        <StatusBadge ok={backOk} label="Antwort"/>
      </div>

      {/* Card preview */}
      <div style={{width:previewW,height:previewH,borderRadius:4,overflow:"hidden",border:"1px solid #2a3040",background:"white",position:"relative",fontSize:0}}>
        {showSide==="front"?(
          <div ref={frontRef} style={{width:"100%",height:"100%",overflow:"hidden",display:"flex",flexDirection:"column"}}>
            <div style={{background:catColor||"#64748b",padding:"3px 6px",display:"flex",justifyContent:"space-between"}}>
              <span style={{color:"white",fontSize:5.5,fontWeight:700,textTransform:"uppercase"}}>{catName||"Kategorie"}</span>
              <span style={{color:"#fffc",fontSize:4.5}}>Karte</span>
            </div>
            <div style={{padding:"3px 6px",flex:1}}>
              <div style={{fontSize:3.5,color:"#6b7280",fontWeight:700,textTransform:"uppercase",marginBottom:1}}>Frage</div>
              <div style={{borderTop:"0.5px solid #e5e7eb",paddingTop:2}}/>
              <Fmt html={card.question} style={{color:"#111",fontSize:7,fontWeight:700,lineHeight:1.35}}/>
            </div>
          </div>
        ):(
          <div ref={backRef} style={{width:"100%",height:"100%",overflow:"hidden",display:"flex",flexDirection:"column",background:`${catColor}08`}}>
            <div style={{background:catColor||"#64748b",padding:"2px 6px",display:"flex",justifyContent:"space-between"}}>
              <span style={{color:"white",fontSize:4.5,fontWeight:700,textTransform:"uppercase"}}>{catName||"Kat."}</span>
              <span style={{color:"white",fontSize:4.5,fontWeight:700}}>ANTWORT</span>
            </div>
            <div style={{padding:"3px 6px",flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
              <Fmt html={card.answer} style={{color:"#1e293b",fontSize:5,lineHeight:1.4,flex:hasExtra?undefined:1}}/>
              {hasExtra&&<div style={{marginTop:"auto",padding:"2px 3px",background:"#fef3c7",border:"0.5px solid #f59e0b",borderRadius:2}}>
                <div style={{color:"#92400e",fontSize:3.5,fontWeight:700,marginBottom:0.5}}>MERKHILFE:</div>
                {card.hint&&<Fmt html={card.hint} style={{color:"#78350f",fontSize:4,fontStyle:"italic",lineHeight:1.3}}/>}
                {card.detail&&<Fmt html={card.detail} style={{color:"#78350f",fontSize:3.5,fontStyle:"italic",lineHeight:1.3,marginTop:1}}/>}
              </div>}
            </div>
          </div>
        )}

        {/* Overflow indicator */}
        {((showSide==="front"&&!frontOk)||(showSide==="back"&&!backOk))&&(
          <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent, #ef444488)",height:16,display:"flex",alignItems:"flex-end",justifyContent:"center",paddingBottom:1}}>
            <span style={{color:"white",fontSize:5,fontWeight:700,background:"#ef4444",padding:"0 4px",borderRadius:2}}>TEXT ZU LANG</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ok,label}){
  return(<div style={{display:"flex",alignItems:"center",gap:3,padding:"2px 6px",borderRadius:10,background:ok?"#052e16":"#450a0a",border:`1px solid ${ok?"#16a34a33":"#ef444433"}`}}>
    {ok?<CheckCircle size={10} color="#22c55e"/>:<AlertCircle size={10} color="#ef4444"/>}
    <span style={{fontSize:9,fontWeight:600,color:ok?"#4ade80":"#f87171"}}>{label}{ok?" passt":" zu lang!"}</span>
  </div>);
}

/* ━━━ MAIN APP ━━━ */
export default function App(){
  const [view,setView]=useState("dashboard");
  const [decks,setDecks]=useState([]);
  const [deckId,setDeckId]=useState(null);
  const [editCard,setEditCard]=useState(null);
  const [loading,setLoading]=useState(true);
  const [toast,setToast]=useState(null);
  const [pIdx,setPIdx]=useState(0);
  const [flip,setFlip]=useState(false);

  const flash=m=>{setToast(m);setTimeout(()=>setToast(null),2000);};
  const deck=decks.find(d=>d.id===deckId);
  const getCat=cid=>deck?.categories.find(c=>c.id===cid)||DEFAULT_CAT;

  useEffect(()=>{(async()=>{setDecks(await load("fc-decks",[]));setLoading(false);})();},[]);
  const persist=async nd=>{setDecks(nd);await sv("fc-decks",nd);};
  const updDeck=async(id,u)=>persist(decks.map(d=>d.id===id?{...d,...u}:d));

  const createDeck=async()=>{const d={id:uid(),name:"Neues Kartendeck",categories:[{...DEFAULT_CAT}],cards:[],createdAt:Date.now()};await persist([...decks,d]);setDeckId(d.id);setView("editor");flash("Deck erstellt");};
  const deleteDeck=async id=>{if(!confirm("Deck loeschen?"))return;await persist(decks.filter(d=>d.id!==id));if(deckId===id){setDeckId(null);setView("dashboard");}flash("Geloescht");};
  const dupDeck=async id=>{const s=decks.find(d=>d.id===id);if(!s)return;const d={...JSON.parse(JSON.stringify(s)),id:uid(),name:s.name+" (Kopie)",createdAt:Date.now()};d.cards=d.cards.map(c=>({...c,id:uid()}));await persist([...decks,d]);flash("Dupliziert");};

  const saveCard=async card=>{if(!deck)return;const cards=deck.cards.find(c=>c.id===card.id)?deck.cards.map(c=>c.id===card.id?card:c):[...deck.cards,{...card,id:uid()}];await updDeck(deckId,{cards});setEditCard(null);flash("Gespeichert");};
  const delCard=async cid=>{if(!deck)return;await updDeck(deckId,{cards:deck.cards.filter(c=>c.id!==cid)});flash("Geloescht");};

  const addCat=async()=>{if(!deck)return;await updDeck(deckId,{categories:[...deck.categories,{id:uid(),name:"Neue Kategorie",color:COLORS[deck.categories.length%COLORS.length],isNew:true}]});};
  const updCat=async(cid,u)=>{if(!deck)return;await updDeck(deckId,{categories:deck.categories.map(c=>c.id===cid?{...c,...u,isNew:false}:c)});};
  const delCat=async cid=>{if(!deck||cid==="allgemein")return;const cards=deck.cards.map(c=>c.categoryId===cid?{...c,categoryId:"allgemein"}:c);await updDeck(deckId,{categories:deck.categories.filter(c=>c.id!==cid),cards});};
  const newCard=()=>setEditCard({id:"",question:"",answer:"",hint:"",detail:"",categoryId:deck?.categories[0]?.id||"allgemein",isImportant:false,isExam:false});

  if(loading)return<div style={S.center}><div style={S.spinner}/></div>;

  return(
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{CSS}</style>
      {toast&&<div style={S.toast}>{toast}</div>}
      <header style={S.header} className="no-print">
        <div style={S.hInner}>
          <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>{setView("dashboard");setDeckId(null);}}>
            <div style={S.logo}><Layers size={18} color="#f59e0b"/></div>
            <div><h1 style={{color:"#f1f5f9",fontSize:17,fontWeight:700,fontFamily:F}}>Karteikarten<span style={{color:"#f59e0b"}}> Studio</span></h1><p style={{color:"#475569",fontSize:10}}>Erstelle & drucke deine Lernkarten</p></div>
          </div>
          {deck&&view!=="dashboard"&&<div style={{display:"flex",alignItems:"center",gap:8}}>
            <button style={S.ghost} onClick={()=>{setView("dashboard");setDeckId(null);}}><ChevronLeft size={14}/> Decks</button>
            <span style={{color:"#334155"}}>/</span><span style={{color:"#e2e8f0",fontSize:13,fontWeight:600}}>{deck.name}</span><span style={S.badge}>{deck.cards.length}</span>
          </div>}
        </div>
      </header>
      <main style={S.main}>
        {view==="dashboard"&&<Dashboard decks={decks} onCreate={createDeck} onOpen={id=>{setDeckId(id);setView("editor");}} onDel={deleteDeck} onDup={dupDeck}/>}
        {view==="editor"&&deck&&<DeckEd deck={deck} updDeck={u=>updDeck(deckId,u)} onNewCard={newCard} onEditCard={c=>setEditCard({...c})} onDelCard={delCard} getCat={getCat} cats={deck.categories} addCat={addCat} updCat={updCat} delCat={delCat} onPreview={()=>{setPIdx(0);setFlip(false);setView("preview");}} onPrint={()=>setView("print")}/>}
        {view==="preview"&&deck&&<Prev cards={deck.cards} i={pIdx} fl={flip} onFlip={()=>setFlip(!flip)} onN={()=>{setPIdx(Math.min(pIdx+1,deck.cards.length-1));setFlip(false);}} onP={()=>{setPIdx(Math.max(pIdx-1,0));setFlip(false);}} onBack={()=>setView("editor")} getCat={getCat} tot={deck.cards.length}/>}
        {view==="print"&&deck&&<PrintA6 deck={deck} getCat={getCat} onBack={()=>setView("editor")}/>}
      </main>
      {editCard&&<CardModal card={editCard} cats={deck?.categories||[DEFAULT_CAT]} onSave={saveCard} onClose={()=>setEditCard(null)}/>}
    </div>
  );
}

/* ━━━ DASHBOARD ━━━ */
function Dashboard({decks,onCreate,onOpen,onDel,onDup}){
  return(<div style={{animation:"fadeIn .4s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:10}}>
      <div><h2 style={{color:"#f1f5f9",fontSize:22,fontWeight:700}}>Meine Kartendecks</h2><p style={{color:"#64748b",fontSize:13,marginTop:2}}>{decks.length} {decks.length===1?"Deck":"Decks"}</p></div>
      <button style={S.pri} className="btn" onClick={onCreate}><FolderPlus size={16}/> Neues Deck</button>
    </div>
    {decks.length===0?(<div style={S.empty}><BookOpen size={44} color="#334155"/><h3 style={{color:"#94a3b8",fontSize:17,fontWeight:600}}>Noch keine Decks</h3><p style={{color:"#64748b",fontSize:13,maxWidth:300,textAlign:"center",lineHeight:1.6}}>Erstelle dein erstes Kartendeck.</p><button style={{...S.pri,marginTop:12}} className="btn" onClick={onCreate}><Plus size={16}/> Erstes Deck</button></div>):(
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
        {decks.map((d,i)=>(<div key={d.id} className="deck-card" style={{...S.dCard,animationDelay:`${i*50}ms`}} onClick={()=>onOpen(d.id)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{background:d.categories?.[1]?.color||"#f59e0b",width:36,height:36,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}><Layers size={18} color="white"/></div>
            <div style={{display:"flex",gap:3}} onClick={e=>e.stopPropagation()}>
              <button style={S.iBtn} className="btn" onClick={()=>onDup(d.id)} title="Duplizieren"><Copy size={13}/></button>
              <button style={{...S.iBtn,color:"#ef4444"}} className="btn" onClick={()=>onDel(d.id)}><Trash2 size={13}/></button>
            </div>
          </div>
          <h3 style={{color:"#f1f5f9",fontSize:15,fontWeight:600,marginTop:10}}>{d.name}</h3>
          <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
            <span style={S.badge}>{d.cards.length} Karten</span>
            {d.cards.filter(c=>c.isImportant).length>0&&<span style={{...S.badge,background:"#fef3c7",color:"#92400e"}}>{d.cards.filter(c=>c.isImportant).length} Wichtig</span>}
          </div>
        </div>))}
      </div>
    )}
  </div>);
}

/* ━━━ DECK EDITOR ━━━ */
function DeckEd({deck,updDeck,onNewCard,onEditCard,onDelCard,getCat,cats,addCat,updCat,delCat,onPreview,onPrint}){
  const [tab,setTab]=useState("cards");
  const [editName,setEditName]=useState(false);
  const [nv,setNv]=useState(deck.name);
  const nr=useRef();
  useEffect(()=>{if(editName&&nr.current)nr.current.focus();},[editName]);
  const grouped={};
  deck.cards.forEach(c=>{const cat=getCat(c.categoryId);if(!grouped[cat.id])grouped[cat.id]={cat,cards:[]};grouped[cat.id].cards.push(c);});
  return(<div style={{animation:"fadeIn .3s ease"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:8}}>
      {editName?(<form onSubmit={e=>{e.preventDefault();updDeck({name:nv});setEditName(false);}} style={{display:"flex",gap:6}}><input ref={nr} value={nv} onChange={e=>setNv(e.target.value)} style={S.inlInput}/><button type="submit" style={{...S.iBtn,color:"#22c55e"}}><Check size={16}/></button><button type="button" style={S.iBtn} onClick={()=>setEditName(false)}><X size={16}/></button></form>):(
        <h2 style={{color:"#f1f5f9",fontSize:20,fontWeight:700,cursor:"pointer"}} onClick={()=>{setNv(deck.name);setEditName(true);}}>{deck.name} <Edit3 size={13} style={{opacity:.3}}/></h2>)}
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        <button style={S.sec} className="btn" onClick={onPreview} disabled={!deck.cards.length}><Eye size={15}/> Vorschau</button>
        <button style={S.sec} className="btn" onClick={onPrint} disabled={!deck.cards.length}><Printer size={15}/> PDF</button>
        <button style={S.pri} className="btn" onClick={onNewCard}><Plus size={15}/> Neue Karte</button>
      </div>
    </div>
    <div style={{display:"flex",gap:3,marginBottom:14,borderBottom:"1px solid #1e293b"}}>
      {[["cards",`Karten (${deck.cards.length})`],["categories","Kategorien"]].map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{...S.tabB,borderBottom:tab===k?"2px solid #f59e0b":"2px solid transparent",color:tab===k?"#f59e0b":"#64748b"}}>{l}</button>)}
    </div>
    {tab==="cards"&&(deck.cards.length===0?(<div style={S.empty}><HelpCircle size={36} color="#334155"/><p style={{color:"#64748b",fontSize:13}}>Noch keine Karten.</p><button style={{...S.pri,marginTop:8}} className="btn" onClick={onNewCard}><Plus size={15}/> Erste Karte</button></div>):(
      Object.values(grouped).map(({cat,cards})=>(<div key={cat.id} style={{marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><div style={{width:10,height:10,borderRadius:3,background:cat.color}}/><span style={{color:"#94a3b8",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{cat.name}</span><span style={{color:"#475569",fontSize:10}}>({cards.length})</span></div>
        {cards.map(card=>(<div key={card.id} className="card-item" style={S.cRow}>
          <div style={{flex:1,minWidth:0,display:"flex",alignItems:"center",gap:6}}>
            {card.isImportant&&<Star size={13} color="#f59e0b" fill="#f59e0b"/>}{card.isExam&&<AlertTriangle size={13} color="#ef4444"/>}
            <div style={{flex:1,minWidth:0}}><p style={{color:"#e2e8f0",fontSize:13,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{strip(card.question)||"Keine Frage"}</p><p style={{color:"#64748b",fontSize:11,marginTop:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{strip(card.answer)?.slice(0,80)||""}</p></div>
          </div>
          <div style={{display:"flex",gap:3,flexShrink:0}}>
            {card.hint&&<Lightbulb size={12} color="#f59e0b" style={{opacity:.5}}/>}
            <button style={S.iBtn} className="btn" onClick={()=>onEditCard(card)}><Edit3 size={13}/></button>
            <button style={{...S.iBtn,color:"#ef4444"}} className="btn" onClick={()=>{if(confirm("Karte loeschen?"))onDelCard(card.id);}}><Trash2 size={13}/></button>
          </div>
        </div>))}
      </div>))
    ))}
    {tab==="categories"&&<CatMgr cats={cats} addCat={addCat} updCat={updCat} delCat={delCat}/>}
  </div>);
}

/* ━━━ CATEGORY MANAGER ━━━ */
function CatMgr({cats,addCat,updCat,delCat}){
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <p style={{color:"#64748b",fontSize:12}}>Farbe anklicken zum Aendern. Name anklicken zum Bearbeiten.</p>
      <button style={S.sec} className="btn" onClick={addCat}><Plus size={14}/> Kategorie</button>
    </div>
    {cats.map(cat=><CatRow key={cat.id} cat={cat} onSave={u=>updCat(cat.id,u)} onDel={()=>delCat(cat.id)} locked={cat.id==="allgemein"} startEdit={!!cat.isNew}/>)}
  </div>);
}
function CatRow({cat,onSave,onDel,locked,startEdit}){
  const [ed,setEd]=useState(startEdit);const [nm,setNm]=useState(cat.name);const [sc,setSc]=useState(false);const ir=useRef();
  useEffect(()=>{if(ed&&ir.current)ir.current.focus();},[ed]);
  useEffect(()=>{setNm(cat.name);},[cat.name]);
  const doSave=()=>{if(nm.trim()){onSave({name:nm.trim()});setEd(false);}};
  return(<div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:"#111621",borderRadius:7,marginBottom:4,border:"1px solid #1e293b"}}>
    <div style={{position:"relative"}}>
      <div style={{width:22,height:22,borderRadius:5,background:cat.color,cursor:"pointer",border:"2px solid #2a3040"}} onClick={()=>setSc(!sc)}/>
      {sc&&<div style={{position:"absolute",top:28,left:0,background:"#1a1f2b",border:"1px solid #2a3040",borderRadius:8,padding:5,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:3,zIndex:20}}>
        {COLORS.map(c=><div key={c} onClick={()=>{onSave({color:c});setSc(false);}} style={{width:22,height:22,borderRadius:4,background:c,cursor:"pointer",border:c===cat.color?"2px solid white":"2px solid transparent"}}/>)}
      </div>}
    </div>
    {ed?(<form onSubmit={e=>{e.preventDefault();doSave();}} style={{flex:1,display:"flex",gap:4}}>
      <input ref={ir} value={nm} onChange={e=>setNm(e.target.value)} onBlur={doSave} style={{...S.inlInput,flex:1,fontSize:13,padding:"3px 8px"}}/>
      <button type="submit" style={{...S.iBtn,color:"#22c55e"}}><Check size={14}/></button>
    </form>):(<span style={{flex:1,color:"#e2e8f0",fontSize:13,fontWeight:500,cursor:"pointer"}} onClick={()=>setEd(true)}>{cat.name}</span>)}
    {!locked&&<button style={{...S.iBtn,color:"#ef4444"}} onClick={()=>{if(confirm("Kategorie loeschen?"))onDel();}}><Trash2 size={13}/></button>}
  </div>);
}

/* ━━━ CARD EDITOR MODAL with live preview ━━━ */
function CardModal({card,cats,onSave,onClose}){
  const [f,sF]=useState({...card});
  const set=(k,v)=>sF(o=>({...o,[k]:v}));
  const [edKey,setEdKey]=useState(0);
  useEffect(()=>{sF({...card});setEdKey(k=>k+1);},[card.id]);

  const selCat=cats.find(c=>c.id===f.categoryId)||cats[0]||DEFAULT_CAT;

  return(<div style={S.overlay} onClick={onClose}>
    <div style={S.modal} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h3 style={{color:"#f1f5f9",fontSize:17,fontWeight:700}}>{!card.id?"Neue Karte":"Karte bearbeiten"}</h3>
        <button style={S.iBtn} onClick={onClose}><X size={18}/></button>
      </div>

      {/* Two-column layout: editors left, preview right */}
      <div style={{display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>

        {/* LEFT: Editors */}
        <div style={{flex:1,minWidth:280}}>
          <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap",alignItems:"flex-end"}}>
            <div style={{flex:1,minWidth:130}}>
              <label style={S.label}>Kategorie</label>
              <select value={f.categoryId} onChange={e=>set("categoryId",e.target.value)} style={S.sel}>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
            </div>
            <label style={S.chkL}><input type="checkbox" checked={f.isImportant||false} onChange={e=>set("isImportant",e.target.checked)} style={S.chk}/><Star size={13} color="#f59e0b"/> Wichtig</label>
            <label style={S.chkL}><input type="checkbox" checked={f.isExam||false} onChange={e=>set("isExam",e.target.checked)} style={S.chk}/><AlertTriangle size={13} color="#ef4444"/> Pruefung</label>
          </div>

          <div style={{marginBottom:8}}><label style={S.label}><HelpCircle size={12}/> Frage *</label><RichEditor key={`q${edKey}`} value={f.question} onChange={v=>set("question",v)} placeholder="Deine Frage..." minH={55}/></div>
          <div style={{marginBottom:8}}><label style={S.label}><MessageSquare size={12}/> Antwort *</label><RichEditor key={`a${edKey}`} value={f.answer} onChange={v=>set("answer",v)} placeholder="Antwort eingeben..." minH={90}/></div>
          <div style={{marginBottom:8}}><label style={S.label}><Lightbulb size={12} color="#f59e0b"/> Merkhilfe</label><RichEditor key={`h${edKey}`} value={f.hint} onChange={v=>set("hint",v)} placeholder="Eselsbruecke, Merksatz..." minH={40}/></div>
          <div style={{marginBottom:12}}><label style={S.label}><BookOpen size={12} color="#38bdf8"/> Detailwissen</label><RichEditor key={`d${edKey}`} value={f.detail} onChange={v=>set("detail",v)} placeholder="Hintergrundwissen..." minH={40}/></div>
        </div>

        {/* RIGHT: Live A6 Preview */}
        <div style={{flexShrink:0,position:"sticky",top:0}}>
          <CardFitPreview card={f} catColor={selCat.color} catName={selCat.name}/>
        </div>
      </div>

      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
        <button style={S.sec} className="btn" onClick={onClose}>Abbrechen</button>
        <button style={{...S.pri,opacity:(!strip(f.question)||!strip(f.answer))?.5:1}} className="btn" disabled={!strip(f.question)||!strip(f.answer)} onClick={()=>onSave(f)}><Save size={15}/> Speichern</button>
      </div>
    </div>
  </div>);
}

/* ━━━ PREVIEW ━━━ */
function Prev({cards,i,fl,onFlip,onN,onP,onBack,getCat,tot}){
  const card=cards[i];if(!card)return null;const cat=getCat(card.categoryId);
  return(<div style={{animation:"fadeIn .3s ease",textAlign:"center"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <button style={S.sec} className="btn" onClick={onBack}><ChevronLeft size={15}/> Zurueck</button>
      <div style={{display:"flex",alignItems:"center",gap:6}}>{card.isImportant&&<Star size={14} color="#f59e0b" fill="#f59e0b"/>}{card.isExam&&<AlertTriangle size={14} color="#ef4444"/>}<span style={{color:"#94a3b8",fontSize:14,fontWeight:600}}>{i+1} / {tot}</span></div>
      <div style={{width:80}}/>
    </div>
    <div onClick={onFlip} style={{cursor:"pointer",maxWidth:560,margin:"0 auto"}}>
      <div style={{background:fl?cat.color+"0d":"#111621",border:`2px solid ${cat.color}44`,borderRadius:14,padding:20,textAlign:"left",minHeight:240,transition:"all .2s"}}>
        <div style={{background:cat.color,padding:"6px 14px",borderRadius:"6px 6px 0 0",margin:"-20px -20px 14px",display:"flex",justifyContent:"space-between"}}>
          <span style={{color:"white",fontSize:11,fontWeight:600,textTransform:"uppercase"}}>{cat.name}</span>
          <span style={{color:"#ffffff99",fontSize:11}}>{fl?"Antwort":"Frage"}</span>
        </div>
        {!fl?(<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:160}}><Fmt html={card.question} style={{color:"#f1f5f9",fontSize:18,fontWeight:600}}/></div>):(
          <div><Fmt html={card.answer} style={{color:"#e2e8f0",fontSize:14}}/>
            {(card.hint||card.detail)&&<div style={{marginTop:14,padding:10,background:"#f59e0b12",borderRadius:8,borderLeft:"3px solid #f59e0b"}}>
              <p style={{color:"#fbbf24",fontSize:10,fontWeight:700,marginBottom:3,textTransform:"uppercase"}}>Merkhilfe</p>
              {card.hint&&<Fmt html={card.hint} style={{color:"#fcd34d",fontSize:12,fontStyle:"italic"}}/>}
              {card.detail&&<Fmt html={card.detail} style={{color:"#d4a017",fontSize:11,fontStyle:"italic",marginTop:4}}/>}
            </div>}
          </div>
        )}
        <p style={{color:"#475569",fontSize:10,marginTop:14,textAlign:"center"}}>Klicke zum {fl?"zurueckdrehen":"Umdrehen"}</p>
      </div>
    </div>
    <div style={{display:"flex",justifyContent:"center",gap:10,marginTop:18}}>
      <button style={{...S.sec,opacity:i===0?.4:1}} className="btn" onClick={onP} disabled={i===0}><ChevronLeft size={15}/></button>
      <button style={S.pri} className="btn" onClick={onFlip}><RotateCcw size={15}/> Umdrehen</button>
      <button style={{...S.sec,opacity:i===tot-1?.4:1}} className="btn" onClick={onN} disabled={i===tot-1}><ChevronRight size={15}/></button>
    </div>
  </div>);
}

/* ━━━ PRINT A6 ━━━ */
function PrintA6({deck,getCat,onBack}){
  const tot=deck.cards.length;
  return(<div>
    <div className="no-print" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,paddingBottom:12,borderBottom:"1px solid #1e293b",flexWrap:"wrap",gap:8}}>
      <button style={S.sec} className="btn" onClick={onBack}><ChevronLeft size={15}/> Zurueck</button>
      <p style={{color:"#94a3b8",fontSize:11,textAlign:"center",flex:1}}>DIN A6 quer (148x105mm) — Beidseitig, kurze Kante</p>
      <button style={S.pri} className="btn" onClick={()=>window.print()}><Printer size={15}/> Drucken / PDF</button>
    </div>
    <style>{`@media print{@page{size:148mm 105mm;margin:0}body{background:white!important;margin:0}.no-print{display:none!important}.a6p{page-break-after:always;width:148mm;height:105mm;margin:0;box-shadow:none!important;border-radius:0!important}.a6p:last-child{page-break-after:auto}}@media screen{.a6p{margin:6px auto;box-shadow:0 2px 10px #0003}}`}</style>
    {deck.cards.map((card,i)=>{const cat=getCat(card.categoryId);const hasX=card.hint||card.detail;return(
      <div key={i}>
      <div className="a6p" style={{width:"148mm",height:"105mm",background:"white",borderRadius:4,overflow:"hidden",position:"relative"}}>
        <div style={{background:cat.color,padding:"3mm 5mm",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{color:"white",fontSize:10,fontWeight:700,textTransform:"uppercase"}}>{cat.name}</span><span style={{color:"#ffffffbb",fontSize:8}}>Karte {i+1}/{tot}</span></div>
        <div style={{padding:"3mm 5mm"}}><div style={{display:"flex",gap:4,alignItems:"center",marginBottom:2}}><span style={{color:"#6b7280",fontSize:7,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Frage</span>{card.isImportant&&<span style={{fontSize:7,color:"#f59e0b",fontWeight:700}}>★ WICHTIG</span>}{card.isExam&&<span style={{fontSize:7,color:"#ef4444",fontWeight:700}}>⚠ PRUEFUNG</span>}</div><div style={{borderTop:"1px solid #e5e7eb",paddingTop:3}}/><Fmt html={card.question} style={{color:"#111",fontSize:14,fontWeight:700,lineHeight:1.4}}/></div>
        <div style={{position:"absolute",bottom:2,left:0,right:0,textAlign:"center"}}><span style={{color:"#d1d5db",fontSize:5.5}}>{deck.name}</span></div>
      </div>
      <div className="a6p" style={{width:"148mm",height:"105mm",background:`${cat.color}08`,borderRadius:4,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        <div style={{background:cat.color,padding:"2mm 5mm",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{color:"white",fontSize:8,fontWeight:700,textTransform:"uppercase"}}>{cat.name} – Karte {i+1}</span><span style={{color:"white",fontSize:8,fontWeight:700}}>ANTWORT</span></div>
        <div style={{padding:"3mm 5mm",flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <Fmt html={card.answer} style={{color:"#1e293b",fontSize:9.5,lineHeight:1.5,flex:hasX?undefined:1}}/>
          {hasX&&<div style={{marginTop:"auto",padding:"2mm 3mm",background:"#fef3c7",border:"1px solid #f59e0b",borderRadius:3}}>
            <p style={{color:"#92400e",fontSize:7,fontWeight:700,marginBottom:1}}>MERKHILFE / DETAILWISSEN:</p>
            {card.hint&&<Fmt html={card.hint} style={{color:"#78350f",fontSize:8,fontStyle:"italic",lineHeight:1.4}}/>}
            {card.detail&&<Fmt html={card.detail} style={{color:"#78350f",fontSize:7.5,fontStyle:"italic",lineHeight:1.4,marginTop:1}}/>}
          </div>}
        </div>
      </div>
      </div>
    );})}
  </div>);
}

/* ━━━ STYLES ━━━ */
const F="'DM Sans',sans-serif";
const CSS=`*{box-sizing:border-box;margin:0;padding:0}body{background:#0c0f14}::selection{background:#f59e0b44}input:focus,textarea:focus,select:focus{outline:none;box-shadow:0 0 0 2px #f59e0b44}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes toastA{0%{transform:translate(-50%,30px);opacity:0}10%{transform:translate(-50%,0);opacity:1}85%{transform:translate(-50%,0);opacity:1}100%{transform:translate(-50%,30px);opacity:0}}.card-item:hover{background:#1a1f2b!important}.btn:hover{filter:brightness(1.12)}.btn:disabled{opacity:.5;cursor:not-allowed;filter:none}.deck-card:hover{border-color:#f59e0b!important;transform:translateY(-2px)}`;
const S={
  app:{minHeight:"100vh",background:"#0c0f14",fontFamily:F,color:"#e2e8f0"},
  header:{background:"#111621",borderBottom:"1px solid #1a1f2b",padding:"10px 20px",position:"sticky",top:0,zIndex:50},
  hInner:{maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10},
  logo:{width:32,height:32,borderRadius:7,background:"#f59e0b18",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid #f59e0b33"},
  main:{maxWidth:1100,margin:"0 auto",padding:"20px 20px 60px"},
  pri:{background:"#f59e0b",color:"#000",border:"none",borderRadius:7,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:F,transition:"all .15s"},
  sec:{background:"#1a1f2b",color:"#94a3b8",border:"1px solid #2a3040",borderRadius:7,padding:"7px 12px",fontSize:12,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:F,transition:"all .15s"},
  ghost:{background:"transparent",color:"#94a3b8",border:"none",padding:"4px 6px",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:3,fontFamily:F},
  iBtn:{background:"none",border:"none",color:"#64748b",cursor:"pointer",padding:3,borderRadius:4,display:"flex",alignItems:"center"},
  badge:{background:"#f59e0b18",color:"#f59e0b",fontSize:10,fontWeight:600,padding:"1px 7px",borderRadius:20},
  tabB:{background:"none",border:"none",color:"#64748b",fontSize:12,fontWeight:600,cursor:"pointer",padding:"7px 14px",fontFamily:F,transition:"all .15s"},
  tabMini:{background:"none",border:"none",color:"#64748b",fontSize:9,fontWeight:600,cursor:"pointer",padding:"3px 8px",fontFamily:F},
  dCard:{background:"#111621",border:"1px solid #1e293b",borderRadius:10,padding:16,cursor:"pointer",transition:"all .2s",animation:"slideUp .4s ease both"},
  cRow:{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"#111621",borderRadius:7,marginBottom:3,border:"1px solid #1a1f2b",transition:"background .15s"},
  empty:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"50px 16px",gap:10},
  overlay:{position:"fixed",inset:0,background:"#000c",zIndex:100,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"24px 16px",overflowY:"auto",backdropFilter:"blur(3px)"},
  modal:{background:"#111621",border:"1px solid #2a3040",borderRadius:14,padding:22,width:"100%",maxWidth:920,marginTop:10,marginBottom:40},
  label:{color:"#94a3b8",fontSize:10,fontWeight:600,marginBottom:3,display:"flex",alignItems:"center",gap:3,textTransform:"uppercase",letterSpacing:.4},
  sel:{width:"100%",background:"#0c0f14",border:"1px solid #2a3040",borderRadius:7,color:"#e2e8f0",fontSize:13,padding:"7px 10px",fontFamily:F},
  inlInput:{background:"#0c0f14",border:"1px solid #f59e0b44",borderRadius:5,color:"#f1f5f9",fontSize:16,fontWeight:700,padding:"3px 8px",fontFamily:F},
  chkL:{display:"flex",alignItems:"center",gap:4,color:"#94a3b8",fontSize:11,fontWeight:500,cursor:"pointer",padding:"6px 8px",background:"#0c0f14",border:"1px solid #2a3040",borderRadius:7},
  chk:{accentColor:"#f59e0b",width:14,height:14,cursor:"pointer"},
  toast:{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:"#f59e0b",color:"#000",padding:"8px 20px",borderRadius:8,fontSize:13,fontWeight:600,zIndex:200,animation:"toastA 2s ease both",fontFamily:F},
  center:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0c0f14"},
  spinner:{width:28,height:28,border:"3px solid #1e293b",borderTop:"3px solid #f59e0b",borderRadius:"50%",animation:"spin .8s linear infinite"},
};
