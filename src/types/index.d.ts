declare type ComboBoxProps = {
  type: string;
  data: unknown;
  setSelected: (i: any) => void;
};

declare type SiteInfo = {
  company_url: string;
  tax: string;
  app_customer_creation: string;
  mpesa_paybill: string;
  manual_mpesa: string;
  visa: string;
  credit_note: string;
  cheque: string;
  packaging_items_present: string;
  limit_devices: string;
};

declare type SiteCompany = {
  company_prefix: string;
  branch: string;
};

declare type UserAccountInfo = {
  id: string;
  user_id: string;
  real_name: string;
  default_store: string;
  date_format: string;
  date_spec: string;
  dec_spec: string;
  def_print_destination: string;
  def_prin_orientation: string;
  description: string; //NOTE: (teddy) User role descriptiton
  email: string;
  graphic_link: string;
  inactive: string;
  language: string;
  last_visit_date: string;
  page_size: string;
  password: string;
  percent_dec: string;
  phone: string;
  pin: string;
  pos: string;
  price_dec: string;
  print_profile: string;
  qty_dec: string;
  query_size: string;
  rates_dec: string;
  rep_popup: string;
  role_id: string;
  save_report_selections: string;
  show_codes: string;
  show_gl: string;
  show_hints: string;
  startup_tab: string;
  sticky_doc_date: string;
  theme: string;
  tho_sep: string;
  transaction_days: string;
  use_date_picker: string;
};

declare type CompanyReceiptInfo = {
  name: string;
  location: string;
  email: string;
  phone_number: string;
  receipt: string;
};

declare type EndpointAuthInfo = {
  url: string;
  prefix: string;
  user_id: string;
  username: string;
  default_store: string;
  site_name: string;
};

declare type AuthInfo = {
  receipt_info: CompanyReceiptInfo | null;
  site_info: SiteInfo | null;
  site_url: string | null;
  site_company: SiteCompany | null;
  account: UserAccountInfo | null;
  without_sign_in_auth: EndpointAuthInfo | null;

  clear_auth_session: () => void;
  set_site_url: (url: string) => void;
  set_site_info: (url: SiteInfo) => void;
  set_receipt_info: (url: CompanyReceiptInfo) => void;
  set_site_company: (s: SiteCompany) => void;
  set_account_info: (a: AccountInfo) => void;
  set_without_sign_in_auth: (e: EndpointAuthInfo) => void;
  get_auth_data: () => EndpointAuthInfo;
  is_authenticated: () => boolean;
};

// Inventory Types

declare type InventoryItem = {
  stock_id: string;
  description: string;
  rate: string;
  kit: string;
  units: string;
  mb_flag: string;
};

declare type PricingMode = {
  id: string;
  sales_type: string;
};

declare type ProductPriceDetails = {
  price: number;
  quantity_available: number;
  tax_mode: number;
};

declare type ItemType = "Sales" | "Purchases" | "All";

// Sales Order Types
declare type Customer = {
  br_name: string;
  branch_code: string;
  branch_ref: string;
  debtor_no: string;
  lat: string;
  lng: string;
  is_farmer: string;
};
declare type CustomerBranch = {
  branch_code: string;
  br_name: string;
  branch_ref: string;
  debtor_no: string;
  lat: string;
  lon: string;
};
declare type DirectSalesType = {
  __typename: "direct_sales";
  customer: Customer;
  branches: CustomerBranch[];
  user: string;
  bottles_issued?: string;
  bottles_returned?: string;
  max_quantity: number;
  discount?: string;
};
declare type OrderEntryItem = {
  item: InventoryItem;
  details: ProductPriceDetails;
  quantity: number;
} & DirectSalesType;

declare type DirectSales = Omit<
  OrderEntryItem & DirectSalesType,
  "customer" | "branches"
>;
