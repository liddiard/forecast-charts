import { useState, useEffect, useRef } from 'react'
import { useWeatherStore } from '../../store/useWeatherStore'
import { useGeolocation } from '../../hooks/useGeolocation'
import { searchCities } from '../../api/geocoding'
import type { GeocodingResult } from '../../types/forecast'
import styles from './Header.module.css'

export function LocationSearch() {
  const location = useWeatherStore((s) => s.location)
  const setLocation = useWeatherStore((s) => s.setLocation)
  const { requestLocation, loading: geoLoading } = useGeolocation()

  const [query, setQuery] = useState(() => location?.name ?? '')
  const [results, setResults] = useState<GeocodingResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [searching, setSearching] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const isEditingRef = useRef(false)

  // Sync input with external location changes (e.g. geolocation) when not actively editing
  useEffect(() => {
    if (location && !isEditingRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(location.name)
    }
  }, [location])

  useEffect(() => {
    // Don't search if the query exactly matches the already-selected location
    if (query.trim() === (location?.name ?? '')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([])
      setSearching(false)
      setShowDropdown(false)
      return
    }

    if (query.trim().length < 2) {
      setResults([])
      setSearching(false)
      setShowDropdown(false)
      return
    }

    setShowDropdown(true)
    setSearching(true)
    setHighlightedIndex(-1)

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        const res = await searchCities(query)
        setResults(res)
      } catch {
        setResults([])
      }
      setSearching(false)
    }, 400)

    return () => clearTimeout(timerRef.current)
  }, [query, location?.name])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
        // Restore the selected location name if the user abandoned a partial query
        if (location) setQuery(location.name)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [location])

  const selectCity = (r: GeocodingResult) => {
    const name = [r.name, r.admin1, r.country].filter(Boolean).join(', ')
    setLocation({ lat: r.latitude, lon: r.longitude, name })
    setQuery(name)
    setShowDropdown(false)
    setResults([])
    setHighlightedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.min(highlightedIndex + 1, results.length - 1)
      setHighlightedIndex(next)
      itemRefs.current[next]?.scrollIntoView({ block: 'nearest' })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = Math.max(highlightedIndex - 1, 0)
      setHighlightedIndex(prev)
      itemRefs.current[prev]?.scrollIntoView({ block: 'nearest' })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && results[highlightedIndex]) {
        selectCity(results[highlightedIndex])
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      if (location) setQuery(location.name)
    }
  }

  const showingDropdown = showDropdown && (searching || results.length > 0)

  return (
    <div className={styles.inputGroup} ref={wrapperRef}>
      <label className={styles.label} htmlFor="location-search">
        Location
      </label>
      <div className={styles.inputRow}>
        <input
          id="location-search"
          name="location-search"
          className={styles.input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            isEditingRef.current = true
            if (results.length > 0 || searching) setShowDropdown(true)
          }}
          onBlur={() => {
            isEditingRef.current = false
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search city..."
          spellCheck={false}
          autoComplete="off"
          role="combobox"
          aria-expanded={showingDropdown}
          aria-autocomplete="list"
          aria-controls="location-results"
          aria-activedescendant={
            highlightedIndex >= 0 ? `location-result-${highlightedIndex}` : undefined
          }
        />
        <button
          className={styles.button}
          onClick={requestLocation}
          disabled={geoLoading}
          title="Use current location"
          type="button"
        >
          {geoLoading ? '...' : '📍'}
        </button>
      </div>
      {showingDropdown && (
        <ul id="location-results" className={styles.dropdown} role="listbox">
          {searching && results.length === 0 ? (
            <li className={styles.dropdownSearching}>Searching...</li>
          ) : (
            results.map((r, i) => (
              <li key={r.id} role="option" aria-selected={i === highlightedIndex}>
                <button
                  ref={(el) => {
                    itemRefs.current[i] = el
                  }}
                  id={`location-result-${i}`}
                  className={`${styles.dropdownItem} ${i === highlightedIndex ? styles.dropdownItemHighlighted : ''}`}
                  onClick={() => selectCity(r)}
                  type="button"
                  tabIndex={-1}
                >
                  <strong>{r.name}</strong>
                  {r.admin1 && <span>, {r.admin1}</span>}
                  <span>, {r.country}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
