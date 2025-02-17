"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import SidebarWithHeader from "@/app/components/sidebar";
import { Box, Card, CardBody, CardHeader } from "@chakra-ui/react";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Setting",
  breadCrumb: ["Home", "Setting", "Profile"],
};

function SettingsPage() {
  return (
    <SidebarWithHeader>
      <HeaderContent {...HeaderDataContent} />
      <Card>
        <CardHeader>Setting</CardHeader>
        <CardBody>
          <Box>
            <p>Setting page content</p>
          </Box>
        </CardBody>
      </Card>
    </SidebarWithHeader>
  );
}

export default SettingsPage;
