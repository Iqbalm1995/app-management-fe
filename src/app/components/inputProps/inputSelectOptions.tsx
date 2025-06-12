"use client";

import { Select } from "chakra-react-select";
import { Spinner, Stack, FormErrorMessage, Skeleton } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { OptionListProps } from "@/app/types/masterTypes";

interface InputSelectProps {
  Id: string;
  OptionData: OptionListProps[];
  SelectedData: OptionListProps | null;
  handleSelectedData: (selected: OptionListProps) => void;
  handleUnSelectedData: () => void;
  placeholder: string;
}

export default function InputSelectOptions({
  Id,
  OptionData,
  SelectedData,
  handleSelectedData,
  handleUnSelectedData,
  placeholder = "Pilih Data",
}: InputSelectProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  //   if (!isClient) return null;

  if (!isClient) {
    return <Skeleton height="40px" borderRadius="md" />;
  }

  return (
    <>
      <Select
        id={Id}
        options={OptionData}
        isSearchable
        onChange={(e) => {
          e
            ? handleSelectedData({ label: e.label, value: e.value })
            : handleUnSelectedData();
        }}
        placeholder={placeholder}
        // isLoading={IsLoadingDivisionSelect}
        value={SelectedData}
      />
    </>
  );
}
