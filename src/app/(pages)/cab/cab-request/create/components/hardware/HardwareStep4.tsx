"use client";

import { VStack } from "@chakra-ui/react";

import { UsersResponse } from "@/app/services/useUsers";
import { CabHardwareStep4 } from "@/app/types/cabTypes";
import PicMigrasiField from "../PicMigrasiField";
import CommitteeCabField from "../CommitteeCabField";

interface HardwareStep4Props {
  data: CabHardwareStep4;
  onChange: (data: CabHardwareStep4) => void;
  fetchUsers: (search: string, token: string) => Promise<UsersResponse[]>;
  tokenData: string;
}

const HardwareStep4 = ({ data, onChange, fetchUsers, tokenData }: HardwareStep4Props) => {
  return (
    <VStack spacing={6} align="stretch" w="full">
      <PicMigrasiField
        value={data.picMigrasi}
        onChange={(pic) => onChange({ ...data, picMigrasi: pic })}
        fetchUsers={fetchUsers}
        tokenData={tokenData}
      />

      <CommitteeCabField
        value={data.committeeCab}
        onChange={(members) => onChange({ ...data, committeeCab: members })}
        fetchUsers={fetchUsers}
        tokenData={tokenData}
      />
    </VStack>
  );
};

export default HardwareStep4;
