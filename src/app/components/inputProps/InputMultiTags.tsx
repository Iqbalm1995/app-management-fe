"use client";

import {
  Box,
  Flex,
  Input,
  Tag,
  TagCloseButton,
  TagLabel,
} from "@chakra-ui/react";
import { useState } from "react";

interface OtherInputAppsStringSeparatorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function OtherInputAppsStringSeparator({
  value = "",
  onChange,
  placeholder = "Ketik dan Enter atau comma untuk menambahkan tag",
}: OtherInputAppsStringSeparatorProps) {
  const [tags, setTags] = useState<string[]>(
    value
      ? value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : []
  );
  const [inputValue, setInputValue] = useState("");

  const OtherInputAppsAddTag = (tag: string) => {
    const clean = tag.trim();
    if (clean && !tags.includes(clean)) {
      const newTags = [...tags, clean];
      setTags(newTags);
      onChange(newTags.join(", "));
    }
  };

  const OtherInputAppsRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    onChange(newTags.join(", "));
  };

  const OtherInputAppsHandleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      OtherInputAppsAddTag(inputValue);
      setInputValue("");
    } else if (e.key === "Backspace" && inputValue === "") {
      OtherInputAppsRemoveTag(tags[tags.length - 1]);
    }
  };

  return (
    <Flex
      wrap="wrap"
      gap={2}
      px={2}
      py={1}
      minH="40px"
      border="1px solid"
      borderColor="gray.300"
      borderRadius="md"
      alignItems="center"
    >
      {tags.map((tag) => (
        <Tag key={tag} borderRadius="full" colorScheme="blue">
          <TagLabel>{tag}</TagLabel>
          <TagCloseButton onClick={() => OtherInputAppsRemoveTag(tag)} />
        </Tag>
      ))}
      <Input
        variant="unstyled"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={OtherInputAppsHandleKeyDown}
        placeholder={placeholder}
        flex="1"
        minW="120px"
      />
    </Flex>
  );
}
