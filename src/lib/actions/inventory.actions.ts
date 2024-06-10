// Get All Sellable Items

import axios from "axios";

export async function fetch_all_sellable_items(
  site_company: SiteCompany,
  account: UserAccountInfo,
  site_url: string,
) {
  console.log("fe", {
    site_company,
    account,
    site_url,
  });

  const form_data = new FormData();
  form_data.append("tp", "loadItemsAll");
  form_data.append("cp", site_company.company_prefix);
  form_data.append("name", "%%");
  form_data.append("branch_code", account.default_store);
  form_data.append("type", "Sales");

  try {
    const response = await axios.postForm<InventoryItem[]>(
      `${site_url}process.php`,
      form_data,
    );
    if ((response as unknown as string) === "") {
      console.error("tp: loadItemsAll failed");
      //    Add sentry here
      return [];
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error);
    }
    return null;
  }
  //   add finally to take loading into account
}
