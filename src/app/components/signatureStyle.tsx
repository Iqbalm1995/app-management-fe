import { Box, Flex } from "@chakra-ui/react";

export default function SignatureLineColor() {
  return (
    <Flex width="100%" alignItems="center">
      <Box width="50%" bg="#0B79CA" height="12px" roundedBottomLeft={"none"}>
        {/* Content for the first stack */}
      </Box>
      <Box width="25%" bg="#0078FF" height="12px">
        {/* Content for the second stack */}
      </Box>
      <Box width="25%" bg="#EDC817" height="12px" roundedBottomRight={"none"}>
        {/* Content for the third stack */}
      </Box>
    </Flex>
  );
}
