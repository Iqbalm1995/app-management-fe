import { Badge } from "@chakra-ui/react";
import { GROUP_CONST_BRD_STATUS } from "../constants/applicationConstants";
import { statusColorMap } from "../helper/MasterHelper";

interface LabelMasterProps {
  labelName: string;
  groupLabel: string;
}

const LabelMaster = ({ labelName, groupLabel }: LabelMasterProps) => {
  const colors = statusColorMap[groupLabel] ?? {
    bg: "gray.100",
    color: "gray.700",
  };
  if (groupLabel == GROUP_CONST_BRD_STATUS) {
    if (labelName == "NEW") {
      return (
        <Badge fontSize="1em" px={2} py={1} rounded={"md"} colorScheme={colors.bg}>
          {labelName}
        </Badge>
      );
    }
    if (labelName == "NEEDS REVIEW") {
      return (
        <Badge fontSize="1em" px={2} py={1} rounded={"md"} colorScheme={colors.bg}>
          {labelName}
        </Badge>
      );
    }
    if (labelName == "IN PROGRESS REVIEW") {
      return (
        <Badge fontSize="1em" px={2} py={1} rounded={"md"} colorScheme={colors.bg}>
          {labelName}
        </Badge>
      );
    }
    if (labelName == "TEMPORARY APPROVED") {
      return (
        <Badge fontSize="1em" px={2} py={1} rounded={"md"} colorScheme={colors.bg}>
          {labelName}
        </Badge>
      );
    }
    if (labelName == "APPROVED") {
      return (
        <Badge fontSize="1em" px={2} py={1} rounded={"md"} colorScheme={colors.bg}>
          {labelName}
        </Badge>
      );
    }
    if (labelName == "ON HOLD") {
      return (
        <Badge fontSize="1em" px={2} py={1} rounded={"md"} colorScheme={colors.bg}>
          {labelName}
        </Badge>
      );
    }
    if (labelName == "CANCELED") {
      return (
        <Badge fontSize="1em" px={2} py={1} rounded={"md"} colorScheme={colors.bg}>
          {labelName}
        </Badge>
      );
    }
  }

  <Badge fontSize="1em" px={2} py={1} rounded={"md"} colorScheme={colors.bg}>
    {labelName}
  </Badge>;
};

export default LabelMaster;
