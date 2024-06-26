import axios from "axios";
import { toDate } from "../utils";

export async function fetch_sites(site: string) {
  const form = new FormData();
  form.append("cmp", site);
  form.append("tp", "getsites");
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  try {
    const response = await axios.postForm<SiteCompany[]>(
      "https://digerp.com/config_site.php",
      form,
      config,
    );
    if (response.data.length === 0) {
      return null;
    }

    return response.data;
  } catch (e) {
    console.log("Failed to get site", e);
    return null;
  }
}

export async function fetch_site_info(site: string) {
  const form = new FormData();
  form.append("cmp", site);
  form.append("tp", "setcomp");

  try {
    const response = await axios.postForm<SiteInfo[]>(
      "https://digerp.com/config_site.php",
      form,
    );
    if (response.status !== 200) {
      return null;
    }

    return response.data;
  } catch (e) {
    console.log("Failed to get SIte Info");
    console.log(e);
    return null;
  }
}

interface LoginUser {
  company_url: string;
  username: string;
  password: string;
  selected_company: string;
}

export type AuthorizationResponse = {
  status: "Failed" | "Success";
  message: "Authorized" | "Not Authorized";
};

export const signIn = async (userData: LoginUser) => {
  try {
    // Mutation /Database
    const form_data = new FormData();
    form_data.append("tp", "login");
    form_data.append("un", userData.username);
    form_data.append("up", userData.password);
    form_data.append("cp", userData.selected_company);
    const response = await axios.postForm<UserAccountInfo>(
      `${userData.company_url}process.php`,
      form_data,
    );

    return response.data;
  } catch (error) {
    console.error("Error", error);
  }
};

export async function fetch_company_details(
  site_url: string,
  company: string,
): Promise<CompanyReceiptInfo | null> {
  const request_data = new FormData();
  request_data.append("tp", "receipt");
  request_data.append("cp", company);

  try {
    const response = await axios.postForm<string[]>(
      `${site_url}process.php`,
      request_data,
    );

    return {
      name: response.data[0]!,
      location: response.data[1]!,
      email: response.data[2]!,
      phone_number: response.data[3]!,
      receipt: response.data[5]!,
    };
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function fetch_user_roles(
  site_url: string,
  cp: string,
  roleid: string,
  id: string,
) {
  const form = new FormData();
  form.append("tp", "roles");
  form.append("roleid", roleid);
  form.append("id", id);
  form.append("cp", cp);

  try {
    const response = await axios.postForm<string[]>(
      `${site_url}process.php`,
      form,
    );

    return response.data;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function fetch_sales_person_summary_report(
  site_company: SiteCompany,
  account: UserAccountInfo,
  site_url: string,
  sdate: Date,
  edate: Date,
) {
  const form_data = new FormData();
  form_data.append("tp", "salespersonitemsales");
  form_data.append("cp", site_company.company_prefix);
  form_data.append("id", account.id);
  form_data.append("sdate", "2024-05-01");
  form_data.append("edate", "2024-06-30");

  try {
    const response = await axios.postForm<SalesReportItem[]>(
      `${site_url}process.php`,
      form_data,
    );
    if ((response as unknown as string) === "") {
      console.error("tp: userStoreBalance failed");
      //    Add sentry here
      return [];
    }
    console.log("response", response.data);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error);
    }
    return null;
  }
}
export async function fetch_pos_transactions_report(
  site_company: SiteCompany,
  account: UserAccountInfo,
  site_url: string,
  postrans_date: Date,
  end_date: Date,
) {
  const form_data = new FormData();
  form_data.append("tp", "loadPOSTransaction");
  form_data.append("cp", site_company.company_prefix);
  form_data.append("id", account.id);
  form_data.append("postrans_date", "2024-05-01");
  form_data.append("end_date", "2024-06-30");

  try {
    const response = await axios.postForm<TransactionReportItem[]>(
      `${site_url}process.php`,
      form_data,
    );
    if ((response as unknown as string) === "") {
      console.error("tp: loadPOSTransaction failed");
      //    Add sentry here
      return [];
    }
    console.log("response", response.data);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error);
    }
    return null;
  }
}
export async function fetch_held_transactions_report(
  site_company: SiteCompany,
  account: UserAccountInfo,
  site_url: string,
  postrans_date: Date,
  end_date: Date,
) {
  const form_data = new FormData();
  form_data.append("tp", "loadHeldTransaction");
  form_data.append("cp", site_company.company_prefix);
  form_data.append("id", account.id);
  form_data.append("postrans_date", "2024-05-01");
  form_data.append("end_date", "2024-06-30");

  try {
    const response = await axios.postForm<TransactionReportItem[]>(
      `${site_url}process.php`,
      form_data,
    );
    if ((response as unknown as string) === "") {
      console.error("tp: loadPOSTransaction failed");
      //    Add sentry here
      return [];
    }
    console.log("response", response.data);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error);
    }
    return null;
  }
}

export async function submit_authorization_request(
  site_url: string,
  company_prefix: string,
  password: string,
  action: string,
) {
  const form_data = new FormData();
  form_data.append("tp", "action_authorize");
  form_data.append("cp", company_prefix);
  form_data.append("password", password);
  form_data.append("action", action);

  try {
    const response = await axios.postForm<AuthorizationResponse>(
      `${site_url}process.php`,
      form_data,
    );
    console.log("Submission successful");
    console.log("AUTHORIZED RESPONSE");
    if (response.data.status === "Success") {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.error(e);
    if (axios.isAxiosError(e)) {
      console.error(e);
    }
    // Sentry
    console.error("Failed to authorize");
    return false;
  }
}

export async function submit_hold_direct_sale_request(
  //receipt_info: CompanyReceiptInfo,
  site_url: string,
  company_prefix: string,
  user_id: string,
  username: string,
  data_items: DirectSales[],
  customer: Customer,
  payments: null,
  customer_name: string,
  identifier: string,
) {
  console.log("Submitting payment details for direct sale");

  const total = data_items.reduce(
    (x, y) => x + y.details.price * y.quantity,
    0,
  );
  console.log("total", total);

  if (data_items) {
    data_items.map((x) => {
      if (x.quantity > x.max_quantity) {
        return null;
      }
    });
  }

  const items = data_items.map((x: DirectSales) => {
    const tax = (parseInt(x.item.rate) * x.details.price) / 100;

    return {
      quantity: x.quantity.toFixed(2),
      quantityAval: x.details.quantity_available.toFixed(2),
      booking_id: "",
      customer_option: customer.br_name,
      customer_option_id: customer.branch_code,
      booking_type: "",
      discount: x.discount ?? "0",
      mode_prices: "1",
      kit: x.item.kit,
      batch_no: "",
      tax: tax.toFixed(2),
      item_option: x.item.description,
      item_option_id: x.item.stock_id,
      rate: x.item.rate,
      deposit: "",
      total: total,
      price: x.details.price.toFixed(2),
      posBatchSelect: "",
      bottles_issued: x.bottles_issued ?? "",
      bottles_returned: x.bottles_returned ?? "",
      fsalesp: "",
    };
  });

  const payment = payments;

  console.log("payment", payment);

  const form_data = new FormData();
  form_data.append("tp", "hold-transaction");
  form_data.append("cp", company_prefix);
  form_data.append("id", user_id);
  form_data.append("ttp", "");
  form_data.append("total", total.toString());
  form_data.append("pospayments", "");
  form_data.append("posdesc", JSON.stringify(items));
  form_data.append("uname", username);
  form_data.append("cpbooking_id", "");
  form_data.append("cust_name", customer_name);
  form_data.append("unique_identifier", identifier);

  try {
    const response = await axios.postForm<SalesReceiptInformation>(
      `${site_url}process.php`,
      form_data,
    );
    console.log("Submission successful");
    console.log("HOLD SALES RESPONSE", response.data);

    if (typeof response.data === "string") {
      // SEND STRING TO SENTRY
      return null;
    }
    return response.data;
  } catch (e) {
    console.error(e);
    if (axios.isAxiosError(e)) {
      console.error(e);
    }
    console.error("Failed to submit direct sale data");
    return null;
  }
}

export async function submit_start_shift(
  site_url: string,
  company_prefix: string,
  user_id: string,
) {
  const form_data = new FormData();
  form_data.append("tp", "start_shift");
  form_data.append("cp", company_prefix);
  form_data.append("id", user_id);
  try {
    const response = await axios.postForm<CheckInResponse>(
      `${site_url}process.php`,
      form_data,
    );
    console.log("Submission successful");
    console.log("START SHIFT RESPONSE", response.data);

    if (typeof response.data === "string") {
      // SEND STRING TO SENTRY
      return null;
    }
    localStorage.setItem("start_shift", JSON.stringify(response.data));
    return response.data;
  } catch (e) {
    console.error(e);
    if (axios.isAxiosError(e)) {
      console.error(e);
    }
    console.error("Failed to start shift data");
    return null;
  }
}
export async function submit_end_shift(
  site_url: string,
  company_prefix: string,
  user_id: string,
  shift_id: string,
) {
  const form_data = new FormData();
  form_data.append("tp", "close_shift");
  form_data.append("cp", company_prefix);
  form_data.append("id", user_id);
  form_data.append("shiftid", shift_id);
  try {
    const response = await axios.postForm<CheckInResponse>(
      `${site_url}process.php`,
      form_data,
    );
    console.log("Submission successful");
    console.log("END SHIFT RESPONSE", response.data);

    if (typeof response.data === "string") {
      // SEND STRING TO SENTRY
      return null;
    }
    return response.data;
  } catch (e) {
    console.error(e);
    if (axios.isAxiosError(e)) {
      console.error(e);
    }
    console.error("Failed to start shift data");
    return null;
  }
}

export async function fetch_daily_sales_target_summary(
  site_url: string,
  company_prefix: string,
  date: Date,
  branch_code: string,
) {
  const form = new FormData();
  form.append("tp", "get_branch_daily_report");
  form.append("cp", company_prefix);
  form.append("date", toDate(date));
  form.append("branch_code", branch_code);

  try {
    const response = await axios.postForm<DailyTargetReportSummary>(
      `${site_url}process.php`,
      form,
    );
    if (response.data.status === "Failed") {
      return null;
    }

    return response.data;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      console.log("Failed to fetch items sales");
    }
    console.log(e);
    return null;
  }
}
