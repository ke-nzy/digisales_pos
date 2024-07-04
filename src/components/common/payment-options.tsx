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
} from "../ui/dialog";
import { DataTable } from "../data-table";
import { paymentColumns } from "~/lib/utils";
import { usePayStore } from "~/store/pay-store";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { set } from "date-fns";

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
  const { manualPayments } = useManualPayments();
  const { mpesaPayments } = useMpesaPayments();
  const { addItemToPayments } = usePayStore();
  const [paid, setPaid] = useState<ManualBankPaymentAccount | null>(null);
  const [pName, setPName] = useState<string>("");
  const [transactionNumber, setTransactionNumber] = useState<string>("");
  const [amnt, setAmnt] = useState<string>(amount);
  const [mpesaDialogOpen, setMpesaDialogOpen] = React.useState<boolean>(false);
  const [manualDialogOpen, setManualDialogOpen] =
    React.useState<boolean>(false);

  const handleMpesaRowClick = (rowData: Payment) => {
    const paymentType = "MPESA"; // Extract the payment type from the data table
    addItemToPayments(rowData, paymentType);
    setAmount("");
    setMpesaDialogOpen(false);
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
            <Card>
              <CardHeader>
                <CardDescription>
                  Search using amount or customer name to find payment
                </CardDescription>
              </CardHeader>
              <CardContent className="no-scrollbar max-h-[200px] overflow-y-auto">
                <DataTable
                  columns={paymentColumns}
                  filCol="name"
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
                  Submit
                </Button>
              </div>
              {/* <Input>
                 </Input> */}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentOptions;
