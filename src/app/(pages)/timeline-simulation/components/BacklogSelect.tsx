"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Select } from "chakra-react-select";
import useRequirements from "@/app/services/useRequirements";
import { RES_CODE_OK } from "@/app/constants/applicationConstants";

interface BacklogOption {
  value: string;
  label: string;
  startDate: string | null;
  endDate: string | null;
}

interface BacklogSelectProps {
  token: string;
  /** Optional reqId to scope the backlog list to a requirement. */
  reqId?: string | null;
  value: { backlogId: string | null; backlogName: string | null };
  onChange: (backlog: {
    backlogId: string | null;
    backlogName: string | null;
    startDate?: string | null;
    endDate?: string | null;
  }) => void;
}

/**
 * Single-select of an existing kanban backlog to reuse for a stage.
 * Sourced from the requirements backlog list.
 */
const BacklogSelect = ({ token, reqId, value, onChange }: BacklogSelectProps) => {
  const { ListBacklog } = useRequirements();
  const [options, setOptions] = useState<BacklogOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadBacklogs = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await ListBacklog(
        {
          search: "",
          limit: 500,
          page: 1,
          filterWhere: reqId
            ? [{ field: "reqId", operator: "=", value: reqId }]
            : [],
          fieldOrder: [],
          orderDir: "asc",
        },
        token
      );
      if (res?.statusCode === RES_CODE_OK && res.data) {
        setOptions(
          res.data.map((b) => ({
            value: b.id,
            label: `${b.backlogCode ? `${b.backlogCode} — ` : ""}${b.backlogName}`,
            startDate: b.backlogStartdate ? b.backlogStartdate.slice(0, 10) : null,
            endDate: b.backlogEnddate ? b.backlogEnddate.slice(0, 10) : null,
          }))
        );
      }
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, reqId]);

  useEffect(() => {
    loadBacklogs();
  }, [loadBacklogs]);

  const selected = useMemo<BacklogOption | null>(() => {
    if (!value.backlogId) return null;
    return (
      options.find((o) => o.value === value.backlogId) ?? {
        value: value.backlogId,
        label: value.backlogName ?? value.backlogId,
        startDate: null,
        endDate: null,
      }
    );
  }, [value, options]);

  return (
    <Select
      options={options}
      value={selected}
      isLoading={isLoading}
      isClearable
      placeholder="Reuse a kanban backlog…"
      onChange={(opt) => {
        const o = opt as BacklogOption | null;
        onChange({
          backlogId: o?.value ?? null,
          backlogName: o?.label ?? null,
          startDate: o?.startDate ?? null,
          endDate: o?.endDate ?? null,
        });
      }}
      chakraStyles={{
        container: (base) => ({ ...base, width: "100%" }),
      }}
    />
  );
};

export default BacklogSelect;
