"use client";
import React from "react";
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
} from "../ui/dialog";
import { DataTable } from "../data-table";
import { paymentColumns } from "~/lib/utils";
import { usePayStore } from "~/store/pay-store";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

const PaymentOptions = ({ amount }: { amount: string }) => {
  const { manualPayments } = useManualPayments();
  const { mpesaPayments } = useMpesaPayments();
  const { addItemToPayments } = usePayStore();
  const [mpesaDialogOpen, setMpesaDialogOpen] = React.useState<boolean>(false);
  const [manualDialogOpen, setManualDialogOpen] =
    React.useState<boolean>(false);

  const handleMpesaRowClick = (rowData: Payment) => {
    const paymentType = "MPESA"; // Extract the payment type from the data table
    addItemToPayments(rowData, paymentType);
    setMpesaDialogOpen(false);
  };
  return (
    <div className="mx-auto grid w-full max-w-md grid-cols-1 gap-4">
      {getPaymentList().map((paymentOption) => (
        <Dialog
          open={mpesaDialogOpen}
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
                <h6 className="self-start text-left text-xs font-semibold text-muted-foreground">
                  F8
                </h6>
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
          </DialogContent>
        </Dialog>
      ))}
      {manualPayments.length > 0 &&
        manualPayments.map((payment) => (
          <Dialog
            open={manualDialogOpen}
            onOpenChange={setManualDialogOpen}
            key={payment.ttp}
          >
            <DialogTrigger>
              <Card
                key={payment.ttp}
                className="cursor-pointer hover:bg-accent focus:bg-accent"
              >
                <CardHeader className="flex-col items-center justify-center  p-2 ">
                  <h6 className="self-start text-left text-xs font-semibold text-muted-foreground">
                    F8
                  </h6>
                  {/* <span className="h-8 w-8 ">{paymentOption.icon}</span> */}
                  <h4 className="text-center text-sm font-normal">
                    {payment.bank_account_name}
                  </h4>
                </CardHeader>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{payment.bank_account_name}</DialogTitle>
                <DialogDescription>
                  Add a payment to that matches {amount}.
                </DialogDescription>
              </DialogHeader>
              <Card>
                <CardHeader>
                  <CardDescription>
                    Enter Amount Matching {amount}
                  </CardDescription>
                </CardHeader>
                <CardContent className="no-scrollbar max-h-[200px] overflow-y-auto">
                  <Label>Transaction Number</Label>
                  {/* <Input>
                 </Input> */}
                </CardContent>
              </Card>
            </DialogContent>
          </Dialog>
        ))}
    </div>
  );
};

export default PaymentOptions;
