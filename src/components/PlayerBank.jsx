import React, { useState } from 'react'

export default function PlayerBank({ players, playerColors, roster, innings, onAdd, onRemove, onClearAll }) {
  const [input, setInput] = useState('')

  function isAssigned(name) {
    for (const inning of innings) {
      for (const pos of Object.keys(roster[inning])) {
        if (roster[inning][pos] === name) return true
      }
    }
    return false
  }

  function handleSubmit(e) {
    e.preventDefault()
    onAdd(input)
    setInput('')
  }

  return (
    <div className="player-bank">
      <div className="player-bank-header">
        <h2>Players</h2>
        {players.length > 0 && (
          <button
            className="clear-players-btn"
            title="Remove all players"
            onClick={() => {
              if (window.confirm('Remove all players? This will also clear all inning assignments.')) {
                onClearAll()
              }
            }}
          >
            ↺
          </button>
        )}
      </div>
      <form className="add-player-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Player name"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit" disabled={!input.trim()}>
          Add
        </button>
      </form>
      {players.length === 0 ? (
        <p className="empty-bank">No players yet.</p>
      ) : (
        <ul className="player-list">
          {players.map(name => (
            <li key={name} className="player-item">
              <span className="player-color-dot" style={{ background: playerColors[name] }} />
              <span className="player-name">{name}</span>
              <button
                className="remove-btn"
                title={isAssigned(name) ? 'Removing will clear all assignments for this player' : 'Remove player'}
                onClick={() => {
                  if (
                    !isAssigned(name) ||
                    window.confirm(`Remove ${name}? They will be cleared from all inning assignments.`)
                  ) {
                    onRemove(name)
                  }
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="bank-count">{players.length} player{players.length !== 1 ? 's' : ''}</p>
    </div>
  )
}
