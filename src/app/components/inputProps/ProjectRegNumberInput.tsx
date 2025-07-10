import { Input, InputProps } from "@chakra-ui/react";
import React, { useState } from "react";

interface CustomMaskedInputProps extends Omit<InputProps, "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

const formatInput = (input: string) => {
  const cleaned = input.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  const digits = cleaned.replace(/[^0-9]/g, "");
  const letters = cleaned.replace(/[^A-Z]/g, "");

  const part1 = digits.slice(0, 4); // 2567
  const part2 = digits.slice(4, 6); // 12
  const part3 = letters.slice(0, 3); // BJB
  const part4 = letters.slice(3, 7); // NRBB
  const part5a = digits.slice(6, 10); // 2025
  const part5b = letters.slice(7, 8); // A
  const part6 = digits.slice(10, 13); // 1 (or 001)

  let formatted = part1;
  if (part2) formatted += `/${part2}`;
  if (part3) formatted += `/${part3}`;
  if (part4) formatted += `/${part4}`;
  if (part5a || part5b) formatted += `/${part5a}${part5b ? `-${part5b}` : ""}`;
  if (part6) formatted += `/${part6}`;

  return formatted;
};

const RegProjectNumberInput: React.FC<CustomMaskedInputProps> = ({
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
      name="RegProjectnumberinput"
      value={internalValue}
      onChange={handleChange}
      placeholder="2567/12/BJB/NRBB/2025-A/1"
      {...rest}
    />
  );
};

export default RegProjectNumberInput;
