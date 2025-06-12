"use client";

import {
  Flex,
  Tag,
  TagCloseButton,
  TagLabel,
  Textarea,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";

interface InputTagsAreaProps {
  value?: string;
  onChange: (value: string) => void;
  name?: string;
  placeholder?: string;
}

export default function InputTagsArea({
  value = "",
  onChange,
  name,
  placeholder = "Ketik dan Enter atau comma untuk menambahkan tag",
}: InputTagsAreaProps) {
  const [inputValue, setInputValue] = useState("");

  // ✅ Derive `tags` directly from the `value` prop
  const tags = useMemo(
    () =>
      value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    [value]
  );

  const addTag = (tag: string) => {
    const clean = tag.trim();
    if (clean && !tags.includes(clean)) {
      const newTags = [...tags, clean];
      onChange(newTags.join(", "));
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    onChange(newTags.join(", "));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.includes(",") || val.includes("\n")) {
      const parts = val.split(/,|\n/);
      parts.forEach((part) => addTag(part));
      setInputValue("");
    } else {
      setInputValue(val);
    }
  };

  return (
    <Flex
      wrap="wrap"
      gap={2}
      px={2}
      py={2}
      minH="60px"
      border="1px solid"
      borderColor="gray.300"
      borderRadius="md"
      alignItems="flex-start"
    >
      {tags.map((tag) => (
        <Tag key={tag} borderRadius="full" colorScheme="blue">
          <TagLabel>{tag}</TagLabel>
          <TagCloseButton onClick={() => removeTag(tag)} />
        </Tag>
      ))}
      <Textarea
        name={name}
        variant="unstyled"
        p={0}
        resize="none"
        value={inputValue}
        onChange={handleTextareaChange}
        placeholder={placeholder}
        minH="30px"
        rows={1}
        flex="1"
      />
    </Flex>
  );
}
