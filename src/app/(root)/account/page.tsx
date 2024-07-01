"use client";
import Link from "next/link";
import { DashboardLayout } from "~/components/common/dashboard-layout";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useAuthStore } from "~/store/auth-store";

export default function AccountPage() {
  const { account, receipt_info } = useAuthStore();
  return (
    <DashboardLayout title="Settings">
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          <nav className="grid gap-4 text-sm text-muted-foreground">
            <Link href="#" className="font-semibold text-primary">
              General
            </Link>
            {/* <Link href="#">Security</Link>
            <Link href="#">Integrations</Link>
            <Link href="#">Support</Link>
            <Link href="#">Organizations</Link>
            <Link href="#">Advanced</Link> */}
          </nav>
          <div className="grid gap-6">
            <Card x-chunk="dashboard-04-chunk-1">
              <CardHeader>
                <CardTitle>Store Name</CardTitle>
                <CardDescription>
                  You are currently selling from
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <Label>Company Name</Label>
                  <Input
                    placeholder="Company Name"
                    value={receipt_info?.name ?? "Digisoft"}
                  />
                  <Label>Store Name</Label>
                  <Input
                    placeholder="Store Name"
                    value={account?.default_store ?? "Digisoft"}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                {/* <Button>Save</Button> */}
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>User</CardTitle>
                <CardDescription>
                  You are currently logged in as
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <Label>Username</Label>
                  <Input
                    placeholder="Username"
                    value={account?.real_name ?? ""}
                  />
                  <Label>Email</Label>
                  <Input placeholder="Email" value={account?.email ?? ""} />
                  {/* <div className="flex items-center space-x-2">
                    <Checkbox id="include" defaultChecked />
                    <label
                      htmlFor="include"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Allow administrators to change the directory.
                    </label>
                  </div> */}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                {/* <Button>Save</Button> */}
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
