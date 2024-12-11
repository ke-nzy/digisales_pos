// Get All Sellable Items

import axios from "axios";

export async function fetch_all_sellable_items(
  site_company: SiteCompany,
  account: UserAccountInfo,
  site_url: string,
) {
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

export async function fetch_all_item_inventory(
  site_company: SiteCompany,
  account: UserAccountInfo,
  site_url: string,
) {
  const form_data = new FormData();
  form_data.append("tp", "loadItemsAllWithPriceAndBalance");
  form_data.append("cp", site_company.company_prefix);
  form_data.append("name", "%%");
  form_data.append("branch_code", account.default_store);
  form_data.append("type", "Sales");

  try {
    const response = await axios.postForm<PriceList[]>(
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
}

export async function fetch_item_details(
  site_url: string,
  company_prefix: string,
  user_id: string,
  stock_id: string,
  kit: string,
  pricing_id: PricingMode | undefined,
) {
  const form_data = new FormData();
  form_data.append("tp", "getItemPriceQtyTaxWithId");
  form_data.append("it", stock_id);
  form_data.append("cp", company_prefix);
  form_data.append("kit", kit);
  form_data.append("id", user_id);
  if (pricing_id) {
    form_data.append("pid", pricing_id.id);
  }
  try {
    const response = await axios.postForm<string>(
      `${site_url}process.php`,
      form_data,
    );

    if (response.data === "") {
      //No data was returned
      return null;
    }

    const args = response.data.split("|");

    const product_details: ProductPriceDetails = {
      price: parseFloat(args[0] ?? "0"),
      quantity_available: parseFloat(args[1] ?? "0"),
      tax_mode: parseInt(args[2] ?? "0"),
    };

    if (args.length <= 3) {
      return product_details;
    }

    return null;
  } catch (e) {
    console.log(JSON.stringify(e));
    if (axios.isAxiosError(e)) {
      console.log(e);
    }

    return null;
  }
}

export async function fetch_branch_inventory(
  site_company: SiteCompany,
  account: UserAccountInfo,
  site_url: string,
) {
  const form_data = new FormData();
  form_data.append("tp", "userStoreBalance");
  form_data.append("cp", site_company.company_prefix);
  form_data.append("id", account.id);
  form_data.append("loc_code", account.default_store);

  try {
    const response = await axios.postForm<StockItem[]>(
      `${site_url}process.php`,
      form_data,
    );
    console.log(response);
    if ((response as unknown as string) === "") {
      console.error("tp: userStoreBalance failed");
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
}
