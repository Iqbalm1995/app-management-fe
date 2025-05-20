import { Input, InputProps } from "@chakra-ui/react";
import { useState } from "react";

interface EmailInputProps extends Omit<InputProps, "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

const allowedEmailChars = /^[a-zA-Z0-9@._-]*$/;

const EmailInputMask: React.FC<EmailInputProps> = ({
  value,
  onChange,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Allow only valid email characters
    if (!allowedEmailChars.test(raw)) return;

    setInternalValue(raw);
    onChange(raw);
  };

  return (
    <Input
      type="email"
      placeholder="example@domain.com"
      value={internalValue}
      onChange={handleChange}
      autoComplete="email"
      {...rest}
    />
  );
};

export default EmailInputMask;
