import { Input, InputProps } from "@chakra-ui/react";
import React, { useState } from "react";

interface CustomMaskedInputProps extends Omit<InputProps, "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

const formatInput = (input: string) => {
  const cleaned = input.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  // Extract digits and letters separately
  const digits = cleaned.replace(/[^0-9]/g, "");
  const letters = cleaned.replace(/[^A-Z]/g, "");

  // Build parts with proper validation
  const part1 = digits.slice(0, 4); // Only digits
  const part2 = letters.slice(0, 3); // Only letters
  const part3 = letters.slice(3, 6); // Only letters
  const part4 = letters.slice(6, 7); // Only 1 letter
  const part5 = digits.slice(4, 8); // Only digits for year

  let formatted = part1;
  if (part2) formatted += `/${part2}`;
  if (part3) formatted += `-${part3}`;
  if (part4) formatted += `/${part4}`;
  if (part5) formatted += `/${part5}`;

  return formatted;
};

const RegistrationNumberInput: React.FC<CustomMaskedInputProps> = ({
  value,
  onChange,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatInput(raw);
    setInternalValue(formatted);
    onChange(formatted);
  };

  return (
    <Input
      name="registrationnumberinput"
      value={internalValue}
      onChange={handleChange}
      placeholder="0000/XXX-XXX/X/YYYY"
      {...rest}
    />
  );
};

export default RegistrationNumberInput;
