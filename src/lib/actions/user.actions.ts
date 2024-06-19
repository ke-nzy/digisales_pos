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
