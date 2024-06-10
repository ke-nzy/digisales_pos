import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { CopyIcon, MoveVerticalIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";

import { Button } from "~/components/ui/button";
import { generateRandomString } from "~/lib/utils";

const InvoiceSummary = () => {
  const invNo = generateRandomString(8);
  return (
    <div>
      <Card className="h-full  ">
        <CardHeader className="flex flex-row items-start bg-muted/50">
          <div className="grid gap-0.5">
            <CardTitle className="group flex items-center gap-2 text-lg">
              Invoice {invNo}
              {/* <Button
                size="icon"
                variant="outline"
                className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <CopyIcon className="h-3 w-3" />
                <span className="sr-only">Copy Order ID</span>
              </Button> */}
            </CardTitle>
            <CardDescription>
              Date: {new Date().toLocaleDateString()}
            </CardDescription>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <CopyIcon className="h-3.5 w-3.5" />
              <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                Copy Inv Id
              </span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" className="h-8 w-8">
                  <MoveVerticalIcon className="h-3.5 w-3.5" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Pause</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Trash</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-sm">
          <div className="grid gap-3">
            <div className="font-semibold">Payment Details</div>

            <Separator className="my-2" />
            <ul className="grid gap-3">
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-right">KSH299.00</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-right">KSH5.00</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>KSH25.00</span>
              </li>
              <li className="flex items-center justify-between font-semibold">
                <span className="text-muted-foreground">Total</span>
                <span>KSH329.00</span>
              </li>
            </ul>
          </div>

          <Separator className="my-4" />
          <div className="grid gap-3">
            <div className="font-semibold">Customer Information</div>
            <dl className="grid  gap-6">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Customer</dt>
                <dd>Liam Okello</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Email</dt>
                <dd>
                  <a href="#">liam@gmail.com</a>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Phone</dt>
                <dd>
                  <a href="#">+254 234 567 890</a>
                </dd>
              </div>
            </dl>
          </div>
          {/* <Separator className="my-4" />
          <div className="grid gap-3">
            <div className="font-semibold">Payment Information</div>
            <dl className="grid gap-3">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1 text-muted-foreground">
                  <CreditCardIcon className="h-4 w-4" />
                  Visa
                </dt>
                <dd>**** **** **** 4532</dd>
              </div>
            </dl>
          </div> */}
        </CardContent>
        {/* <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
          <div className="text-xs text-muted-foreground">
            Updated <time dateTime="2023-11-23">November 23, 2023</time>
          </div>
          <Pagination className="ml-auto mr-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <Button size="icon" variant="outline" className="h-6 w-6">
                  <ChevronLeftIcon className="h-3.5 w-3.5" />
                  <span className="sr-only">Previous Order</span>
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button size="icon" variant="outline" className="h-6 w-6">
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                  <span className="sr-only">Next Order</span>
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter> */}
      </Card>
    </div>
  );
};

export default InvoiceSummary;
