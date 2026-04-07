export default function TextareaField({
  label,
  name,
  required,
  defaultValue,
  placeholder,
  rows = 6,
  error,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
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
      <textarea
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow text-sm resize-y"
      />
      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  );
}
