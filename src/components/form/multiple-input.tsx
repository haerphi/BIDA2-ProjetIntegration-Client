import { useState, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { X, Search } from 'react-bootstrap-icons';

export type Choice = {
  value: any;
  label: string;
};

export type MultipleInputProp = {
  choices: Choice | Choice[];
  onSelected?: (selected: Choice[]) => void;
  onSearchChanges?: (search: string) => void;
};

export default function MultipleInput({ choices, onSelected, onSearchChanges }: MultipleInputProp) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Choice[]>([]);

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

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearchChanges) {
      onSearchChanges(value);
    }
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value, 10);
    if (isNaN(idx)) return;
    const selectedChoice = filteredChoices[idx];
    if (selectedChoice) {
      const updated = [...selectedItems, selectedChoice];
      setSelectedItems(updated);
      onSelected?.(updated);
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
    <div className="multiple-input-container w-100">
      <div className="input-group mb-2 shadow-sm rounded-3 overflow-hidden">
        <span className="input-group-text bg-white border-end-0 text-stone-500 py-2 ps-3">
          <Search size={16} className="text-stone-400" />
        </span>
        <input
          type="text"
          className="form-control custom-input border-start-0 ps-2 py-2 text-stone-800"
          placeholder="Rechercher des options..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="mb-3 shadow-sm rounded-3 overflow-hidden">
        <select className="form-select custom-select py-2 text-stone-700" value="" onChange={handleSelectChange}>
          <option value="" disabled>
            {filteredChoices.length === 0 ? 'Aucune option disponible' : 'Choisir des options dans la liste...'}
          </option>
          {filteredChoices.map((choice, idx) => (
            <option key={`${choice.label}-${idx}`} value={idx}>
              {choice.label}
            </option>
          ))}
        </select>
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
