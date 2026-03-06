"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Palette } from "lucide-react";
import { FONT_FAMILY, TEXT_COLORS } from "@/constants/colors";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minH?: number;
}

function ToolbarButton({ icon, title, onClick }: { icon: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "2px 5px", borderRadius: 3, display: "flex", alignItems: "center" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#2a3040")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
    >
      {icon}
    </button>
  );
}

function Separator() {
  return <div style={{ width: 1, height: 16, background: "#2a3040", margin: "0 2px" }} />;
}

export function RichEditor({ value, onChange, placeholder, minH = 60 }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [height, setHeight] = useState(minH);

  useEffect(() => {
    if (editorRef.current && !initialized.current) {
      editorRef.current.innerHTML = value || "";
      initialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (editorRef.current && initialized.current) {
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  // Note: document.execCommand is deprecated but still widely supported.
  // A proper replacement would require a third-party rich-text library.
  const execCommand = (command: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    onChange(editorRef.current?.innerHTML || "");
  };

  const handleInput = () => onChange(editorRef.current?.innerHTML || "");

  const onDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const startY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      const startH = height;
      const onMove = (ev: MouseEvent | TouchEvent) => {
        const y = "touches" in ev ? ev.touches[0].clientY : (ev as MouseEvent).clientY;
        setHeight(Math.max(minH, startH + (y - startY)));
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.removeEventListener("touchmove", onMove);
        document.removeEventListener("touchend", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.addEventListener("touchmove", onMove);
      document.addEventListener("touchend", onUp);
    },
    [height, minH]
  );

  return (
    <div style={{ border: "1px solid #2a3040", borderRadius: 8, overflow: "hidden", background: "#0c0f14" }}>
      <div style={{ display: "flex", gap: 1, padding: "3px 5px", background: "#151a25", borderBottom: "1px solid #2a3040", flexWrap: "wrap", alignItems: "center" }}>
        <ToolbarButton icon={<Bold size={13} />} title="Fett" onClick={() => execCommand("bold")} />
        <ToolbarButton icon={<Italic size={13} />} title="Kursiv" onClick={() => execCommand("italic")} />
        <Separator />
        <ToolbarButton icon={<List size={13} />} title="Aufzählung" onClick={() => execCommand("insertUnorderedList")} />
        <ToolbarButton icon={<ListOrdered size={13} />} title="Nummeriert" onClick={() => execCommand("insertOrderedList")} />
        <Separator />
        <ToolbarButton icon={<span style={{ fontSize: 13, fontWeight: 800 }}>A</span>} title="Größer" onClick={() => execCommand("fontSize", "5")} />
        <ToolbarButton icon={<span style={{ fontSize: 10, fontWeight: 800 }}>A</span>} title="Kleiner" onClick={() => execCommand("fontSize", "2")} />
        <Separator />
        <div style={{ position: "relative" }}>
          <ToolbarButton icon={<Palette size={13} />} title="Farbe" onClick={() => setShowColorPicker((v) => !v)} />
          {showColorPicker && (
            <div style={{ position: "absolute", top: 26, left: 0, background: "#1a1f2b", border: "1px solid #2a3040", borderRadius: 8, padding: 5, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 3, zIndex: 20 }}>
              {TEXT_COLORS.map((color) => (
                <div key={color} onClick={() => { execCommand("foreColor", color); setShowColorPicker(false); }}
                  style={{ width: 20, height: 20, borderRadius: 3, background: color, cursor: "pointer", border: "2px solid #2a3040" }} />
              ))}
            </div>
          )}
        </div>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        style={{ height, padding: "8px 11px", color: "#e2e8f0", fontSize: 13, lineHeight: 1.6, fontFamily: FONT_FAMILY, outline: "none", wordBreak: "break-word", overflowY: "auto" }}
      />
      <div onMouseDown={onDragStart} onTouchStart={onDragStart}
        style={{ height: 8, cursor: "ns-resize", background: "#151a25", borderTop: "1px solid #2a3040", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 30, height: 3, borderRadius: 2, background: "#334155" }} />
      </div>
      <style>{`[data-placeholder]:empty::before{content:attr(data-placeholder);color:#4a5568;pointer-events:none}[contenteditable] ul,[contenteditable] ol{padding-left:18px;margin:3px 0}[contenteditable] li{margin:1px 0}`}</style>
    </div>
  );
}
