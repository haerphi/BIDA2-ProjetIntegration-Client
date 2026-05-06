import { useEffect, useState } from 'react';

interface DebouncedInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  debounceMs: number;
  placeholder?: string;
  className?: string;
  type: 'text' | 'number';
}

export default function DebouncedInput({
  id,
  value: initialValue,
  onChange,
  debounceMs,
  placeholder,
  className,
  type = 'text',
}: DebouncedInputProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value !== initialValue) {
        onChange(value);
      }
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [value, debounceMs, initialValue, onChange]);

  return (
    <input
      id={id}
      type={type}
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
