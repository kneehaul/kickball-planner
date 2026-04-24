import React, { useState, useRef, useEffect } from 'react'

export default function PlayerBank({ players, playerColors, roster, innings, onAdd, onRemove, onClearAll, onReorder }) {
  const [input, setInput] = useState('')
  const [dragIndex, setDragIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  const listRef = useRef(null)
  const touchFrom = useRef(null)
  const touchOver = useRef(null)

  // Attach a non-passive touchmove listener so we can preventDefault (stops page scroll during drag)
  useEffect(() => {
    const list = listRef.current
    if (!list) return

    function onTouchMove(e) {
      if (touchFrom.current === null) return
      e.preventDefault()
      const touch = e.touches[0]
      const el = document.elementFromPoint(touch.clientX, touch.clientY)
      const item = el?.closest('[data-index]')
      if (item) {
        const idx = parseInt(item.dataset.index, 10)
        if (!isNaN(idx) && idx !== touchOver.current) {
          touchOver.current = idx
          setDragOverIndex(idx)
        }
      }
    }

    list.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => list.removeEventListener('touchmove', onTouchMove)
  }, [])

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

  // Mouse drag handlers
  function handleDragStart(e, index) {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e, index) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (index !== dragOverIndex) setDragOverIndex(index)
  }

  function handleDrop(e, index) {
    e.preventDefault()
    if (dragIndex !== null && dragIndex !== index) {
      const reordered = [...players]
      const [moved] = reordered.splice(dragIndex, 1)
      reordered.splice(index, 0, moved)
      onReorder(reordered)
    }
    setDragIndex(null)
    setDragOverIndex(null)
  }

  function handleDragEnd() {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  // Touch drag handlers
  function handleTouchStart(e, index) {
    touchFrom.current = index
    touchOver.current = index
    setDragIndex(index)
    setDragOverIndex(index)
  }

  function handleTouchEnd() {
    const from = touchFrom.current
    const to = touchOver.current
    if (from !== null && to !== null && from !== to) {
      const reordered = [...players]
      const [moved] = reordered.splice(from, 1)
      reordered.splice(to, 0, moved)
      onReorder(reordered)
    }
    touchFrom.current = null
    touchOver.current = null
    setDragIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="player-bank">
      <div className="player-bank-header">
        <h2>Kicking Order</h2>
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
          maxLength={20}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit" disabled={!input.trim()}>
          Add
        </button>
      </form>
      {players.length === 0 ? (
        <p className="empty-bank">No players yet.</p>
      ) : (
        <ul className="player-list" ref={listRef}>
          {players.map((name, index) => (
            <li
              key={name}
              data-index={index}
              className={
                'player-item' +
                (dragOverIndex === index && dragIndex !== index ? ' drag-over' : '') +
                (dragIndex === index ? ' dragging' : '')
              }
              draggable
              onDragStart={e => handleDragStart(e, index)}
              onDragOver={e => handleDragOver(e, index)}
              onDrop={e => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onTouchStart={e => handleTouchStart(e, index)}
              onTouchEnd={handleTouchEnd}
            >
              <span className="player-number">{index + 1}</span>
              <span className="drag-handle" title="Drag to reorder">⠿</span>
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
