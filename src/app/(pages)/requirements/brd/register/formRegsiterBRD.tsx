"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { REQUIREMENT_TYPE_BRD } from "@/app/constants/applicationConstants";

const TYPE_REQ: string = REQUIREMENT_TYPE_BRD;

const HeaderDataContent: HeaderContentProps = {
  titleName: `Registrasi ${TYPE_REQ}`,
  breadCrumb: ["Home", "Requirements", TYPE_REQ, "Registrasi"],
};

function RequirementsBRDRegisterView() {
  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />
    </LayoutAdmin>
  );
}

export default RequirementsBRDRegisterView;
