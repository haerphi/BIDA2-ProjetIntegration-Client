import { useState, useMemo, useRef, useEffect } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { X, Search, ChevronDown } from 'react-bootstrap-icons';

export type Choice = {
  value: any;
  label: string;
};

export type MultipleInputProp = {
  choices: Choice | Choice[];
  onSelected?: (selected: Choice[]) => void;
  onSearchChanges?: (search: string) => void;
  max?: number;
};

export default function MultipleInput({ choices, onSelected, onSearchChanges, max }: MultipleInputProp) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Choice[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizedChoices = useMemo(() => {
    if (!choices) return [];
    return Array.isArray(choices) ? choices : [choices];
  }, [choices]);

  const filteredChoices = useMemo(() => {
    return normalizedChoices.filter((choice) => {
      const isAlreadySelected = selectedItems.some((selected) => {
        if (
          typeof selected.value === 'object' &&
          selected.value !== null &&
          typeof choice.value === 'object' &&
          choice.value !== null
        ) {
          return JSON.stringify(selected.value) === JSON.stringify(choice.value);
        }
        return selected.value === choice.value;
      });
      if (isAlreadySelected) return false;

      if (!onSearchChanges && searchTerm.trim() !== '') {
        return choice.label.toLowerCase().includes(searchTerm.toLowerCase());
      }

      return true;
    });
  }, [normalizedChoices, selectedItems, searchTerm, onSearchChanges]);

  // Handle clicking outside of the dropdown container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);
    setFocusedIndex(-1); // Reset index on filter change
    if (onSearchChanges) {
      onSearchChanges(value);
    }
  };

  const handleSelectChoice = (choice: Choice) => {
    if (max !== undefined && selectedItems.length >= max) {
      return;
    }
    const updated = [...selectedItems, choice];
    setSelectedItems(updated);
    onSelected?.(updated);
    setSearchTerm('');
    if (onSearchChanges) {
      onSearchChanges('');
    }
    setFocusedIndex(-1);
    
    if (max !== undefined && updated.length >= max) {
      setIsOpen(false);
    } else {
      // Keep focus in the input for seamless typing experience
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % filteredChoices.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + filteredChoices.length) % filteredChoices.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredChoices.length) {
          handleSelectChoice(filteredChoices[focusedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const removeSelected = (choice: Choice) => {
    const updated = selectedItems.filter((selected) => {
      if (
        typeof selected.value === 'object' &&
        selected.value !== null &&
        typeof choice.value === 'object' &&
        choice.value !== null
      ) {
        return JSON.stringify(selected.value) !== JSON.stringify(choice.value);
      }
      return selected.value !== choice.value;
    });
    setSelectedItems(updated);
    onSelected?.(updated);
  };

  return (
    <div ref={containerRef} className="multiple-input-container w-100">
      <div className="position-relative">
        <div className="input-group mb-2 shadow-sm rounded-3 overflow-hidden border border-stone-200">
          <span className="input-group-text bg-white border-end-0 text-stone-500 py-2 ps-3">
            <Search size={16} className="text-stone-400" />
          </span>
          <input
            ref={inputRef}
            type="text"
            className="form-control custom-input border-start-0 ps-2 py-2 text-stone-800"
            placeholder={max !== undefined && selectedItems.length >= max ? `Maximum de ${max} sélectionné(s)` : "Rechercher des options..."}
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => {
              if (max === undefined || selectedItems.length < max) {
                setIsOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
            disabled={max !== undefined && selectedItems.length >= max}
          />
          <button
            type="button"
            className="custom-dropdown-chevron bg-white border-start-0 border-0"
            onClick={() => {
              if (max === undefined || selectedItems.length < max) {
                setIsOpen(!isOpen);
              }
            }}
            disabled={max !== undefined && selectedItems.length >= max}
            title="Afficher la liste"
          >
            <ChevronDown
              size={14}
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>
        </div>

        {isOpen && (
          <div className="custom-dropdown-menu shadow-lg border border-stone-200 rounded-3">
            {filteredChoices.length === 0 ? (
              <div className="p-3 text-stone-500 text-center small">Aucune option disponible</div>
            ) : (
              filteredChoices.map((choice, idx) => {
                const isFocused = idx === focusedIndex;
                return (
                  <button
                    key={`${choice.label}-${idx}`}
                    type="button"
                    className={`custom-dropdown-item ${isFocused ? 'focused' : ''}`}
                    onClick={() => handleSelectChoice(choice)}
                    onMouseEnter={() => setFocusedIndex(idx)}
                  >
                    <span>{choice.label}</span>
                    {isFocused && (
                      <span className="text-emerald-600 fw-semibold" style={{ fontSize: '11px' }}>
                        Entrée ↵
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {selectedItems.length > 0 && (
        <div className="selected-items-wrapper mt-3 animate-fade-in">
          <div className="d-flex justify-content-between align-items-center mb-2 px-1">
            <label className="form-label small fw-semibold text-stone-700 mb-0">
              Sélectionnés ({selectedItems.length})
            </label>
            <button
              type="button"
              className="btn btn-link text-stone-500 hover-text-emerald-600 p-0 text-decoration-none small fw-medium"
              onClick={() => {
                setSelectedItems([]);
                onSelected?.([]);
              }}
            >
              Tout effacer
            </button>
          </div>

          <div className="d-flex flex-wrap gap-2 p-3 bg-stone-50 border rounded-3 border-stone-200 shadow-inner">
            {selectedItems.map((item, idx) => (
              <div
                key={`${item.label}-${idx}`}
                className="badge bg-emerald-50 text-emerald-900 border border-emerald-500 d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-sm transition hover-bg-emerald-100 fw-medium"
              >
                <input
                  type="checkbox"
                  className="form-check-input my-0 cursor-pointer"
                  checked={true}
                  onChange={() => removeSelected(item)}
                  title="Décocher pour retirer"
                />
                <span>{item.label}</span>
                <button
                  type="button"
                  className="btn p-0 d-flex align-items-center justify-content-center text-emerald-600 hover-text-red-600 border-0 bg-transparent transition"
                  onClick={() => removeSelected(item)}
                  title="Retirer"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

