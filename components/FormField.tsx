type FormFieldProps = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel";
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
};

export default function FormField({
  name,
  label,
  type = "text",
  placeholder,
  required = false,
  maxLength,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block mb-2 font-medium">
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className="w-full border border-gray-300 rounded-lg p-3 text-gray-900"
      />
    </div>
  );
}
