import { Input, InputProps } from "@chakra-ui/react";
import React, { useState } from "react";

interface CustomMaskedInputProps extends Omit<InputProps, "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

const formatInput = (input: string) => {
  const cleaned = input.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const parts = {
    part1: cleaned.slice(0, 4), // digits
    part2: cleaned.slice(4, 7), // letters
    part3: cleaned.slice(7, 10), // letters
    part4: cleaned.slice(10, 11), // single letter
    part5: cleaned.slice(11, 15), // 4-digit year
  };

  let formatted = parts.part1;
  if (parts.part2) formatted += `/${parts.part2}`;
  if (parts.part3) formatted += `-${parts.part3}`;
  if (parts.part4) formatted += `/${parts.part4}`;
  if (parts.part5) formatted += `/${parts.part5}`;

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
