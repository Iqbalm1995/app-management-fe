"use client";

import { DropZoneComponent } from "@/app/components/dropzone";
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Beranda",
  breadCrumb: ["Home", "Drop Zone"],
};

function DropZonePage() {
  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />
      <DropZoneComponent />
    </LayoutAdmin>
  );
}

export default DropZonePage;
