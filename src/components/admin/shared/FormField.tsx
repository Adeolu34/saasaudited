export default function FormField({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  value,
  placeholder,
  error,
  readOnly,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  value?: string | number;
  placeholder?: string;
  error?: string;
  readOnly?: boolean;
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
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        {...(value !== undefined ? { value } : { defaultValue })}
        placeholder={placeholder}
        readOnly={readOnly}
        step={type === "number" ? "any" : undefined}
        className={`w-full px-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow text-sm${readOnly ? " opacity-60 cursor-not-allowed" : ""}`}
      />
      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  );
}
