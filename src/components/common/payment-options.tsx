"use client";
import React, { useState } from "react";
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
import { paymentColumns } from "~/lib/utils";
import { usePayStore } from "~/store/pay-store";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Loader2, SearchCodeIcon } from "lucide-react";
import { lookup_mpesa_payment } from "~/lib/actions/pay.actions";
import { useAuthStore } from "~/store/auth-store";
import { toast } from "sonner";

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
  const { mpesaPayments } = useMpesaPayments();
  const { addItemToPayments } = usePayStore();
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

  const handleMpesaRowClick = (rowData: Payment) => {
    const paymentType = "MPESA"; // Extract the payment type from the data table
    addItemToPayments(rowData, paymentType);
    setAmount("");
    setMpesaDialogOpen(false);
  };

  const handleMpesaLookup = async () => {
    setIsLoading(true);
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
        setIsLoading(false);
        return;
      } else {
        console.log("We have found ", res);
        setFoundTransaction(res as Payment);
        setTransactionFoundDialog(true);
        setIsLoading(false);
        return;
      }
    }
  };

  const handleManualSubmit = (ttp: string) => {
    const paid: PaymentProps = {
      item: {
        Auto: transactionNumber,
        name: pName,
        TransAmount: amnt,
        TransID: transactionNumber,
        TransTime: Date.now(),
      },
      paymentType: ttp,
    };
    addItemToPayments(paid.item, paid.paymentType);
    setAmount("");
    setManualDialogOpen(false);
  };

  const handleTransactionFound = () => {
    addItemToPayments(foundTransaction!, "MPESA");
    setAmount("");
    setMpesaDialogOpen(false);
    setLookupRef("");
    setTransactionFoundDialog(false);
  };
  return (
    <div className="mx-auto grid w-full max-w-md grid-cols-1 gap-4">
      {getPaymentList().map((paymentOption) => (
        <Dialog
          open={mpesaDialogOpen || isLoading}
          onOpenChange={
            paymentOption.id === "mpesa"
              ? setMpesaDialogOpen
              : () => setMpesaDialogOpen(false)
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
                    <DataTable
                      columns={paymentColumns}
                      filCol="TransAmount"
                      data={mpesaPayments}
                      onRowClick={handleMpesaRowClick}
                      searchKey={amount}
                    />
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
                <Input value={amnt} onChange={(e) => setAmnt(e.target.value)} />
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
    </div>
  );
};

export default PaymentOptions;
