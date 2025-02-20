"use client";

import { DropZoneComponent } from "@/app/components/dropzone";
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import SidebarWithHeader from "@/app/components/sidebar";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Beranda",
  breadCrumb: ["Home", "Drop Zone"],
};

function DropZonePage() {
  return (
    <SidebarWithHeader>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />
      <DropZoneComponent />
    </SidebarWithHeader>
  );
}

export default DropZonePage;
