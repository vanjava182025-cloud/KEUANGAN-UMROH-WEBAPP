import React from 'react';

/**
 * Controlled Currency Input Component
 * Automatically formats number with thousands separators (dots) in real-time
 * e.g., 29000000 displays as 29.000.000
 * 
 * Usage:
 * <CurrencyInput value={amount} onChange={setAmount} />
 */
export const CurrencyInput = React.forwardRef(
  (
    {
      value = '',
      onChange,
      onBlur,
      placeholder = '0',
      className = '',
      label,
      required = false,
      disabled = false,
      helpText,
      error,
      name,
      id
    },
    ref
  ) => {
    /**
     * Parse display value and return numeric value
     * Input: "29.000.000" -> Output: 29000000
     */
    const parseDisplayValue = (displayValue) => {
      if (!displayValue) return '';
      // Remove all dots (thousand separators)
      return displayValue.replace(/\./g, '');
    };

    /**
     * Format numeric value to display format with thousand separators
     * Input: "29000000" or 29000000 -> Output: "29.000.000"
     */
    const formatDisplayValue = (numValue) => {
      if (numValue === '' || numValue === null || numValue === undefined) return '';
      
      // Convert to string and remove non-digits
      const stringValue = String(numValue).replace(/\D/g, '');
      if (!stringValue) return '';
      
      // Add dots as thousand separators from right to left
      return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const displayValue = formatDisplayValue(value);

    const handleChange = (e) => {
      const inputValue = e.target.value;
      const numericValue = parseDisplayValue(inputValue);
      
      // Only allow digits or empty
      if (numericValue === '' || /^\d+$/.test(numericValue)) {
        onChange?.(numericValue || '');
      }
    };

    const handleBlur = (e) => {
      // Trigger validation or other blur handlers
      onBlur?.(e);
    };

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id || name}
            className="block text-xs font-semibold text-slate-600 uppercase tracking-wide"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-semibold text-xs pointer-events-none">
            Rp
          </span>
          <input
            ref={ref}
            id={id || name}
            name={name}
            type="text"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full pl-10 pr-3.5 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 disabled:bg-slate-50 disabled:text-slate-400 transition-all ${
              error
                ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                : 'border-slate-200'
            } ${className}`}
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}

        {helpText && !error && (
          <p className="text-xs text-slate-500">{helpText}</p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

/**
 * Hook to handle currency input logic
 * Usage:
 * const { value, displayValue, handleChange } = useCurrencyInput('29000000');
 */
export const useCurrencyInput = (initialValue = '') => {
  const [value, setValue] = React.useState(initialValue);

  const formatDisplayValue = (numValue) => {
    if (numValue === '' || numValue === null || numValue === undefined) return '';
    const stringValue = String(numValue).replace(/\D/g, '');
    if (!stringValue) return '';
    return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseDisplayValue = (displayValue) => {
    if (!displayValue) return '';
    return displayValue.replace(/\./g, '');
  };

  const displayValue = formatDisplayValue(value);

  const handleChange = (inputValue) => {
    const numericValue = parseDisplayValue(inputValue);
    if (numericValue === '' || /^\d+$/.test(numericValue)) {
      setValue(numericValue || '');
    }
  };

  const setValue_Direct = (newValue) => {
    setValue(newValue);
  };

  return {
    value,
    displayValue,
    setValue: setValue_Direct,
    handleChange
  };
};

export default CurrencyInput;
