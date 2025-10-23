"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import SidebarWithHeader from "@/app/components/sidebar";
import { Box, Card, CardBody, CardHeader } from "@chakra-ui/react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Setting",
  breadCrumb: ["Home", "Setting", "Profile"],
};

function SettingsPage() {
  useDocumentTitle("Settings");
  return (
    <LayoutAdmin>
      <HeaderContent {...HeaderDataContent} />
      <Card>
        <CardHeader>Setting</CardHeader>
        <CardBody>
          <Box>
            <p>Setting page content</p>
          </Box>
        </CardBody>
      </Card>
    </LayoutAdmin>
  );
}

export default SettingsPage;
