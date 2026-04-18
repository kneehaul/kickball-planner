import React from 'react'

export default function RosterGrid({ players, roster, positions, innings, onAssign }) {
  function getBench(inning) {
    const assigned = new Set(Object.values(roster[inning]).filter(Boolean))
    return players.filter(p => !assigned.has(p))
  }

  function getAssignedInInning(inning) {
    return new Set(Object.values(roster[inning]).filter(Boolean))
  }

  return (
    <div className="roster-grid-wrapper">
      <table className="roster-table">
        <thead>
          <tr>
            <th className="position-col">Position</th>
            {innings.map(i => (
              <th key={i}>Inning {i}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {positions.map(pos => (
            <tr key={pos}>
              <td className="position-label">{pos}</td>
              {innings.map(inning => {
                const assignedInInning = getAssignedInInning(inning)
                const current = roster[inning][pos]
                return (
                  <td key={inning} className="assignment-cell">
                    <select
                      value={current}
                      onChange={e => onAssign(inning, pos, e.target.value)}
                      className={current ? 'assigned' : 'unassigned'}
                    >
                      <option value="">—</option>
                      {players.map(name => (
                        <option
                          key={name}
                          value={name}
                          className={assignedInInning.has(name) && name !== current ? 'already-assigned' : ''}
                        >
                          {assignedInInning.has(name) && name !== current ? `${name} *` : name}
                        </option>
                      ))}
                    </select>
                  </td>
                )
              })}
            </tr>
          ))}
          <tr className="bench-row">
            <td className="position-label bench-label">Bench</td>
            {innings.map(inning => {
              const bench = getBench(inning)
              return (
                <td key={inning} className="bench-cell">
                  {bench.length === 0 ? (
                    <span className="bench-empty">—</span>
                  ) : (
                    bench.map(name => (
                      <span key={name} className="bench-player">{name}</span>
                    ))
                  )}
                </td>
              )
            })}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
