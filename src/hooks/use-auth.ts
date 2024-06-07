import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";

export const useAuthStore = create<AuthInfo>()(
  devtools(
    persist(
      (set, get) => {
        return {
          receipt_info: null,
          site_info: null,
          site_url: null,
          site_company: null,
          account: null,
          without_sign_in_auth: null,
          clear_auth_session: () => {
            set({
              receipt_info: null,
              site_info: null,
              site_url: null,
              site_company: null,
              account: null,
              without_sign_in_auth: null,
            });
          },
          set_site_url: (url: string) => set((_state) => ({ site_url: url })),
          set_receipt_info: (data: CompanyReceiptInfo) =>
            set((_state) => ({ receipt_info: data })),
          set_site_info: (data: SiteInfo) =>
            set((_state) => ({ site_info: data })),
          set_site_company: (s: SiteCompany) =>
            set((_state) => ({ site_company: s })),
          set_account_info: (a: UserAccountInfo) =>
            set((_state) => ({ account: a })),
          set_without_sign_in_auth: (e: EndpointAuthInfo) => {
            set((_state) => ({ without_sign_in_auth: e }));
          },
          get_auth_data: (): EndpointAuthInfo => {
            if (get().without_sign_in_auth === null) {
              return {
                url: get().site_info?.company_url ?? "",
                prefix: get().site_company?.company_prefix ?? "",
                user_id: get().account?.id ?? "",
                username: get().account?.user_id ?? "",
                default_store: get().account?.default_store ?? "",
                site_name: get().receipt_info?.name ?? "",
              };
            } else {
              return get().without_sign_in_auth!;
            }
          },
          is_authenticated: () => {
            const store = get();
            return (
              store.without_sign_in_auth !== null ||
              (store.site_info !== null &&
                store.account !== null &&
                store.receipt_info !== null)
            );
          },
        };
      },
      {
        name: "auth-storage",
        storage: createJSONStorage(() => localStorage),
      },
    ),
    { name: "auth", store: "auth" },
  ),
);
