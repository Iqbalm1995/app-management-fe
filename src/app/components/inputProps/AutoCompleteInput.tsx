import {
  Box,
  Input,
  VStack,
  Text,
  InputProps,
  useOutsideClick,
} from "@chakra-ui/react";
import { useState, useRef } from "react";

export interface AutoCompleteInputProps extends Omit<InputProps, "onSelect"> {
  suggestions: string[];
  value: string;
  onValueChange: (value: string) => void;
  onItemSelect?: (value: string) => void; // renamed!
}

export default function AutoCompleteInput({
  suggestions,
  value,
  onValueChange,
  onItemSelect,
  ...rest
}: AutoCompleteInputProps) {
  const [filtered, setFiltered] = useState<string[]>([]);
  const [showList, setShowList] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick({
    ref: ref as React.RefObject<HTMLElement>,
    handler: () => setShowList(false),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onValueChange(newValue);

    if (newValue.trim() === "") {
      setShowList(false);
      return;
    }

    const filteredResults = suggestions.filter((item) =>
      item.toLowerCase().includes(newValue.toLowerCase())
    );
    setFiltered(filteredResults);
    setShowList(true);
  };

  const handleSelect = (item: string) => {
    onValueChange(item);
    onItemSelect?.(item);
    setShowList(false);
  };

  return (
    <Box w="full" ref={ref} position="relative">
      <Input
        value={value}
        onChange={handleInputChange}
        autoComplete="off"
        {...rest}
      />
      {showList && filtered.length > 0 && (
        <VStack
          spacing={0}
          mt={1}
          position="absolute"
          zIndex={10}
          w="full"
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          boxShadow="sm"
          align="stretch"
          maxH="200px"
          overflowY="auto"
        >
          {filtered.map((item, idx) => (
            <Box
              key={idx}
              px={4}
              py={2}
              _hover={{ bg: "gray.100", cursor: "pointer" }}
              onClick={() => handleSelect(item)}
            >
              <Text>{item}</Text>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}
