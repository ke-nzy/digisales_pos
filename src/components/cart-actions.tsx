"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  CaptionsOffIcon,
  EllipsisIcon,
  LogOutIcon,
  // CopyIcon,
  // MoveVerticalIcon,
  PauseIcon,
  PercentIcon,
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
  tallyTotalAmountPaid,
} from "~/lib/utils";
import { useCartStore } from "~/store/cart-store";
import { toast } from "sonner";
import { usePayStore } from "~/store/pay-store";
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
import { Input } from "./ui/input";
import {
  submit_authorization_request,
  submit_end_shift,
  submit_hold_direct_sale_request,
} from "~/lib/actions/user.actions";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { set } from "date-fns";

const CartActions = () => {
  const {
    currentCart,
    currentCustomer,
    clearCart,
    holdCart,
    selectedCartItem,
    update_cart_item,
    setSelectedCartItem,
    setCurrentCustomer,
    deleteItemFromCart,
  } = useCartStore();
  const sidebar = useStore(useSidebarToggle, (state) => state);
  const [isLoading, setIsLoading] = useState<boolean | null>(null);
  const { paymentCarts } = usePayStore();
  const { site_url, site_company, account, clear_auth_session } =
    useAuthStore();

  const [action, setAction] = useState<string>("");
  const [discountValue, setDiscountValue] = useState<string>("0");
  const [discountPercentage, setDiscountPercentage] = useState<string>("0");
  const [quantityValue, setQuantityValue] = useState<string>("0");
  const [authPass, setAuthPass] = useState<string>("");
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [discountDialogOpen, setDiscountDialogOpen] = useState<boolean>(false);
  const [quantityDialogOpen, setQuantityDialogOpen] = useState<boolean>(false);
  const [authorizationDialogOpen, setAuthorizationDialogOpen] =
    useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedCartItem(null);
        event.preventDefault(); // Optional: Prevents the default browser action for F1
      }
      if (event.key === "F2") {
        handleDiscountDialogOpen();
        event.preventDefault(); // Optional: Prevents the default browser action for F1
      }
      if (event.key === "F3") {
        handleQuantityDialogOpen();
        event.preventDefault(); // Optional: Prevents the default browser action for F1
      }
      if (event.key === "F4") {
        void handleCheckOut();
        event.preventDefault(); // Optional: Prevents the default browser action for F1
      }
      if (event.key === "F5") {
        handleClearCart();
        event.preventDefault(); // Optional: Prevents the default browser action for F1
      }
      if (event.key === "F6") {
        setDialogOpen(true);
        event.preventDefault(); // Optional: Prevents the default browser action for F1
      }
      if (event.key === "F7") {
        router.push("/transactions");
        event.preventDefault(); // Optional: Prevents the default browser action for F1
      }
      if (event.key === "F8") {
        () => handleHoldCart();
        event.preventDefault(); // Optional: Prevents the default browser action for F1
      }
      if (event.key === "F9") {
        handleLogout();
        event.preventDefault(); // Optional: Prevents the default browser action for F9
      }

      if (event.key === "F10") {
        router.push("/payments");
        event.preventDefault(); // Optional: Prevents the default browser action for F9
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const total = calculateCartTotal(currentCart!);
  const discount = calculateDiscount(currentCart!);
  const totalPaid = tallyTotalAmountPaid(paymentCarts);
  const router = useRouter();

  useEffect(() => {
    if (discountPercentage !== "") {
      if (Number(discountPercentage) < 0 || Number(discountPercentage) > 100) {
        toast.error("Please enter a valid percentage");
        return;
      }
      const val =
        (Number(discountPercentage) / 100) *
        selectedCartItem!.details.price *
        selectedCartItem!.quantity;
      setDiscountValue(val.toString());
    }
  }, [discountPercentage, selectedCartItem]);

  const handleLogout = () => {
    clear_auth_session();
    router.push("/sign-in");
  };
  const handleClearCart = () => {
    if (authorized) {
      clearCart();
      toast.success("Cart cleared successfully");
    } else {
      setAuthorizationDialogOpen(true);
    }
  };

  const handleHoldCart = async () => {
    if (isLoading) {
      return;
    }
    if (!currentCart) {
      toast.error("Please add items to cart");
      // setIsLoading(false);
      return;
    }
    if (!currentCustomer) {
      toast.error("Please select a customer");
      // setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await submit_hold_direct_sale_request(
        site_url!,
        site_company!.company_prefix,
        account!.id,
        account!.user_id,
        currentCart.items,
        currentCustomer,
        null,
        currentCustomer.br_name,
        currentCart.cart_id,
      );
      console.log("result", result);
      if (!result) {
        // sentry.captureException(result);
        toast.error("Hold  Action failed");
        setIsLoading(false);
        return;
      }

      // process receipt

      holdCart();
      toast.success("Cart held successfully");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const { customer } = useCustomers();

  const handleDeleteItem = () => {
    if (authorized) {
      if (selectedCartItem) {
        deleteItemFromCart(selectedCartItem);
      } else {
        toast.error("Please select an item to delete");
      }
    } else {
      setAuthorizationDialogOpen(true);
    }
  };

  const handleDiscountDialogOpen = () => {
    if (authorized) {
      if (selectedCartItem) {
        setDiscountDialogOpen(!discountDialogOpen);
      } else {
        setDiscountDialogOpen(false);
        toast.error("Please select an item to discount");
      }
    } else {
      if (selectedCartItem) {
        setAction("discount");
        setAuthorizationDialogOpen(true);
      } else {
        toast.error("Please select an item to discount");
      }
    }
  };
  const handleQuantityDialogOpen = () => {
    if (authorized) {
      if (selectedCartItem) {
        setQuantityDialogOpen(true);
      } else {
        setQuantityDialogOpen(false);
        toast.error("Please select an item to update");
      }
    } else {
      if (selectedCartItem) {
        setAction("edit_cart");
        setAuthorizationDialogOpen(true);
      } else {
        toast.error("Please select an item to update");
      }
    }
  };

  const handleIssueDiscount = () => {
    if (selectedCartItem) {
      if (discountValue === "") {
        toast.error("Please enter a discount value");
        return;
      }
      console.log("discountValue", discountValue);
      update_cart_item({
        ...selectedCartItem,
        discount: discountValue,
        item: {
          ...selectedCartItem.item,
          description: `${selectedCartItem.item.description} *`,
        },
      });
      console.log("selectedCartItem", currentCart);

      setDiscountValue("");
      setDiscountDialogOpen(false);
      setSelectedCartItem(null);
    }
  };

  const handleQuantityChange = () => {
    if (selectedCartItem) {
      if (Number(selectedCartItem.discount) > 0) {
        toast.error("Discounted items cannot be updated");
        return;
      }
      if (quantityValue === "" || Number(quantityValue) < 0) {
        toast.error("Please enter a valid quantity");
        return;
      }
      if (Number(quantityValue) > selectedCartItem.details.quantity_available) {
        toast.error("Quantity exceeds available quantity");
        return;
      }
      update_cart_item({
        ...selectedCartItem,
        quantity: Number(quantityValue),
      });

      setQuantityValue("");
      setQuantityDialogOpen(false);
      setSelectedCartItem(null);
      setAuthorized(false);
    }
  };

  const handleAuthorization = async () => {
    try {
      const auth = await submit_authorization_request(
        site_url!,
        site_company!.company_prefix,
        authPass,
        action,
      );
      if (auth) {
        setAuthorized(true);
        toast.success("Authorized");
      } else {
        setAuthorized(false);
        toast.error("Unauthorized to perform this action");
      }
    } catch (error) {
      toast.error("Authorization Failed: Something Went Wrong");
    } finally {
      setTimeout(() => {
        setAuthPass("");
        setAction("");
        setAuthorizationDialogOpen(false);
      }, 2000);
    }
  };

  const handleCheckOut = async () => {
    console.log("checkout");
    const shift = localStorage.getItem("start_shift");
    const s: CheckInResponse = JSON.parse(shift!);
    const response = await submit_end_shift(
      site_url!,
      site_company!.company_prefix,
      account!.id,
      s.id,
    );
    console.log(" checkout response", response);

    if (response) {
      localStorage.removeItem("start_shift");
      toast.success("Shift ended");
      router.push("/dashboard");
    } else {
      toast.error("Failed to End shift");
    }
  };

  // if (!currentCart) return null;

  return (
    <div className="hidden min-h-[88vh] flex-col justify-between py-2 md:flex">
      <div className=" grid w-full max-w-6xl gap-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        <Card
          className={cn(
            "rounded-none py-6",
            selectedCartItem
              ? "cursor-pointer bg-red-500"
              : "cursor-pointer hover:bg-accent focus:bg-accent",
          )}
          onClick={handleDeleteItem}
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
        <Card className="cursor-pointer rounded-none hover:bg-accent focus:bg-accent">
          <CardHeader className="flex-col items-center justify-center  p-2 ">
            <h6 className="self-start text-left text-xs font-semibold text-muted-foreground">
              F1
            </h6>
            <SearchIcon className="h-8 w-8 " />
            <h4 className="text-center text-sm font-normal">Search</h4>
          </CardHeader>
        </Card>
        <Dialog
          open={authorizationDialogOpen}
          onOpenChange={setAuthorizationDialogOpen}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Authorize</DialogTitle>
              <DialogDescription>Authorize cart actions</DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <ul className="grid gap-3">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="auth-cart-pass">Password</Label>
                    <Input
                      type="password"
                      id="auth-cart-pass"
                      placeholder={"Authorization Password"}
                      value={authPass}
                      onChange={(e) => setAuthPass(e.target.value)}
                    />
                  </div>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleAuthorization()}>Authorize</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog
          open={quantityDialogOpen}
          onOpenChange={handleQuantityDialogOpen}
        >
          <DialogTrigger asChild>
            <Card className="cursor-pointer rounded-none hover:bg-accent focus:bg-accent">
              <CardHeader className="flex-col items-center justify-center  p-2 ">
                <h6 className="self-start text-left text-xs font-semibold text-muted-foreground">
                  F2
                </h6>
                <ShoppingBasketIcon
                  className={cn(
                    "h-8 w-8",
                    selectedCartItem ? "text-zinc-700" : "text-zinc-400",
                  )}
                />
                <h4
                  className={cn(
                    "text-center text-sm font-normal",
                    selectedCartItem ? "text-zinc-700" : "text-zinc-400",
                  )}
                >
                  Edit
                </h4>
              </CardHeader>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Modify Cart</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <ul className="grid gap-3">
                  <li className="flex items-center justify-between font-semibold">
                    <span className="text-muted-foreground">Item Name</span>

                    <span>{selectedCartItem?.item.description}</span>
                  </li>

                  <Separator className="my-2" />
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="quantity">New Quantity</Label>
                    <Input
                      type="text"
                      id="quantity"
                      placeholder={"Update Item Quantity"}
                      value={quantityValue}
                      onChange={(e) => setQuantityValue(e.target.value)}
                    />
                  </div>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleQuantityChange()}>
                Update Cart
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog
          open={discountDialogOpen}
          onOpenChange={handleDiscountDialogOpen}
        >
          <DialogTrigger asChild>
            <Card
              className={cn(
                "rounded-none",
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
                  F3
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
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Item Discount</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <ul className="grid gap-3">
                  <li className="flex items-center justify-between font-semibold">
                    <span className="text-muted-foreground">Item Name</span>

                    <span>{selectedCartItem?.item.description}</span>
                  </li>

                  <Separator className="my-2" />
                  <Tabs defaultValue="value" className="w-[400px]">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="value">On Value</TabsTrigger>
                      <TabsTrigger value="percentage">
                        On Percentage
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="value">
                      <Card>
                        <CardHeader>
                          <CardDescription>
                            Enter amount to discount
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="discount">Discount</Label>
                            <Input
                              type="text"
                              id="discount"
                              placeholder={"0"}
                              value={discountValue}
                              onChange={(e) => setDiscountValue(e.target.value)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="percentage">
                      <Card>
                        <CardHeader>
                          <CardDescription>
                            Enter percentage to discount
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="discount">Discount</Label>
                            <Input
                              type="text"
                              id="discount"
                              placeholder={"0%"}
                              value={discountPercentage}
                              onChange={(e) =>
                                setDiscountPercentage(e.target.value)
                              }
                            />
                            <span className="text-sm text-muted-foreground">
                              Amounts to KES{" "}
                              {(Number(discountPercentage) / 100) *
                                selectedCartItem!.details.price *
                                selectedCartItem!.quantity}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </ul>
              </div>
            </div>
            <DialogFooter className=" ">
              <Button
                variant={"outline"}
                onClick={() => setDiscountDialogOpen(false)}
              >
                Close
              </Button>
              <Button onClick={() => handleIssueDiscount()}>
                Issue Discount
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className=" grid w-full max-w-6xl gap-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        <Card
          onClick={handleCheckOut}
          className="cursor-pointer rounded-none hover:bg-accent focus:bg-accent"
        >
          <CardHeader className="flex-col items-center justify-center  p-2 ">
            <h6 className="self-start text-left text-xs font-semibold text-muted-foreground">
              F4
            </h6>
            <CaptionsOffIcon className="h-8 w-8 " />
            <h4 className="text-center text-sm font-normal">End Shift</h4>
          </CardHeader>
        </Card>
        <Card
          className="cursor-pointer rounded-none hover:bg-accent focus:bg-accent"
          onClick={() => handleClearCart()}
        >
          <CardHeader className="flex-col items-center justify-center  p-2 ">
            <h6 className="self-start text-left text-xs font-semibold text-muted-foreground">
              F5
            </h6>
            <XIcon className="h-8 w-8 " />
            <h4 className="text-center text-sm font-normal">Clear Cart</h4>
          </CardHeader>
        </Card>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer rounded-none  hover:bg-accent focus:bg-accent">
              <CardHeader className="flex-col items-center justify-center  p-2 ">
                <h6 className="self-start text-left text-xs font-semibold text-muted-foreground">
                  F6
                </h6>
                <User2Icon className="h-8 w-8 " />
                <h4 className="text-center text-sm font-normal">
                  {currentCustomer
                    ? currentCustomer.br_name
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
                    setSelected={setCurrentCustomer}
                  />
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setDialogOpen(false)}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card
          className="cursor-pointer rounded-none hover:bg-accent focus:bg-accent"
          onClick={() => router.push("/transactions")}
        >
          <CardHeader className="flex-col items-center justify-center  p-2 ">
            <h6 className="self-start text-left text-xs font-semibold text-muted-foreground">
              F7
            </h6>
            <TimerIcon className="h-8 w-8 " />
            <h4 className="text-center text-sm font-normal">Paused Carts</h4>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer rounded-none hover:bg-accent focus:bg-accent"
          onClick={() => handleHoldCart()}
        >
          <CardHeader className="flex-col items-center justify-center  p-2 ">
            <h6 className="self-start text-left text-xs font-semibold text-muted-foreground">
              F8
            </h6>
            <PauseIcon className="h-8 w-8 " />
            <h4 className="text-center text-sm font-normal">Pause Sale</h4>
          </CardHeader>
        </Card>
        <Card
          className="cursor-pointer rounded-none hover:bg-accent focus:bg-accent"
          onClick={handleLogout}
        >
          <CardHeader className="flex-col items-center justify-center  p-2 ">
            <h6 className="self-start text-left text-xs font-semibold text-muted-foreground">
              F9
            </h6>
            <LogOutIcon className="h-8 w-8 " />
            <h4 className="text-center text-sm font-normal">Logout</h4>
          </CardHeader>
        </Card>
        <Card
          className="flex-grow cursor-pointer  rounded-none hover:bg-accent focus:bg-accent"
          onClick={() => sidebar?.setIsOpen()}
        >
          <CardHeader className="flex-col items-center justify-center  p-2 ">
            <h6 className="self-start py-1 text-left text-xs font-semibold text-muted-foreground"></h6>
            <EllipsisIcon className="h-8 w-8 " />
            <h4 className="text-center text-sm font-normal">Menu</h4>
          </CardHeader>
        </Card>
        <Card
          className="flex-grow cursor-pointer rounded-none bg-green-800 text-white hover:bg-green-800/90 "
          onClick={() => router.push("/payment")}
        >
          <CardHeader className="flex-col items-center justify-center  p-2 ">
            <h6 className="self-start text-left text-xs font-semibold text-white">
              F10
            </h6>
            <SendIcon className="h-8 w-8 text-white " />
            <h4 className="text-center text-sm font-normal">Process Payment</h4>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default CartActions;
