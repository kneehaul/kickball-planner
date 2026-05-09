import React, { useState, useEffect, useRef } from 'react'
import PlayerBank from './components/PlayerBank'
import FieldView from './components/FieldView'

const POSITIONS = [
  'Pitcher',
  'Catcher',
  '1st Base',
  '2nd Base',
  '3rd Base',
  'Shortstop',
  'Left Field',
  'Left Center',
  'Right Center',
  'Right Field',
]

const POS_ABBR = {
  'Pitcher':      'P',
  'Catcher':      'C',
  '1st Base':     '1B',
  '2nd Base':     '2B',
  '3rd Base':     '3B',
  'Shortstop':    'SS',
  'Left Field':   'LF',
  'Left Center':  'LC',
  'Right Center': 'RC',
  'Right Field':  'RF',
}

function getInitials(name) {
  if (!name) return '—'
  return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).join('')
}

const PRINT_NODE_W = 108
const PRINT_NODE_H = 52

const PRINT_POSITION_NODES = [
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

function PrintFieldView({ playerColors, inningRoster }) {
  return (
    <svg viewBox="0 0 600 490" className="print-field-svg">
      {/* Background */}
      <rect width="600" height="490" fill="white" />
      {/* Fair territory */}
      <path d="M 300 420 L 30 189 Q 300 30 570 189 Z" fill="#f5f5f5" stroke="#bbb" strokeWidth="1" />
      {/* Infield */}
      <polygon points="300,420 440,300 300,180 160,300" fill="#eeeeee" stroke="#bbb" strokeWidth="1" />
      {/* Foul lines */}
      <line x1="300" y1="420" x2="30"  y2="189" stroke="#999" strokeWidth="1.5" />
      <line x1="300" y1="420" x2="570" y2="189" stroke="#999" strokeWidth="1.5" />
      {/* Outfield arc */}
      <path d="M 30 189 Q 300 30 570 189" fill="none" stroke="#aaa" strokeWidth="1.5" strokeDasharray="8,5" />
      {/* Base paths */}
      <line x1="300" y1="420" x2="440" y2="300" stroke="#888" strokeWidth="1.5" />
      <line x1="440" y1="300" x2="300" y2="180" stroke="#888" strokeWidth="1.5" />
      <line x1="300" y1="180" x2="160" y2="300" stroke="#888" strokeWidth="1.5" />
      <line x1="160" y1="300" x2="300" y2="420" stroke="#888" strokeWidth="1.5" />
      {/* Home plate */}
      <polygon points="300,429 290,421 293,412 307,412 310,421" fill="#ccc" stroke="#999" strokeWidth="1" />
      {/* Bases */}
      <rect x="433" y="293" width="14" height="14" fill="#ccc" stroke="#999" strokeWidth="1" rx="1" transform="rotate(45,440,300)" />
      <rect x="293" y="173" width="14" height="14" fill="#ccc" stroke="#999" strokeWidth="1" rx="1" transform="rotate(45,300,180)" />
      <rect x="153" y="293" width="14" height="14" fill="#ccc" stroke="#999" strokeWidth="1" rx="1" transform="rotate(45,160,300)" />
      {/* Pitcher's mound */}
      <circle cx="300" cy="305" r="14" fill="#ddd" stroke="#aaa" strokeWidth="1.5" />

      {/* Position nodes — pure SVG text, no foreignObject */}
      {PRINT_POSITION_NODES.map(({ name, cx, cy }) => {
        const x = cx - PRINT_NODE_W / 2
        const y = cy - PRINT_NODE_H / 2
        const player = inningRoster[name] || ''
        const color = player ? playerColors[player] : null
        return (
          <g key={name}>
            <rect
              x={x} y={y}
              width={PRINT_NODE_W} height={PRINT_NODE_H}
              rx={4}
              fill={color || 'rgba(255,255,255,0.93)'}
              stroke={color ? color : '#ccc'}
              strokeWidth={1}
            />
            <text
              x={cx} y={y + 14}
              textAnchor="middle"
              fontSize={7}
              fontWeight={700}
              fill={color ? 'rgba(255,255,255,0.85)' : '#1a6b3c'}
              fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
              letterSpacing="0.5"
            >
              {name.toUpperCase()}
            </text>
            <text
              x={cx} y={y + 37}
              textAnchor="middle"
              fontSize={10}
              fontWeight={600}
              fill={color ? 'white' : '#333'}
              fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
            >
              {player || '—'}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// Ordered so sequential entries land on opposite sides of the color wheel
const PLAYER_COLORS = [
  '#e53935', // 1  red
  '#1565c0', // 2  dark blue
  '#2e7d32', // 3  dark green
  '#f57c00', // 4  orange
  '#7b1fa2', // 5  purple
  '#00838f', // 6  teal
  '#f9a825', // 7  amber
  '#283593', // 8  indigo
  '#558b2f', // 9  olive
  '#d81b60', // 10 hot pink
  '#0277bd', // 11 sky blue
  '#bf360c', // 12 rust
  '#00695c', // 13 dark teal
  '#6a1b9a', // 14 deep purple
  '#c62828', // 15 dark red
  '#039be5', // 16 light blue
  '#33691e', // 17 forest green
  '#ad1457', // 18 dark pink
  '#4527a0', // 19 deep indigo
  '#e65100', // 20 burnt orange
  '#006064', // 21 dark cyan
  '#880e4f', // 22 maroon
  '#43a047', // 23 medium green
  '#1976d2', // 24 medium blue
  '#6d4c41', // 25 brown
]

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) }
  catch {}
}

function emptyInning() {
  const inning = {}
  for (const pos of POSITIONS) inning[pos] = ''
  return inning
}

export default function App() {
  const [players, setPlayers] = useState(() => load('kickball_players', []))
  const [playerColors, setPlayerColors] = useState(() => load('kickball_playerColors', {}))
  const [innings, setInnings] = useState(() => load('kickball_innings', [1]))
  const [roster, setRoster] = useState(() => load('kickball_roster', { 1: emptyInning() }))
  const [inningNames, setInningNames] = useState(() => load('kickball_inningNames', {}))
  const [activeInning, setActiveInning] = useState(
    () => load('kickball_innings', [1])[0] ?? 1
  )
  const [editingInning, setEditingInning] = useState(null)
  const [editValue, setEditValue] = useState('')
  const editInputRef = useRef(null)

  useEffect(() => { save('kickball_players', players) }, [players])
  useEffect(() => { save('kickball_playerColors', playerColors) }, [playerColors])
  useEffect(() => { save('kickball_innings', innings) }, [innings])
  useEffect(() => { save('kickball_roster', roster) }, [roster])
  useEffect(() => { save('kickball_inningNames', inningNames) }, [inningNames])

  function inningLabel(i) {
    return inningNames[i] || `Inning ${i}`
  }

  function startEditInning(i) {
    setEditingInning(i)
    setEditValue(inningNames[i] || `Inning ${i}`)
    setTimeout(() => editInputRef.current?.select(), 0)
  }

  function commitEditInning() {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== `Inning ${editingInning}`) {
      setInningNames(prev => ({ ...prev, [editingInning]: trimmed }))
    } else if (!trimmed || trimmed === `Inning ${editingInning}`) {
      setInningNames(prev => { const n = { ...prev }; delete n[editingInning]; return n })
    }
    setEditingInning(null)
  }

  function addInning() {
    const next = innings[innings.length - 1] + 1
    setInnings(prev => [...prev, next])
    setRoster(prev => ({ ...prev, [next]: emptyInning() }))
    setActiveInning(next)
  }

  function removeInning(inning) {
    if (!window.confirm(`Delete ${inningLabel(inning)}? All assignments for this inning will be lost.`)) return
    const next = innings.filter(i => i !== inning)
    setInnings(next)
    setRoster(prev => { const u = { ...prev }; delete u[inning]; return u })
    setInningNames(prev => { const u = { ...prev }; delete u[inning]; return u })
    if (activeInning === inning) {
      const idx = innings.indexOf(inning)
      setActiveInning(next[Math.min(idx, next.length - 1)])
    }
  }

  function clearPlayers() {
    setPlayers([])
    setPlayerColors({})
    setRoster(prev => {
      const next = {}
      for (const inning of innings) next[inning] = emptyInning()
      return next
    })
  }

  function addPlayer(name) {
    const trimmed = name.trim()
    if (!trimmed || players.includes(trimmed)) return
    setPlayers(prev => [...prev, trimmed])
    setPlayerColors(prev => ({
      ...prev,
      [trimmed]: PLAYER_COLORS[Object.keys(prev).length % PLAYER_COLORS.length],
    }))
  }

  function removePlayer(name) {
    setPlayers(prev => prev.filter(p => p !== name))
    setPlayerColors(prev => {
      const next = { ...prev }
      delete next[name]
      return next
    })
    setRoster(prev => {
      const next = {}
      for (const inning of innings) {
        next[inning] = {}
        for (const pos of POSITIONS) {
          next[inning][pos] = prev[inning][pos] === name ? '' : prev[inning][pos]
        }
      }
      return next
    })
  }

  function assignPlayer(inning, position, playerName) {
    setRoster(prev => ({
      ...prev,
      [inning]: {
        ...prev[inning],
        [position]: playerName,
      },
    }))
  }

  function getBench(inning) {
    if (!roster[inning]) return []
    const assigned = new Set(Object.values(roster[inning]).filter(Boolean))
    return players.filter(p => !assigned.has(p))
  }

  const bench = getBench(activeInning)

  return (
    <div className="app">
      <header className="app-header no-print">
        <h1>Kickball Roster Planner</h1>
      </header>
      <div className="app-body">
        <aside className="sidebar no-print">
          <PlayerBank
            players={players}
            playerColors={playerColors}
            roster={roster}
            innings={innings}
            onAdd={addPlayer}
            onRemove={removePlayer}
            onClearAll={clearPlayers}
            onReorder={setPlayers}
          />
        </aside>
        <main className="main-content">
          <div className="roster-header no-print">
            <h2>Field Lineup</h2>
            <div className="header-actions">
              <button className="new-roster-btn" onClick={() => {
                if (!window.confirm('Start a new lineup? This will clear all innings and assignments.')) return
                setInnings([1])
                setRoster({ 1: emptyInning() })
                setActiveInning(1)
                setInningNames({})
              }}>
                New Lineup
              </button>
              <button className="export-btn" onClick={() => window.print()}>
                Export to PDF
              </button>
            </div>
          </div>

          <div className="inning-tabs no-print">
            {innings.map(i => (
              <div
                key={i}
                className={`inning-tab${activeInning === i ? ' active' : ''}`}
                onClick={() => setActiveInning(i)}
                onDoubleClick={e => { e.stopPropagation(); startEditInning(i) }}
              >
                {editingInning === i ? (
                  <input
                    ref={editInputRef}
                    className="inning-tab-input"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={commitEditInning}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitEditInning()
                      if (e.key === 'Escape') setEditingInning(null)
                    }}
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  inningLabel(i)
                )}
                {innings.length > 1 && editingInning !== i && (
                  <span
                    className="inning-tab-close"
                    onClick={e => { e.stopPropagation(); removeInning(i) }}
                  >
                    ×
                  </span>
                )}
              </div>
            ))}
            <button className="inning-tab add-inning-btn" onClick={addInning}>
              + Add Inning
            </button>
          </div>

          {/* Interactive view */}
          <div className="field-and-summary no-print">
            <div className="field-side">
              <FieldView
                players={players}
                playerColors={playerColors}
                inningRoster={roster[activeInning]}
                onAssign={(position, playerName) => assignPlayer(activeInning, position, playerName)}
              />
              <div className="bench-section">
                <h3>Bench — {inningLabel(activeInning)}</h3>
                <div className="bench-players">
                  {bench.length === 0 ? (
                    <span className="bench-empty">Everyone is assigned</span>
                  ) : (
                    bench.map(name => (
                      <span key={name} className="bench-player">{name}</span>
                    ))
                  )}
                </div>
              </div>

              <div className="summary-panel">
                <h3 className="summary-title">All Innings</h3>
                <div className="summary-scroll">
                  <table className="summary-table">
                    <thead>
                      <tr>
                        <th className="summary-inning-col">Inning</th>
                        {POSITIONS.map(pos => (
                          <th key={pos}>{pos}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {innings.map(i => (
                        <tr
                          key={i}
                          className={activeInning === i ? 'summary-row active' : 'summary-row'}
                          onClick={() => setActiveInning(i)}
                        >
                          <td className="summary-inning-col">{inningLabel(i)}</td>
                          {POSITIONS.map(pos => {
                            const player = roster[i]?.[pos]
                            return (
                              <td
                                key={pos}
                                style={player ? { color: playerColors[player], fontWeight: 700 } : undefined}
                              >
                                {player || '—'}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Print-only view */}
          <div className="print-only">

            {/* Page 1: kicking order + summary */}
            <div className="print-inning print-summary-page">
              <h2 className="print-inning-label">Lineup Summary</h2>
              <div className="print-summary-layout">
                <div className="print-kicking-order">
                  <h3 className="print-section-label">Kicking Order</h3>
                  <ol className="print-kicking-list">
                    {players.map(name => (
                      <li key={name} className="print-kicking-item">
                        <span className="print-kicking-dot" style={{ background: playerColors[name] }} />
                        {name}
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="print-summary-right">
                  <h3 className="print-section-label">Inning Assignments</h3>
                  <table className="print-summary-table">
                    <thead>
                      <tr>
                        <th className="print-summary-inning">Inning</th>
                        {POSITIONS.map(pos => (
                          <th key={pos} title={pos}>{POS_ABBR[pos]}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {innings.map(i => (
                        <tr key={i}>
                          <td className="print-summary-inning">{inningLabel(i)}</td>
                          {POSITIONS.map(pos => {
                            const player = roster[i]?.[pos]
                            return (
                              <td
                                key={pos}
                                className="print-summary-cell"
                                style={player ? { color: playerColors[player] } : undefined}
                              >
                                {player || '—'}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Pages 2+: one field per inning */}
            {innings.map(i => {
              const benchForInning = getBench(i)
              return (
                <div key={i} className="print-inning">
                  <h2 className="print-inning-label">{inningLabel(i)}</h2>
                  <PrintFieldView
                    playerColors={playerColors}
                    inningRoster={roster[i]}
                  />
                  <div className="bench-section">
                    <h3>Bench</h3>
                    <div className="bench-players">
                      {benchForInning.length === 0 ? (
                        <span className="bench-empty">Everyone is assigned</span>
                      ) : (
                        benchForInning.map(name => (
                          <span key={name} className="bench-player">{name}</span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}
