import { useState, useRef } from 'react'
import TagBadge from './TagBadge'

export default function TagManager({ selectedTags = [], availableTags = [], onChange, onAddTag }) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)

  const filteredSuggestions = availableTags.filter(
    (tag) => !selectedTags.includes(tag) && tag.toLowerCase().includes(inputValue.toLowerCase())
  )

  const addTag = (tag) => {
    const normalized = tag.trim().toLowerCase()
    if (!normalized || selectedTags.includes(normalized)) return
    onChange([...selectedTags, normalized])
    if (!availableTags.includes(normalized)) {
      onAddTag(normalized)
    }
    setInputValue('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const removeTag = (tag) => {
    onChange(selectedTags.filter((t) => t !== tag))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        addTag(inputValue)
      }
    }
    if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1])
    }
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5 rounded-md border border-input bg-background p-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-ring">
        {selectedTags.map((tag) => (
          <TagBadge key={tag} tag={tag} onRemove={removeTag} />
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(true) }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? 'Add tags...' : ''}
          className="min-w-[80px] flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {showSuggestions && (inputValue || filteredSuggestions.length > 0) && (
        <div className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border border-border bg-card shadow-md">
          {filteredSuggestions.map((tag) => (
            <button
              key={tag}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => addTag(tag)}
              className="block w-full px-3 py-1.5 text-left text-sm text-foreground hover:bg-accent transition-colors"
            >
              {tag}
            </button>
          ))}
          {inputValue.trim() && !availableTags.includes(inputValue.trim().toLowerCase()) && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => addTag(inputValue)}
              className="block w-full px-3 py-1.5 text-left text-sm text-primary hover:bg-accent transition-colors"
            >
              Create &quot;{inputValue.trim().toLowerCase()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  )
}
