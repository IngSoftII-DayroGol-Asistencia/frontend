import { useState } from 'react'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import type { E164Number } from 'libphonenumber-js/core'
import 'react-phone-number-input/style.css'

interface PhoneInputFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PhoneInputField ({ value, onChange }: PhoneInputFieldProps) {

    const [error, setError] = useState<string | null>(null);

    const handleChange = (newValue: E164Number | undefined) => {
        onChange(newValue || '');
        if (newValue && !isValidPhoneNumber(newValue)) {
            setError('Invalid phone number');
        } else {
            setError(null);
        }
    }

    return (
        <div>
            <PhoneInput
                international
                placeholder="Enter phone number"
                value={value as E164Number | undefined}
                onChange={handleChange}
                defaultCountry="CO"
                className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/50 border-white/40 dark:border-gray-800/50"
                required
            />
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </div>
    )

}
