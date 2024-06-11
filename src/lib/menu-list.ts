import {
  Settings,
  SquarePen,
  LayoutGrid,
  ScrollText,
  ArrowLeftRight,
  ShoppingBag,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/pos",
          label: "Dashboard",
          active: pathname.includes("/pos"),
          icon: LayoutGrid,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Items & Inventory",
      menus: [
        {
          href: "/inventory",
          label: "Inventory",
          active: pathname.includes("/products"),
          icon: SquarePen,
          submenus: [
            {
              href: "/inventory",
              label: "Branch Inventory",
              active: pathname === "/inventory",
            },
            {
              href: "/inventory/stocktake",
              label: "Stock Take",
              active: pathname === "/inventory/stocktake",
            },
          ],
        },
        // {
        //   href: "/categories",
        //   label: "Categories",
        //   active: pathname.includes("/categories"),
        //   icon: Bookmark,
        //   submenus: [],
        // },
      ],
    },
    {
      groupLabel: "Sales",
      menus: [
        {
          href: "/reports",
          label: "Sales Reports",
          active: pathname.includes("/products"),
          icon: ScrollText,
          submenus: [
            // {
            //   href: "/posts",
            //   label: "All Posts",
            //   active: pathname === "/posts",
            // },
            // {
            //   href: "/posts/new",
            //   label: "New Post",
            //   active: pathname === "/posts/new",
            // },
          ],
        },
        {
          href: "/transactions",
          label: "Transactions",
          active: pathname.includes("/categories"),
          icon: ArrowLeftRight,
          submenus: [],
        },
        {
          href: "/reservations",
          label: "Reservations",
          active: pathname.includes("/reservations"),
          icon: ShoppingBag,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Settings",
      menus: [
        // {
        //   href: "/users",
        //   label: "Users",
        //   active: pathname.includes("/users"),
        //   icon: Users,
        //   submenus: [],
        // },
        {
          href: "/account",
          label: "Account",
          active: pathname.includes("/account"),
          icon: Settings,
          submenus: [],
        },
      ],
    },
  ];
}
