import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import SidebarWithHeader from "@/app/components/sidebar";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { Box, Card, CardBody, CardHeader } from "@chakra-ui/react";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Beranda",
  breadCrumb: ["Home"],
};

function HomePage() {
  return (
    <SidebarWithHeader>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />
      <Card rounded={radiusStyle}>
        <CardBody>
          <Box minH={"80vh"}>
            <p>Home page content</p>
          </Box>
        </CardBody>
      </Card>
    </SidebarWithHeader>
  );
}

export default HomePage;
