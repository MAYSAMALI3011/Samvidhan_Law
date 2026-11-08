interface FollowUpChipsProps {
  chips: string[]
  onSelect: (chip: string) => void
}

export function FollowUpChips({ chips, onSelect }: FollowUpChipsProps) {
  if (!chips || chips.length === 0) return null

  return (
    <div className="followup-chips-row" role="group" aria-label="Suggested follow-up legal queries">
      {chips.map((chip, idx) => (
        <button
          key={idx}
          type="button"
          className="followup-chip-btn"
          onClick={() => onSelect(chip)}
        >
          <span>{chip}</span>
        </button>
      ))}
    </div>
  )
}
