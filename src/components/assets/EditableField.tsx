import React from 'react';

type FieldType = 'text' | 'email' | 'date' | 'textarea' | 'select';

interface EditableFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isEditing: boolean;
  type?: FieldType;
  readOnly?: boolean;
}

const EditableField = ({ 
  label, name, value, onChange, isEditing, type = 'text', readOnly = false 
}: EditableFieldProps) => {
  
  if (isEditing && readOnly) {
    return (
      <div className="flex flex-col gap-1 opacity-70 cursor-not-allowed">
         <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
         <div className="p-2 text-sm border border-transparent bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">
           {value}
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      
      {isEditing ? (
        type === 'textarea' ? (
          <textarea
            className="w-full p-2 text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            name={name}
            rows={4}
            value={value}
            onChange={onChange}
          />
        ) : (
          <input
            className="w-full p-2 text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            name={name}
            type={type}
            value={value}
            onChange={onChange}
          />
        )
      ) : (
        <p className="py-2 text-sm text-gray-800 dark:text-gray-300 min-h-[38px] flex items-center border border-transparent">
          {value || <span className="text-gray-400 italic">No especificado</span>}
        </p>
      )}
    </div>
  );
};

export default EditableField;