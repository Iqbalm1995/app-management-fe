"use client";

import { DropZoneComponent } from "@/app/components/dropzone";
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Beranda",
  breadCrumb: ["Home", "Drop Zone"],
};

function DropZonePage() {
  useDocumentTitle("File Upload");
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
