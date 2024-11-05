"use client";
import React, { useState, useEffect } from "react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Image from "next/image";
import CustomInput from "~/components/common/custom-input";
import { authFormSchema } from "~/lib/utils";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "~/components/ui/form";
import { ComboBoxResponsive } from "~/components/common/combobox";
import {
  fetch_site_info,
  fetch_company_details,
  fetch_sites,
  signIn,
  fetch_user_roles,
} from "~/lib/actions/user.actions";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "~/store/auth-store"; // Adjust the path as needed
const SignIn = () => {

  interface IpResponse {
    ip: string; // The IP address returned by the API
  }

  const router = useRouter();
  const searchParams = useSearchParams();
  const [siteInfo, setSiteInfo] = useState<SiteCompany[] | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<SiteCompany | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const [userIp, setUserIp] = useState<string | null>(null);

  const { account, site_url, site_company, site_info } = useAuthStore();

  const update_site_info = useAuthStore((state) => state.set_site_info);
  const set_site_url = useAuthStore((state) => state.set_site_url);
  const set_receipt_info = useAuthStore((state) => state.set_receipt_info);
  const update_company_site = useAuthStore((state) => state.set_site_company);
  const update_account = useAuthStore((state) => state.set_account_info);
  // const update_bypass_login_info = useAuthStore(
  //   (state) => state.set_without_sign_in_auth,
  // );
  {
    /** auth store info -end */
  }

  const formSchema = authFormSchema();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      site_name: "",
      username: "",
      password: "",
    },
  });

  const fetchUserIp = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data: IpResponse = await response.json();
      const userIp = setUserIp(data.ip);
      console.log('User IP:', userIp);
    } catch (error) {
      console.error('Failed to fetch IP address', error);
      setUserIp(null);
    }
  };

  useEffect(() => {
    void fetchUserIp();
  }, []);

  const handleEnterSite = async () => {
    console.log("Getting Site Info", form.getValues().site_name);

    try {
      setIsLoading(true);
      const response = await fetch_sites(form.getValues().site_name);

      if (response == null) {
        toast.error("Something Went Wrong");
      } else {
        setSiteInfo(response);
      }
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setIsLoading(false);
    }
  };


  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const company_information: SiteInfo[] | null = await fetch_site_info(
        data.site_name ?? ""
      );

      if (company_information === null) {
        throw new Error("Company information not loaded. Contact Support");
      }

      const login_result = await signIn({
        company_url: company_information[0]!.company_url,
        username: data.username,
        password: data.password,
        selected_company: selectedCompany?.company_prefix ?? "",
        ip: userIp || "",
      });

      // Check if login was unsuccessful due to unauthorized access
      if (!login_result.success) {
        if (login_result.message === "Unauthorized Access") {
          toast.error("Login Failed: Unauthorized Access!");
        } else {
          toast.error(login_result.message || "Login Failed: Invalid Credentials");
        }
        return; // Prevent further execution
      }

      // Ensure login_result.data exists for further actions
      if (login_result.data) {
        // Fetch receipt information and roles only if login succeeded
        const receipt_info = await fetch_company_details(
          company_information[0]!.company_url,
          selectedCompany!.company_prefix
        );

        if (receipt_info == null) {
          toast.error("Login Failed: Receipt Information Setup Failed");
          return;
        }

        const roles = await fetch_user_roles(
          company_information[0]!.company_url,
          selectedCompany!.company_prefix,
          login_result.data.role_id,
          login_result.data.id
        );

        if (roles === null) {
          toast.error("Failed to fetch roles");
        } else {
          localStorage.setItem("roles", JSON.stringify(roles));
        }

        // Set up account and site info
        update_account(login_result.data);
        update_site_info(company_information[0]!);
        set_receipt_info(receipt_info);
        set_site_url(company_information[0]!.company_url);
        update_company_site(selectedCompany!);

        // Navigate to the dashboard if everything is successful
        handle_page_to_navigate_to();
      }
    } catch (error) {
      toast.error("Login Failed: Contact Support");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };


  // Page Actions
  const handle_page_to_navigate_to = () => {
    const query_search_params = new URLSearchParams(searchParams);
    const page_flag = query_search_params.get("page_flag");

    console.log("PAGE FLAG", page_flag);

    if (page_flag === "manual-milk-collection") {
      // navigate("/manual-milk-collection");
    }

    router.replace("/dashboard");
  };

  useEffect(() => {
    if (account) {
      handle_page_to_navigate_to();
    }
  }, [account]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <div className="flex flex-row items-center justify-center">
            <Image
              src={"/images/image-192.png"}
              alt="Digisales Logo"
              width={80}
              height={80}
              priority
            />
          </div>

          <CardTitle className="text-2xl">Digisales</CardTitle>
          <CardDescription>
            Please enter your details to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <CustomInput
                  control={form.control}
                  label="Site Name"
                  name="site_name"
                  placeholder="Site Name"
                  type="text"
                  on_blur={() => void handleEnterSite()}
                />
                <CustomInput
                  control={form.control}
                  label="Username"
                  name="username"
                  placeholder="Enter Username"
                  type="text"
                />
                <CustomInput
                  control={form.control}
                  name="password"
                  label="Password"
                  placeholder="Enter Password"
                  type="password"
                />
                <ComboBoxResponsive
                  type={"Company Name"}
                  data={siteInfo}
                  setSelected={setSelectedCompany}
                />

                <>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" /> &nbsp;
                      </>
                    ) : (
                      <>Login</>
                    )}
                  </Button>
                </>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
