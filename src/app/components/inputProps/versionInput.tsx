import { Input, InputProps } from "@chakra-ui/react";
import { useState } from "react";

interface VersionCodeInputProps extends Omit<InputProps, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  useDoubleDigits?: boolean; // true = 00.00.00.00, false = 0.0.0.0
}

const VersionCodeInput: React.FC<VersionCodeInputProps> = ({
  value,
  onChange,
  useDoubleDigits = false,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState(value);

  const formatValue = (input: string) => {
    const cleaned = input.replace(/\D/g, "");
    const parts: string[] = [];

    if (useDoubleDigits) {
      // Group digits in pairs
      for (let i = 0; i < Math.min(cleaned.length, 8); i += 2) {
        parts.push(cleaned.slice(i, i + 2));
      }
    } else {
      // Group digits individually
      for (let i = 0; i < Math.min(cleaned.length, 4); i++) {
        parts.push(cleaned[i]);
      }
    }

    return parts.join(".");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatValue(e.target.value);
    setInternalValue(formatted);
    onChange(formatted);
  };

  return (
    <Input
      value={internalValue}
      onChange={handleChange}
      //   placeholder={useDoubleDigits ? "00.00.00.00" : "0.0.0.0"}
      maxLength={useDoubleDigits ? 11 : 7}
      {...rest}
    />
  );
};

export default VersionCodeInput;
