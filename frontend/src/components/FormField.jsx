const FormField = ({
  label,
  id,
  icon: Icon,
  error,
  hint,
  rightElement,
  ...inputProps
}) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
      {label}
    </label>

    <div className="group relative">
      <Icon
        className={`pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${
          error ? "text-red-400" : "text-gray-400 group-focus-within:text-indigo-500"
        }`}
      />

      <input
        id={id}
        name={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-xl border bg-white/70 py-3 pl-11 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:bg-white focus:ring-4 disabled:opacity-60 ${
          rightElement ? "pr-11" : "pr-4"
        } ${
          error
            ? "border-red-400 focus:ring-red-100"
            : "border-gray-200 hover:border-gray-300 focus:border-indigo-500 focus:ring-indigo-100"
        }`}
        {...inputProps}
      />

      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
      )}
    </div>

    {error ? (
      <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
        {error}
      </p>
    ) : hint ? (
      <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
    ) : null}
  </div>
);

export default FormField;