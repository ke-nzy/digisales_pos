"use client";
import React from "react";

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
const SignIn = () => {
  const formSchema = authFormSchema();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      site_name: "",
      username: "",
      password: "",
    },
  });
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <div className="flex flex-row items-center justify-center">
            <Image
              src={"/images/image-192.png"}
              alt="Digisales Logo"
              width={80}
              height={80}
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
              {/* <div className="grid gap-2"> */}
              {/* <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              /> */}
              <CustomInput
                control={form.control}
                label="Site Name"
                name="site_name"
                placeholder="Site Name"
                type="text"
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
              {/* </div> */}
              {/* <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password" type="password" required />
              </div> */}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </Form>
          </div>
          {/* <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="#" className="underline">
              Sign up
            </Link>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
