export default function SelectField({
  label,
  name,
  required,
  defaultValue,
  options,
  error,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  options: { value: string; label: string }[];
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold"
      >
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow text-sm"
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  );
}
