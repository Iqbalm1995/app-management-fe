import { Badge } from "@chakra-ui/react";
import { GROUP_CONST_BRD_STATUS } from "../constants/applicationConstants";

interface LabelMasterProps {
  labelName: string;
  groupLabel: string;
}

const LabelMaster = ({ labelName, groupLabel }: LabelMasterProps) => {
  if (groupLabel == GROUP_CONST_BRD_STATUS) {
    if (labelName == "NEW") {
      return (
        <Badge fontSize="1em" px={2} py={1} rounded={"md"} colorScheme="cyan">
          {labelName}
        </Badge>
      );
    }
    if (labelName == "NEEDS REVIEW") {
      return (
        <Badge fontSize="1em" px={2} py={1} rounded={"md"} colorScheme="purple">
          {labelName}
        </Badge>
      );
    }
    if (labelName == "IN PROGRESS REVIEW") {
      return (
        <Badge fontSize="1em" px={2} py={1} rounded={"md"} colorScheme="blue">
          {labelName}
        </Badge>
      );
    }
    if (labelName == "TEMPORARY APPROVED") {
      return (
        <Badge fontSize="1em" px={2} py={1} rounded={"md"} colorScheme="teal">
          {labelName}
        </Badge>
      );
    }
    if (labelName == "APPROVED") {
      return (
        <Badge fontSize="1em" px={2} py={1} rounded={"md"} colorScheme="green">
          {labelName}
        </Badge>
      );
    }
    if (labelName == "ON HOLD") {
      return (
        <Badge fontSize="1em" px={2} py={1} rounded={"md"} colorScheme="orange">
          {labelName}
        </Badge>
      );
    }
    if (labelName == "CANCELED") {
      return (
        <Badge fontSize="1em" px={2} py={1} rounded={"md"} colorScheme="red">
          {labelName}
        </Badge>
      );
    }
  }

  <Badge fontSize="1em" px={2} py={1} rounded={"md"} colorScheme="gray">
    {labelName}
  </Badge>;
};

export default LabelMaster;
