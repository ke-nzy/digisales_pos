"use client";
import React, { useState, useEffect } from "react";
import { getPaymentList } from "~/lib/payment-list";
import { Card, CardContent, CardDescription, CardHeader } from "../ui/card";
import { useManualPayments, useMpesaPayments } from "~/hooks/use-payments";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { DataTable } from "../data-table";
import { calculateCartTotal, calculateDiscount, paymentColumns, tallyTotalAmountPaid } from "~/lib/utils";
import { usePayStore } from "~/store/pay-store";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Loader2, SearchCodeIcon } from "lucide-react";
import { lookup_mpesa_payment } from "~/lib/actions/pay.actions";
import { useAuthStore } from "~/store/auth-store";
import { toast } from "sonner";
import { removeSpecialCharacters } from "../../lib/utils";
import { Skeleton } from "../ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { useCartStore } from "~/store/cart-store";

interface PaymentProps {
  item: Payment;
  paymentType: string;
}

const PaymentOptions = ({
  amount,
  setAmount,
}: {
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { site_url, site_company, account } = useAuthStore();
  const { manualPayments } = useManualPayments();
  const {
    mpesaPayments,
    loading: loadingMpesaPayments,
    refetch: refetchMpesaPayments,
  } = useMpesaPayments();
  const {
    paymentCarts,
    validateAndAddPayment,
    showAmountAlert,
    pendingPayment,
    confirmPendingPayment,
    cancelPendingPayment,
  } = usePayStore();
  const [paid, setPaid] = useState<ManualBankPaymentAccount | null>(null);
  const [pName, setPName] = useState<string>("");
  const [transactionNumber, setTransactionNumber] = useState<string>("");
  const [amnt, setAmnt] = useState<string>(amount);
  const [lookupRef, setLookupRef] = useState<string>("");
  const [mpesaDialogOpen, setMpesaDialogOpen] = React.useState<boolean>(false);
  const [manualDialogOpen, setManualDialogOpen] =
    React.useState<boolean>(false);
  const [transactionFoundDialog, setTransactionFoundDialog] =
    useState<boolean>(false);
  const [foundTransaction, setFoundTransaction] = useState<Payment | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (loadingMpesaPayments) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [loadingMpesaPayments]);

  const { currentCart } = useCartStore();
  const total = currentCart ? calculateCartTotal(currentCart) : 0;
  const discount = currentCart ? calculateDiscount(currentCart) : 0;

  // Calculate total amount already paid
  const totalPaid = tallyTotalAmountPaid(paymentCarts);

  // Calculate remaining balance
  const balance = total - discount - totalPaid;

  const handleMpesaRowClick = (rowData: Payment) => {
    validateAndAddPayment({
      item: rowData,
      paymentType: "MPESA",
      balance
    });
    if (!showAmountAlert) {
      setAmount("");
      setMpesaDialogOpen(false);
    }
  };

  const handleMpesaLookup = async () => {
    setIsLoading(true);
    let found = false;

    const timeout = setTimeout(() => {
      if (!found) {
        toast.error("Transaction not found. Please try again.");
        setIsLoading(false);
      }
    }, 10000);

    try {
      const res = await lookup_mpesa_payment(
        lookupRef,
        site_url!,
        site_company!.company_prefix,
        account!.id,
        "7451193",
      );

      if (res) {
        if ((res as LookUpResponse).result === "Failed") {
          toast.error((res as LookUpResponse).message);
        } else {
          console.log("We have found ", res);
          setFoundTransaction(res as Payment);
          setTransactionFoundDialog(true);
          found = true;
        }
      }
    } catch (error) {
      console.error("Error looking up M-Pesa transaction:", error);
      toast.error("An error occurred during the lookup. Please try again.");
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (ttp: string) => {
    if (!amnt || amnt.trim() === "" || parseFloat(amnt) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!ttp.includes("CASH")) {
      if (!transactionNumber || transactionNumber.trim() === "") {
        toast.error("Please enter a transaction number");
        return;
      }

      if (!pName || pName.trim() === "") {
        toast.error("Please enter the payer's name");
        return;
      }
    }

    const payment = {
      Auto: transactionNumber,
      name: removeSpecialCharacters(pName),
      TransAmount: amnt,
      TransID: transactionNumber,
      TransTime: Date.now(),
    };

    validateAndAddPayment({
      item: payment,
      paymentType: ttp,
      balance
    });
    if (!showAmountAlert) {
      setAmnt("");
      setAmount("");
      setTransactionNumber("");
      setPName("");
      setManualDialogOpen(false);
    }
  };


  const handleTransactionFound = () => {
    if (!foundTransaction) {
      toast.error("No transaction details found");
      return;
    }
  
    validateAndAddPayment({
      item: foundTransaction,
      paymentType: "MPESA",
      balance
    });
    if (!showAmountAlert) {
      setAmount("");
      setMpesaDialogOpen(false);
      setLookupRef("");
      setTransactionFoundDialog(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-md grid-cols-1 gap-4">
      {getPaymentList().map((paymentOption) => (
        <Dialog
          open={mpesaDialogOpen}
          onOpenChange={
            paymentOption.id === "mpesa"
              ? setMpesaDialogOpen
              : () => {
                setMpesaDialogOpen(false);
                setLookupRef("");
              }
          }
          key={paymentOption.id}
        >
          <DialogTrigger>
            <Card className="cursor-pointer hover:bg-accent focus:bg-green-500 focus:text-white ">
              <CardHeader className="flex-col items-center justify-center  p-2 ">
                <h6 className="self-start text-left text-xs font-semibold text-muted-foreground"></h6>
                {/* <span className="h-8 w-8 ">{paymentOption.icon}</span> */}
                <h4 className="text-center text-sm font-normal">
                  {paymentOption.title}
                </h4>
              </CardHeader>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{paymentOption.title}</DialogTitle>
              <DialogDescription>
                Select a payment to that matches {amount}.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="all">
              <div className="flex items-center">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="manual">Lookup</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="all">
                <Card>
                  <CardHeader>
                    <CardDescription>
                      Search using amount or customer name to find payment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="no-scrollbar max-h-[200px] overflow-y-auto">
                    {isLoading ? (
                      <div className="flex flex-col space-y-3">
                        <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ) : (
                      <DataTable
                        columns={paymentColumns}
                        filCol="TransAmount"
                        data={mpesaPayments}
                        onRowClick={handleMpesaRowClick}
                        searchKey={amount}
                        onRefetch={refetchMpesaPayments}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="manual">
                <Card>
                  <CardHeader>
                    <CardDescription>
                      Search using reference number to find payment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="no-scrollbar max-h-[200px] overflow-y-auto">
                    <div className="flex flex-col items-center space-y-2 py-4">
                      <Input
                        value={lookupRef}
                        onChange={(e) => setLookupRef(e.target.value)}
                      />
                      <div className="flex w-full justify-end *:flex-row">
                        <Button
                          disabled={lookupRef === "" || isLoading}
                          onClick={() => handleMpesaLookup()}
                        >
                          {isLoading ? (
                            <>
                              <span className="mr-1">Looking </span>
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </>
                          ) : (
                            <>
                              <SearchCodeIcon className="h-4 w-4" /> Lookup
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      ))}
      {manualPayments.length > 0 &&
        manualPayments.map((payment, index) => (
          // <Dialog
          //   open={manualDialogOpen}
          //   onOpenChange={setManualDialogOpen}
          //   key={index}
          // >
          // <DialogTrigger>
          <Card
            key={index}
            onClick={() => {
              setManualDialogOpen(true);
              setPaid(payment);
            }}
            className="cursor-pointer hover:bg-accent focus:bg-accent"
          >
            <CardHeader className="flex-col items-center justify-center  p-2 ">
              <h6 className="self-start text-left text-xs font-semibold text-muted-foreground"></h6>
              {/* <span className="h-8 w-8 ">{paymentOption.icon}</span> */}
              <h4 className="text-center text-sm font-normal">
                {payment.bank_account_name}
              </h4>
            </CardHeader>
          </Card>
          // </DialogTrigger>

          // </Dialog>
        ))}

      <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{paid?.bank_account_name}</DialogTitle>
            <DialogDescription>
              Add a payment to that matches {amount}.
            </DialogDescription>
          </DialogHeader>
          <Card>
            <CardHeader>
              <CardDescription>Enter Amount Matching {amount}</CardDescription>
            </CardHeader>
            <CardContent className="no-scrollbar max-h-[400px] overflow-y-auto">
              <div className="flex flex-col justify-evenly space-y-4">
                {paid?.ttp.includes("CASH") ? (
                  <></>
                ) : (
                  <div className="flex flex-col justify-evenly space-y-4">
                    <Label> Paid By</Label>
                    <Input
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                    />
                    <Label>Transaction Number</Label>
                    <Input
                      value={transactionNumber}
                      onChange={(e) => setTransactionNumber(e.target.value)}
                    />
                  </div>
                )}

                <Label>Amount</Label>
                <Input
                  type="number"
                  min={1}
                  value={amnt}
                  onChange={(e) => setAmnt(e.target.value)}
                />
              </div>
              <div className="flex flex-row items-center justify-end gap-2 p-4">
                <Button
                  variant={"default"}
                  size={"default"}
                  disabled={paid === null}
                  onClick={() => handleManualSubmit(paid ? paid.ttp : "")}
                >
                  Add Payment
                </Button>
              </div>
              {/* <Input>
                 </Input> */}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
      <Dialog
        open={transactionFoundDialog}
        onOpenChange={setTransactionFoundDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle> Transaction Found</DialogTitle>
            <DialogDescription>
              Do you want to proceed with this transaction?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="justify-between">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                No
              </Button>
            </DialogClose>
            <Button variant="default" onClick={handleTransactionFound}>
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showAmountAlert}
        onOpenChange={(open) => {
          if (!open) {
            cancelPendingPayment();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Higher Amount Warning</AlertDialogTitle>
            <AlertDialogDescription>
              The payment amount (KES {pendingPayment?.item.TransAmount}) is higher than the remaining balance (KES {pendingPayment?.requiredAmount}). Do you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelPendingPayment}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              confirmPendingPayment();
              setAmount("");
              setMpesaDialogOpen(false);
              setManualDialogOpen(false);
              setTransactionFoundDialog(false);
              toast.success("Payment added successfully");
            }}>
              Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default PaymentOptions;
