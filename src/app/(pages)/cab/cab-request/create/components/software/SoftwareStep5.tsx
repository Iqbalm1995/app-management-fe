"use client";

import { VStack } from "@chakra-ui/react";

import { UsersResponse } from "@/app/services/useUsers";
import { CabSoftwareStep5 } from "@/app/types/cabTypes";
import PicMigrasiField from "../PicMigrasiField";
import CommitteeCabField from "../CommitteeCabField";

interface SoftwareStep5Props {
  data: CabSoftwareStep5;
  onChange: (data: CabSoftwareStep5) => void;
  fetchUsers: (search: string, token: string) => Promise<UsersResponse[]>;
  tokenData: string;
}

const SoftwareStep5 = ({ data, onChange, fetchUsers, tokenData }: SoftwareStep5Props) => {
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

export default SoftwareStep5;
