import React from 'react'

const NODE_W = 108
const NODE_H = 52

const POSITION_NODES = [
  { name: 'Left Field',   cx: 85,  cy: 115 },
  { name: 'Left Center',  cx: 200, cy: 62  },
  { name: 'Right Center', cx: 400, cy: 62  },
  { name: 'Right Field',  cx: 515, cy: 115 },
  { name: 'Shortstop',    cx: 195, cy: 228 },
  { name: '3rd Base',     cx: 160, cy: 300 },
  { name: '2nd Base',     cx: 300, cy: 180 },
  { name: '1st Base',     cx: 440, cy: 300 },
  { name: 'Pitcher',      cx: 300, cy: 276 },
  { name: 'Catcher',      cx: 300, cy: 445 },
]

export default function FieldView({ players, playerColors, inningRoster, onAssign }) {
  const assignedPlayers = new Set(Object.values(inningRoster).filter(Boolean))

  return (
    <div className="field-container">
      <svg
        viewBox="0 0 600 490"
        xmlns="http://www.w3.org/2000/svg"
        className="field-svg"
      >
        {/* Background */}
        <rect width="600" height="490" fill="white" />

        {/* Fair territory wedge */}
        <path d="M 300 420 L 30 189 Q 300 30 570 189 Z" fill="#f5f5f5" stroke="#bbb" strokeWidth="1" />

        {/* Infield diamond */}
        <polygon points="300,420 440,300 300,180 160,300" fill="#eeeeee" stroke="#bbb" strokeWidth="1" />

        {/* Foul lines */}
        <line x1="300" y1="420" x2="30"  y2="189" stroke="#999" strokeWidth="1.5" />
        <line x1="300" y1="420" x2="570" y2="189" stroke="#999" strokeWidth="1.5" />

        {/* Outfield arc */}
        <path
          d="M 30 189 Q 300 30 570 189"
          fill="none"
          stroke="#aaa"
          strokeWidth="1.5"
          strokeDasharray="8,5"
        />

        {/* Base paths */}
        <line x1="300" y1="420" x2="440" y2="300" stroke="#888" strokeWidth="1.5" />
        <line x1="440" y1="300" x2="300" y2="180" stroke="#888" strokeWidth="1.5" />
        <line x1="300" y1="180" x2="160" y2="300" stroke="#888" strokeWidth="1.5" />
        <line x1="160" y1="300" x2="300" y2="420" stroke="#888" strokeWidth="1.5" />

        {/* Home plate */}
        <polygon points="300,429 290,421 293,412 307,412 310,421" fill="#ccc" stroke="#999" strokeWidth="1" />

        {/* 1st base */}
        <rect x="433" y="293" width="14" height="14" fill="#ccc" stroke="#999" strokeWidth="1" rx="1" transform="rotate(45,440,300)" />

        {/* 2nd base */}
        <rect x="293" y="173" width="14" height="14" fill="#ccc" stroke="#999" strokeWidth="1" rx="1" transform="rotate(45,300,180)" />

        {/* 3rd base */}
        <rect x="153" y="293" width="14" height="14" fill="#ccc" stroke="#999" strokeWidth="1" rx="1" transform="rotate(45,160,300)" />

        {/* Pitcher's mound */}
        <circle cx="300" cy="305" r="14" fill="#ddd" stroke="#aaa" strokeWidth="1.5" />

        {/* Position nodes */}
        {POSITION_NODES.map(({ name, cx, cy }) => {
          const x = cx - NODE_W / 2
          const y = cy - NODE_H / 2
          const current = inningRoster[name] || ''
          const color = current ? playerColors[current] : null
          return (
            <foreignObject key={name} x={x} y={y} width={NODE_W} height={NODE_H}>
              <div
                className="pos-node"
                style={color ? { background: color, boxShadow: `0 1px 4px ${color}99` } : undefined}
              >
                <span
                  className="pos-label"
                  style={color ? { color: 'rgba(255,255,255,0.85)' } : undefined}
                >
                  {name}
                </span>
                <select
                  value={current}
                  onChange={e => onAssign(name, e.target.value)}
                  className={`pos-select${current ? ' assigned' : ''}`}
                  style={color ? { borderColor: 'rgba(255,255,255,0.4)', color: '#222' } : undefined}
                >
                  <option value="">—</option>
                  {players.map(p => (
                    <option key={p} value={p}>
                      {assignedPlayers.has(p) && p !== current ? `${p} ★` : p}
                    </option>
                  ))}
                </select>
              </div>
            </foreignObject>
          )
        })}
      </svg>
    </div>
  )
}
