import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { WALL_HEIGHT_CM, WALL_WIDTH_CM } from '../lib/data';
import { TAKEN_COLOR, TYPE_COLORS, WALL_COLOR } from '../lib/colors';
import { ariaLabel, euro } from '../lib/format';
import type { Spot } from '../lib/types';

interface Props {
  spots: Spot[];
  auctionAmount: number;
  hasBids: boolean;
  selectedId?: string;
  onSelect: (id: string) => void;
}

interface View {
  x: number;
  y: number;
  scale: number;
}

const MAX_SCALE = 6;
const TAP_SLOP_PX = 8;
/** Kleinste leesbare letter op het scherm; kleiner = tekst verbergen. */
const MIN_FONT_PX = 9;
const HOME: View = { x: 0, y: 0, scale: 1 };

function clampView(view: View): View {
  const scale = Math.min(MAX_SCALE, Math.max(1, view.scale));
  const w = WALL_WIDTH_CM / scale;
  const h = WALL_HEIGHT_CM / scale;
  return {
    scale,
    x: Math.min(WALL_WIDTH_CM - w, Math.max(0, view.x)),
    y: Math.min(WALL_HEIGHT_CM - h, Math.max(0, view.y)),
  };
}

/** Zoom met factor rond een punt (in cm), zodat dat punt op dezelfde plek blijft. */
function zoomAround(view: View, factor: number, cx: number, cy: number): View {
  const scale = Math.min(MAX_SCALE, Math.max(1, view.scale * factor));
  const ratio = view.scale / scale;
  return clampView({ scale, x: cx - (cx - view.x) * ratio, y: cy - (cy - view.y) * ratio });
}

export function WallMap({ spots, auctionAmount, hasBids, selectedId, onSelect }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState<View>(HOME);
  const [pxPerCm, setPxPerCm] = useState(1);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    startView: View;
    startX: number;
    startY: number;
    startDist: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);

  const viewW = WALL_WIDTH_CM / view.scale;
  const viewH = WALL_HEIGHT_CM / view.scale;

  // Schermgrootte bijhouden om te bepalen of tekst in een vak nog leesbaar is.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const observer = new ResizeObserver(() => setPxPerCm(svg.clientWidth / WALL_WIDTH_CM));
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  // Ctrl/⌘ + scroll (en knijpen op een trackpad) zoomt; gewoon scrollen scrollt de pagina.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const rect = svg.getBoundingClientRect();
      setView((v) => {
        const cx = v.x + ((event.clientX - rect.left) / rect.width) * (WALL_WIDTH_CM / v.scale);
        const cy = v.y + ((event.clientY - rect.top) / rect.height) * (WALL_HEIGHT_CM / v.scale);
        return zoomAround(v, Math.exp(-event.deltaY * 0.01), cx, cy);
      });
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, []);

  // Geselecteerd vak (bijv. via #T07 of de lijst) in beeld brengen als er ingezoomd is.
  // Bewust tijdens het renderen (React-patroon "state aanpassen bij gewijzigde props").
  const [shownId, setShownId] = useState(selectedId);
  if (shownId !== selectedId) {
    setShownId(selectedId);
    const spot = spots.find((s) => s.id === selectedId);
    const inView =
      spot &&
      spot.x_cm >= view.x &&
      spot.y_cm >= view.y &&
      spot.x_cm + spot.w_cm <= view.x + viewW &&
      spot.y_cm + spot.h_cm <= view.y + viewH;
    if (spot && !inView) {
      setView(
        clampView({
          ...view,
          x: spot.x_cm + spot.w_cm / 2 - viewW / 2,
          y: spot.y_cm + spot.h_cm / 2 - viewH / 2,
        }),
      );
    }
  }

  function startGesture() {
    const pts = [...pointers.current.values()];
    const [a, b] = pts;
    if (!a) {
      gesture.current = null;
      return;
    }
    const cx = b ? (a.x + b.x) / 2 : a.x;
    const cy = b ? (a.y + b.y) / 2 : a.y;
    gesture.current = {
      startView: view,
      startX: cx,
      startY: cy,
      startDist: b ? Math.hypot(a.x - b.x, a.y - b.y) : 0,
      moved: gesture.current?.moved ?? false,
    };
  }

  function onPointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 1) suppressClick.current = false;
    startGesture();
  }

  function onPointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const g = gesture.current;
    const svg = svgRef.current;
    if (!g || !svg) return;

    const [a, b] = [...pointers.current.values()];
    if (!a) return;
    const cx = b ? (a.x + b.x) / 2 : a.x;
    const cy = b ? (a.y + b.y) / 2 : a.y;
    const dist = b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;

    if (!g.moved) {
      if (!b && Math.hypot(cx - g.startX, cy - g.startY) < TAP_SLOP_PX) return;
      // Bij 1 vinger zonder zoom: laat de pagina scrollen, niet de kaart.
      if (!b && g.startView.scale === 1) return;
      g.moved = true;
      suppressClick.current = true;
      svg.setPointerCapture(event.pointerId);
    }

    const rect = svg.getBoundingClientRect();
    const cmPerPx = WALL_WIDTH_CM / g.startView.scale / rect.width;
    let next: View = {
      ...g.startView,
      x: g.startView.x - (cx - g.startX) * cmPerPx,
      y: g.startView.y - (cy - g.startY) * cmPerPx,
    };
    if (b && g.startDist > 0) {
      const anchorX = g.startView.x + (g.startX - rect.left) * cmPerPx;
      const anchorY = g.startView.y + (g.startY - rect.top) * cmPerPx;
      const zoomed = zoomAround(g.startView, dist / g.startDist, anchorX, anchorY);
      const newCmPerPx = WALL_WIDTH_CM / zoomed.scale / rect.width;
      next = {
        scale: zoomed.scale,
        x: zoomed.x - (cx - g.startX) * newCmPerPx,
        y: zoomed.y - (cy - g.startY) * newCmPerPx,
      };
    }
    setView(clampView(next));
  }

  function onPointerUp(event: PointerEvent<SVGSVGElement>) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size === 0) gesture.current = null;
    else startGesture();
  }

  function activate(id: string) {
    if (suppressClick.current) return;
    onSelect(id);
  }

  function onSpotKey(event: KeyboardEvent, id: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(id);
    }
  }

  const zoomBy = (factor: number) =>
    setView((v) => zoomAround(v, factor, v.x + viewW / 2, v.y + viewH / 2));

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox={`${view.x} ${view.y} ${viewW} ${viewH}`}
        className="block h-auto w-full select-none rounded-lg border border-stone-300 bg-[var(--wall)] shadow-sm"
        style={{ touchAction: view.scale > 1 ? 'none' : 'pan-y', aspectRatio: '320 / 230' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="group"
        aria-label="Muurkaart, 320 bij 230 cm. Kies een vak."
      >
        <rect x={0} y={0} width={WALL_WIDTH_CM} height={WALL_HEIGHT_CM} fill={WALL_COLOR} />
        <defs>
          <pattern
            id="hatch"
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="4" height="4" fill="#e7e5e4" />
            <line x1="0" y1="0" x2="0" y2="4" stroke="#a8a29e" strokeWidth="1.2" />
          </pattern>
        </defs>
        {spots.map((spot) => (
          <SpotShape
            key={spot.id}
            spot={spot}
            pxPerCm={pxPerCm * view.scale}
            selected={spot.id === selectedId}
            auctionLabel={`${hasBids ? 'Hoogste bod' : 'Startbod'} ${euro(auctionAmount)}`}
            onActivate={activate}
            onKey={onSpotKey}
          />
        ))}
      </svg>
      <div className="mt-2 flex justify-end gap-2">
        <MapButton label="Inzoomen" onClick={() => zoomBy(1.6)} disabled={view.scale >= MAX_SCALE}>
          +
        </MapButton>
        <MapButton label="Uitzoomen" onClick={() => zoomBy(1 / 1.6)} disabled={view.scale <= 1}>
          −
        </MapButton>
        {view.scale > 1 && (
          <MapButton label="Hele muur tonen" onClick={() => setView(HOME)}>
            ⤢
          </MapButton>
        )}
      </div>
    </div>
  );
}

function MapButton(props: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-label={props.label}
      title={props.label}
      onClick={props.onClick}
      disabled={props.disabled}
      className="grid h-11 w-11 place-items-center rounded-full border border-stone-300 bg-white/95 text-xl font-bold text-stone-900 shadow disabled:opacity-40"
    >
      {props.children}
    </button>
  );
}

interface SpotShapeProps {
  spot: Spot;
  pxPerCm: number;
  selected: boolean;
  auctionLabel: string;
  onActivate: (id: string) => void;
  onKey: (event: KeyboardEvent, id: string) => void;
}

function SpotShape({ spot, pxPerCm, selected, auctionLabel, onActivate, onKey }: SpotShapeProps) {
  const { id, x_cm: x, y_cm: y, w_cm: w, h_cm: h, status } = spot;
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = status === 'verkocht' && Boolean(spot.logo_url) && !logoFailed;
  const colors =
    status === 'bezet'
      ? TAKEN_COLOR
      : status === 'verkocht'
        ? { fill: '#ffffff', text: '#1c1917' }
        : TYPE_COLORS[spot.type];

  let lines: string[];
  switch (status) {
    case 'vrij':
      lines = [id, euro(spot.prijs_eur)];
      break;
    case 'bezet':
      lines = ['bezet'];
      break;
    case 'veiling':
      lines = ['The Spot', auctionLabel];
      break;
    case 'geblokkeerd':
      lines = [id];
      break;
    case 'verkocht':
      lines = showLogo ? [] : [spot.koper || id];
      break;
  }

  return (
    <g
      className="spot cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={ariaLabel(spot)}
      aria-pressed={selected}
      data-id={id}
      onClick={() => onActivate(id)}
      onKeyDown={(event) => onKey(event, id)}
    >
      <rect
        className="box"
        x={x + 0.5}
        y={y + 0.5}
        width={w - 1}
        height={h - 1}
        fill={status === 'geblokkeerd' ? 'url(#hatch)' : colors.fill}
        stroke={selected ? '#111' : '#1c1917'}
        strokeWidth={selected ? 1.6 : 0.6}
      />
      {showLogo && (
        <image
          href={spot.logo_url}
          x={x + 1.5}
          y={y + 1.5}
          width={w - 3}
          height={h - 3}
          preserveAspectRatio="xMidYMid meet"
          onError={() => setLogoFailed(true)}
        />
      )}
      <SpotLabel x={x} y={y} w={w} h={h} lines={lines} color={colors.text} pxPerCm={pxPerCm} />
    </g>
  );
}

/** Tekst in een vak; verdwijnt als die op het huidige scherm/zoomniveau niet leesbaar past. */
function SpotLabel(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  lines: string[];
  color: string;
  pxPerCm: number;
}) {
  const { x, y, w, h, lines, color, pxPerCm } = props;
  if (lines.length === 0) return null;
  const longest = Math.max(...lines.map((l) => l.length));
  const size = Math.min((h * 0.8) / (lines.length * 1.2), ((w - 2) / longest) * 1.7, 12);
  const visible = lines.filter((_, i) => i === 0 || size * pxPerCm >= MIN_FONT_PX);
  if (size * pxPerCm < MIN_FONT_PX) return null;
  const top = y + h / 2 - ((visible.length - 1) * size * 1.15) / 2;
  return (
    <text
      x={x + w / 2}
      textAnchor="middle"
      dominantBaseline="central"
      fill={color}
      fontSize={size}
      fontWeight={700}
      pointerEvents="none"
      aria-hidden="true"
    >
      {visible.map((line, i) => (
        <tspan key={i} x={x + w / 2} y={top + i * size * 1.15} fontWeight={i === 0 ? 700 : 500}>
          {line}
        </tspan>
      ))}
    </text>
  );
}
