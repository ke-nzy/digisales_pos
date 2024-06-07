interface Window {
  define: any;
}

// If you're using workers, you might need to extend WorkerGlobalScope as well
interface WorkerGlobalScope {
  define: any;
}

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
