import {
  Input,
  InputProps,
  InputGroup,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";

interface EmailInputProps extends Omit<InputProps, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  lockedDomain?: string;
}

const allowedUsernameChars = /^[a-zA-Z0-9._-]*$/;

const EmailInputMask: React.FC<EmailInputProps> = ({
  value,
  onChange,
  lockedDomain = "@bankbjb.co.id",
  ...rest
}) => {
  const currentUsername = value.replace(lockedDomain, "");
  const [username, setUsername] = useState(currentUsername);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!allowedUsernameChars.test(raw)) return;
    setUsername(raw);
    onChange(raw + lockedDomain);
  };

  return (
    <InputGroup>
      <Input
        type="text"
        value={username}
        onChange={handleChange}
        pr={`${lockedDomain.length + 1}ch`}
        {...rest}
      />
      <InputRightElement pointerEvents="none" width="auto" mr={2}>
        <Text color="gray.500" whiteSpace="nowrap">
          {lockedDomain}
        </Text>
      </InputRightElement>
    </InputGroup>
  );
};

export default EmailInputMask;
