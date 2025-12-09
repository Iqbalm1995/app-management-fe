export interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
}

export const NAV_ITEMS_LANDING: Array<NavItem> = [
  // {
  //   label: "Produk",
  //   labelEN: "Product",
  //   labelID: "Produk",
  //   children: [
  //     {
  //       label: "Blank Page",
  //       labelEN: "Blank Page",
  //       labelID: "Halaman Kosong",
  //       subLabel: "Example blank page",
  //       subLabelEN: "Example blank page",
  //       subLabelID: "Contoh Halaman Kosong",
  //       href: "/blank-page",
  //     },
  //   ],
  // },
  {
    label: "Tentang Kami",
    href: "/tentang-kami",
  },
  {
    label: "Hubungi Kami",
    href: "/hubungi-kami",
  },
];
