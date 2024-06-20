"use client";
import React, { useEffect, useState } from "react";
import { Card, CardHeader } from "~/components/ui/card";
import {
  CaptionsOffIcon,
  EllipsisIcon,
  LogOutIcon,
  // CopyIcon,
  // MoveVerticalIcon,
  PauseIcon,
  PercentIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
  ShoppingBasketIcon,
  Trash2Icon,
  User2Icon,
  XIcon,
} from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
// } from "~/components/ui/dropdown-menu";
import {
  calculateCartTotal,
  calculateDiscount,
  cn,
  generateRandomString,
  tallyTotalAmountPaid,
} from "~/lib/utils";
import { useCartStore } from "~/store/cart-store";
import { toast } from "sonner";
import { usePayStore } from "~/store/pay-store";
import { submit_direct_sale_request } from "~/lib/actions/pay.actions";
import { useAuthStore } from "~/store/auth-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { CustomerComboBox } from "./common/customercombo";
import { useCustomers } from "~/hooks/use-customer-payments";
import { TimerIcon } from "@radix-ui/react-icons";
import { useStore } from "~/hooks/use-store";
import { useSidebarToggle } from "~/hooks/use-sidebar-toggle";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

const InvoiceSummary = () => {
  const {
    currentCart,
    clearCart,
    holdCart,
    selectedCartItem,
    setSelectedCartItem,
    deleteItemFromCart,
  } = useCartStore();
  const sidebar = useStore(useSidebarToggle, (state) => state);
  const [isLoading, setIsLoading] = useState<boolean | null>(null);
  const { paymentCarts, removeItemFromPayments } = usePayStore();
  const { site_url, site_company, account } = useAuthStore();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedCartItem(null);
        event.preventDefault(); // Optional: Prevents the default browser action for F1
      }
      // if (event.key === "F9") {
      //   setDialogOpen(true);
      //   event.preventDefault(); // Optional: Prevents the default browser action for F9
      // }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const invNo = generateRandomString(8);
  const total = calculateCartTotal(currentCart!);
  const discount = calculateDiscount(currentCart!);
  const totalPaid = tallyTotalAmountPaid(paymentCarts);
  const handleClearCart = () => {
    clearCart();
    toast.success("Cart cleared successfully");
  };

  const handleHoldCart = () => {
    holdCart();
    toast.success("Cart held successfully");
  };

  const { customer } = useCustomers();

  const handleProcessInvoice = async () => {
    if (isLoading) {
      return;
    }
    if (!currentCart) {
      toast.error("Please add items to cart");
      // setIsLoading(false);
      return;
    }
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      // setIsLoading(false);
      return;
    }

    if (totalPaid < total - discount || !totalPaid) {
      toast.error("Insufficient funds");
      return;
    }

    setIsLoading(true);

    const result = await submit_direct_sale_request(
      site_url!,
      site_company!.company_prefix,
      account!.id,
      account!.user_id,
      currentCart.items,
      selectedCustomer,
      paymentCarts,
      selectedCustomer.br_name,
      Date.now(),
    );
    console.log("result", result);
    if (!result) {
      // sentry.captureException(result);
      toast.error("Transaction failed");
      setIsLoading(false);
      return;
    }

    // process receipt

    toast.success("Invoice processed successfully");
    // clearCart();
  };

  if (!currentCart) return null;

  return (
    // <Card className="min-h-[88vh] border-0 bg-zinc-50">
    //   <CardHeader className="flex flex-row items-start bg-muted/50">
    //     <div className="grid gap-2">
    //       <CardTitle className="group flex items-center gap-2 text-lg">
    //         Invoice {invNo}
    //         {/* <Button
    //             size="icon"
    //             variant="outline"
    //             className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
    //           >
    //             <CopyIcon className="h-3 w-3" />
    //             <span className="sr-only">Copy Order ID</span>
    //           </Button> */}
    //       </CardTitle>
    //       <CardDescription>
    //         Date: {new Date().toLocaleDateString()}
    //       </CardDescription>
    //     </div>

    //     <div className="ml-auto flex items-center gap-1">
    //       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
    //         <DialogTrigger asChild>
    //           <Button
    //             size="sm"
    //             variant="default"
    //             onClick={() => setDialogOpen(true)}
    //             className="ml-4 h-8 gap-1"
    //           >
    //             {selectedCustomer ? (
    //               <>
    //                 <User2Icon className="h-3.5 w-3.5" />
    //               </>
    //             ) : (
    //               <BookmarkCheckIcon className="h-3.5 w-3.5" />
    //             )}
    //             <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
    //               {selectedCustomer
    //                 ? selectedCustomer.br_name
    //                 : "Select Customer"}
    //             </span>
    //           </Button>
    //         </DialogTrigger>
    //         <DialogContent className="sm:max-w-md">
    //           <DialogHeader>
    //             <DialogTitle>Checkout</DialogTitle>
    //             <DialogDescription></DialogDescription>
    //           </DialogHeader>
    //           <div className="flex items-center space-x-2">
    //             <div className="grid flex-1 gap-2">
    //               <ul className="grid gap-3">
    //                 <li className="flex items-center justify-between font-semibold">
    //                   <span className="text-muted-foreground">Total</span>

    //                   <span>KSH {total + discount}</span>
    //                 </li>
    //                 <li className="flex items-center justify-between font-semibold">
    //                   <span className="text-green-900/80">Paid</span>
    //                   <span className="text-right">
    //                     KSH {totalPaid ?? "0.00"}
    //                   </span>
    //                 </li>
    //                 <li className="flex items-center justify-between font-semibold">
    //                   <span className="text-orange-900/80">Balance</span>
    //                   <span className="text-right text-orange-900/80">
    //                     KSH {total - totalPaid ?? "0.00"}
    //                   </span>
    //                 </li>
    //                 <Separator className="my-2" />
    //                 <Label>Select Customer</Label>
    //                 <CustomerComboBox
    //                   type="Customer"
    //                   data={customer}
    //                   setSelected={setSelectedCustomer}
    //                 />
    //               </ul>
    //             </div>
    //           </div>
    //           <DialogFooter>
    //             <Button onClick={() => setDialogOpen(false)}>Submit</Button>
    //           </DialogFooter>
    //         </DialogContent>
    //       </Dialog>
    //       {/* <DropdownMenu>
    //           <DropdownMenuTrigger asChild>
    //             <Button size="icon" variant="outline" className="h-8 w-8">
    //               <MoveVerticalIcon className="h-3.5 w-3.5" />
    //               <span className="sr-only">More</span>
    //             </Button>
    //           </DropdownMenuTrigger>
    //           <DropdownMenuContent align="end">
    //             <DropdownMenuItem>Pause</DropdownMenuItem>
    //             <DropdownMenuSeparator />
    //             <DropdownMenuItem>Trash</DropdownMenuItem>
    //           </DropdownMenuContent>
    //         </DropdownMenu> */}
    //     </div>
    //   </CardHeader>
    //   <CardContent className="p-6 text-sm">
    //     <div className="grid gap-3">
    //       <ul className="grid gap-3">
    //         <li className="flex items-center justify-between font-semibold">
    //           <span className="text-green-900/80">Paid</span>
    //           <span className="text-right">KSH {totalPaid ?? "0.00"}</span>
    //         </li>
    //         <li className="flex items-center justify-between font-semibold">
    //           <span className="text-orange-900/80">Balance</span>
    //           <span className="text-right text-orange-900/80">
    //             KSH {total - totalPaid ?? "0.00"}
    //           </span>
    //         </li>
    //       </ul>
    //     </div>
    //     <Separator className="my-4" />

    //     <div className="grid gap-3">
    //       <div className="font-semibold">Payment Details</div>
    //       {paymentCarts.map((cart, index) => (
    //         <ul key={index} className="grid gap-3">
    //           <li className="flex items-center ">
    //             <span className="font-medium text-gray-600">
    //               {cart.paymentType}
    //             </span>
    //           </li>
    //           {cart.payments.map((detail, index) => (
    //             <ul key={index} className="grid gap-3 font-normal">
    //               <li className="flex items-center justify-between">
    //                 <span className="text-muted-foreground">
    //                   {detail.TransID}
    //                 </span>
    //                 <span className="overflow-hidden text-clip text-center">
    //                   {detail.name}
    //                 </span>
    //                 <span className="text-right">{detail.TransAmount}</span>
    //                 <span className="text-right">
    //                   <XIcon
    //                     onClick={() =>
    //                       removeItemFromPayments(
    //                         cart.paymentType!,
    //                         detail.TransID,
    //                       )
    //                     }
    //                     className="h-3 w-3 cursor-pointer hover:h-4 hover:w-4"
    //                   />
    //                 </span>
    //               </li>
    //             </ul>
    //           ))}
    //         </ul>
    //       ))}

    //       {/* <ul className="grid gap-3">
    //           <li className="flex items-center justify-between">
    //             <span className="text-muted-foreground">MPESA</span>
    //             <span className="text-right">KSH {total ?? "0.00"}</span>
    //           </li>
    //           <li className="flex items-center justify-between">
    //             <span className="text-muted-foreground">CASH SALES</span>
    //             <span className="text-right">KSH {discount ?? "0.00"}</span>
    //           </li>

    //           <li className="flex items-center justify-between font-semibold">
    //             <span className="text-muted-foreground">Balance</span>

    //             <span>KSH {total + discount}</span>
    //           </li>
    //         </ul> */}
    //     </div>

    //     <Separator className="my-4" />
    //     <div className="grid gap-3">
    //       <div className="font-semibold">Cart Actions</div>
    //       <dl className="grid  gap-4">
    //         <div className="flex items-center ">
    //           <Button
    //             size="sm"
    //             variant="outline"
    //             className=" h-12 w-full justify-center gap-1 "
    //             onClick={() => handleProcessInvoice()}
    //           >
    //             <BookmarkCheckIcon className="h-4 w-4 text-left text-blue-800" />
    //             Process Transaction
    //           </Button>
    //         </div>

    //         <div className="flex items-center ">
    //           <Button
    //             size="sm"
    //             variant="outline"
    //             className=" h-12 w-full justify-center gap-1 "
    //             onClick={() => handleClearCart()}
    //           >
    //             <Trash2Icon className="h-4 w-4 text-left text-red-800" />
    //             <span className="text-center">Delete Transaction</span>
    //           </Button>
    //         </div>
    //         <div className="flex items-center ">
    //           <Button
    //             size="sm"
    //             variant="outline"
    //             className=" h-12 w-full   gap-1 "
    //             onClick={() => handleHoldCart()}
    //           >
    //             <PauseCircleIcon className="h-4 w-4 text-left text-green-800" />
    //             <span className=" text-center">Hold Transaction</span>
    //           </Button>
    //           {/* <span className="sr-only">More</span> */}
    //         </div>
    //       </dl>
    //     </div>
    //     {/* <Separator className="my-4" />
    //       <div className="grid gap-3">
    //         <div className="font-semibold">Payment Information</div>
    //         <dl className="grid gap-3">
    //           <div className="flex items-center justify-between">
    //             <dt className="flex items-center gap-1 text-muted-foreground">
    //               <CreditCardIcon className="h-4 w-4" />
    //               Visa
    //             </dt>
    //             <dd>**** **** **** 4532</dd>
    //           </div>
    //         </dl>
    //       </div> */}
    //   </CardContent>

    //   {/* <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
    //       <div className="text-xs text-muted-foreground">
    //         Updated <time dateTime="2023-11-23">November 23, 2023</time>
    //       </div>
    //       <Pagination className="ml-auto mr-0 w-auto">
    //         <PaginationContent>
    //           <PaginationItem>
    //             <Button size="icon" variant="outline" className="h-6 w-6">
    //               <ChevronLeftIcon className="h-3.5 w-3.5" />
    //               <span className="sr-only">Previous Order</span>
    //             </Button>
    //           </PaginationItem>
    //           <PaginationItem>
    //             <Button size="icon" variant="outline" className="h-6 w-6">
    //               <ChevronRightIcon className="h-3.5 w-3.5" />
    //               <span className="sr-only">Next Order</span>
    //             </Button>
    //           </PaginationItem>
    //         </PaginationContent>
    //       </Pagination>
    //     </CardFooter> */}
    // </Card>
    <div className="hidden min-h-[88vh] flex-col justify-between py-2 md:flex">
      <div className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card
          className={cn(
            "py-6",
            selectedCartItem
              ? "cursor-pointer bg-red-500"
              : "cursor-pointer hover:bg-accent focus:bg-accent",
          )}
          onClick={() => {
            if (selectedCartItem) {
              deleteItemFromCart(selectedCartItem);
            } else {
              toast.error("Please select an item to delete");
            }
          }}
        >
          <CardHeader className="flex-col items-center justify-center p-0 text-sm">
            <Trash2Icon
              className={cn(
                "h-8 w-8",
                selectedCartItem ? "text-white" : "text-zinc-400",
              )}
            />
            <h4
              className={cn(
                "text-center text-sm font-normal",
                selectedCartItem ? "text-white" : "text-zinc-400",
              )}
            >
              Delete
            </h4>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:bg-accent focus:bg-accent">
          <CardHeader className="flex-col items-center justify-center  p-2 ">
            <h6 className="self-start text-left text-xs font-semibold text-muted-foreground">
              F1
            </h6>
            <SearchIcon className="h-8 w-8 " />
            <h4 className="text-center text-sm font-normal">Search</h4>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:bg-accent focus:bg-accent">
          <CardHeader className="flex-col items-center justify-center  p-2 ">
            <h6 className="self-start text-left text-xs font-semibold text-muted-foreground">
              F4
            </h6>
            <ShoppingBasketIcon className="h-8 w-8 " />
            <h4 className="text-center text-sm font-normal">Edit</h4>
          </CardHeader>
        </Card>
        <Card
          className={cn(
            "",
            selectedCartItem
              ? "cursor-pointer bg-blue-500"
              : "hover:bg-accent focus:bg-accent",
          )}
        >
          <CardHeader className="flex-col items-center justify-center  p-2 ">
            <h6
              className={cn(
                "self-start text-left text-xs font-semibold",
                selectedCartItem ? "text-white" : "text-muted-foreground",
              )}
            >
              F2
            </h6>
            <PercentIcon
              className={cn(
                "h-8 w-8",
                selectedCartItem ? "text-white" : "text-zinc-400",
              )}
            />
            <h4
              className={cn(
                "text-center text-sm font-normal",
                selectedCartItem ? "text-white" : "text-zinc-400",
              )}
            >
              Discount
            </h4>
          </CardHeader>
        </Card>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card className="cursor-pointer hover:bg-accent focus:bg-accent">
          <CardHeader className="flex-col items-center justify-center  p-2 ">
            <h6 className="self-start text-left text-xs font-semibold text-muted-foreground">
              F8
            </h6>
            <CaptionsOffIcon className="h-8 w-8 " />
            <h4 className="text-center text-sm font-normal">Close Register</h4>
          </CardHeader>
        </Card>
        <Card
          className="cursor-pointer py-4 hover:bg-accent focus:bg-accent"
          onClick={() => handleClearCart()}
        >
          <CardHeader className="flex-col items-center justify-center  p-2 ">
            <XIcon className="h-8 w-8 " />
            <h4 className="text-center text-sm font-normal">
              Clear Transaction
            </h4>
          </CardHeader>
        </Card>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer py-2 hover:bg-accent focus:bg-accent">
              <CardHeader className="flex-col items-center justify-center  p-2 ">
                <User2Icon className="h-8 w-8 " />
                <h4 className="text-center text-sm font-normal">
                  {selectedCustomer
                    ? selectedCustomer.br_name
                    : "Select Customer"}
                </h4>
              </CardHeader>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Checkout</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <ul className="grid gap-3">
                  <li className="flex items-center justify-between font-semibold">
                    <span className="text-muted-foreground">Total</span>

                    <span>KSH {total + discount}</span>
                  </li>
                  <li className="flex items-center justify-between font-semibold">
                    <span className="text-green-900/80">Paid</span>
                    <span className="text-right">
                      KSH {totalPaid ?? "0.00"}
                    </span>
                  </li>
                  <li className="flex items-center justify-between font-semibold">
                    <span className="text-orange-900/80">Balance</span>
                    <span className="text-right text-orange-900/80">
                      KSH {total - totalPaid ?? "0.00"}
                    </span>
                  </li>
                  <Separator className="my-2" />
                  <Label>Select Customer</Label>
                  <CustomerComboBox
                    type="Customer"
                    data={customer}
                    setSelected={setSelectedCustomer}
                  />
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setDialogOpen(false)}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card className="cursor-pointer hover:bg-accent focus:bg-accent">
          <CardHeader className="flex-col items-center justify-center  p-2 ">
            <TimerIcon className="h-8 w-8 " />
            <h4 className="text-center text-sm font-normal">Paused Carts</h4>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent focus:bg-accent"
          onClick={() => handleHoldCart()}
        >
          <CardHeader className="flex-col items-center justify-center  p-2 ">
            <h6 className="self-start text-left text-xs font-semibold text-muted-foreground">
              F7
            </h6>
            <PauseIcon className="h-8 w-8 " />
            <h4 className="text-center text-sm font-normal">Pause Sale</h4>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:bg-accent focus:bg-accent">
          <CardHeader className="flex-col items-center justify-center  p-2 ">
            <h6 className="self-start text-left text-xs font-semibold text-muted-foreground">
              F8
            </h6>
            <LogOutIcon className="h-8 w-8 " />
            <h4 className="text-center text-sm font-normal">Logout</h4>
          </CardHeader>
        </Card>
        <Card
          className="flex-grow cursor-pointer   hover:bg-accent focus:bg-accent"
          onClick={() => sidebar?.setIsOpen()}
        >
          <CardHeader className="flex-col items-center justify-center  p-2 ">
            <h6 className="self-start text-left text-xs font-semibold text-muted-foreground">
              F9
            </h6>
            <EllipsisIcon className="h-8 w-8 " />
            <h4 className="text-center text-sm font-normal">Menu</h4>
          </CardHeader>
        </Card>
        <Card
          className="flex-grow cursor-pointer bg-green-800 text-white hover:bg-green-800/90 "
          onClick={() => handleProcessInvoice()}
        >
          <CardHeader className="flex-col items-center justify-center  p-2 ">
            <h6 className="self-start text-left text-xs font-semibold text-white">
              F8
            </h6>
            <SendIcon className="h-8 w-8 text-white " />
            <h4 className="text-center text-sm font-normal">Process Payment</h4>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceSummary;
