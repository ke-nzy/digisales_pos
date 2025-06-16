"use client";
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "~/components/common/dashboard-layout";
import { fetch_pos_transactions_report } from "~/lib/actions/user.actions";

import { useAuthStore } from "~/store/auth-store";
import { toDate } from "~/lib/utils";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import { Separator } from "~/components/ui/separator";
import { Banknote, PrinterIcon, ShoppingCartIcon } from "lucide-react";
import { Card, CardHeader } from "~/components/ui/card";
import { useRouter } from "next/navigation";
import { usePayStore } from "~/store/pay-store";
import EnhancedTransactionReceiptPDF from "~/hawk-tuah/components/enhancedReceiptPdf";

// Transform TransactionReportItem to SalesReceiptInformation format
const transformToReceiptFormat = (trans: TransactionReportItem): SalesReceiptInformation => {
  return {
    "0": {
      id: trans.id,
      rcp_no: trans.rcp_no,
      ptype: trans.ptype,
      ptotal: trans.ptotal,
      payments: trans.payments,
      pitems: trans.pitems,
      cp: trans.cp || "0_",
      uname: trans.uname,
      uid: trans.uid,
      pdate: trans.pdate,
      print: trans.print || "1",
      customername: trans.customername,
      customerid: trans.customerid,
      booking: trans.booking || "1",
      dispatch: trans.dispatch || "0",
      salepersonId: trans.salepersonId || "0",
      salepersonName: trans.salepersonName || "",
      unique_identifier: trans.unique_identifier,
      cycle_id: trans.cycle_id,
      branch_code: trans.branch_code,
      shift_no: trans.shift_no,
      vat_amount: trans.vat_amount,
      pin: trans.pin || "-",
      offline: trans.offline || "0",
      trans_time: trans.trans_time,
      discount_summary: trans.discount_summary,
      status: trans.status || "1",
      branch_name: trans.branch_name
    },
    message: "Success",
    invNo: trans.rcp_no,
    delNo: trans.rcp_no,
    vat: parseFloat(trans.vat_amount || "0"),
    ttpAuto: null,
    weight: 0,
    posSaleInsertId: parseInt(trans.id),
    qrCode: "",
    qrDate: "",
    controlCode: "",
    middlewareInvoiceNumber: ""
  };
};

const Paid = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const { site_company, site_url, account, receipt_info } = useAuthStore();
  const { paidStatus, setPaidStatus } = usePayStore();
  const [trans, setTrans] = React.useState<
    TransactionReportItem | null | undefined
  >(null);
  const tr = localStorage.getItem("transaction_history");
  const transaction = tr ? JSON.parse(tr) : null;
  const router = useRouter();
  const handleFetchLatestTransaction = async () => {
    console.log("handleFetchLatestTransaction");

    const pos_transactions_report = await fetch_pos_transactions_report(
      site_company!,
      account!,
      site_url!,
      toDate(new Date()),
      toDate(new Date()),
    );
    if (!pos_transactions_report) {
      setTrans(null);
      return null;
    } else {
      setTrans(pos_transactions_report[0]);
      return pos_transactions_report[0];
    }
  };

  console.log("Transaction history data: ", trans);

  const parseTransactionDetails = (trans: TransactionReportItem | null | undefined): Payment[] => {
    try {
      if (!trans?.payments) {
        return [];
      }

      const payments = JSON.parse(trans.payments) as Payment[];
      return Array.isArray(payments) ? payments : [];
    } catch (error) {
      console.error('Error parsing transaction payments:', error);
      return [];
    }
  };

  const transactionDetails = parseTransactionDetails(trans);

  // console.log("Transaction details: ", transactionDetails);


  const handlePrint = async (data: TransactionReportItem | SalesReceiptInformation) => {
    try {
      console.log("handlePrint", data);

      // If we're navigating away, save the print data and return
      if (isNavigating) {
        localStorage.setItem('pending_print', JSON.stringify(data));
        window.location.href = '/';
        return;
      }

      // Transform data to correct format if needed
      let receiptData: SalesReceiptInformation;
      if ('0' in data) {
        // Already in correct format (from localStorage)
        receiptData = data as SalesReceiptInformation;
      } else {
        // Transform API data to correct format
        receiptData = transformToReceiptFormat(data as TransactionReportItem);
      }

      const pdfBlob = await pdf(
        <EnhancedTransactionReceiptPDF
          data={receiptData}
          receipt_info={receipt_info!}
          account={account!}
          duplicate={true}
        />
      ).toBlob();

      const url = URL.createObjectURL(pdfBlob);
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      return new Promise<void>((resolve, reject) => {
        iframe.onload = () => {
          const cleanup = () => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
              URL.revokeObjectURL(url);
              console.log("Print cleanup completed");
            }
          };

          try {
            iframe.style.position = "fixed";
            iframe.style.display = "block";
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.zIndex = "1000";

            iframe.focus();
            iframe.contentWindow!.print();

            const printTimeout = setTimeout(() => {
              cleanup();
              console.log("Print preview closed after timeout");
            }, 60000);

            iframe.contentWindow!.onafterprint = () => {
              clearTimeout(printTimeout);
              cleanup();
              resolve();
            };
          } catch (err) {
            cleanup();
            reject(err);
          }
        };

        iframe.src = url;
      });
    } catch (error) {
      console.error("Failed to print document:", error);
      toast.error("Failed to print document");
      throw error;
    }
  };

  // Add this effect to handle pending prints
  useEffect(() => {
    const pendingPrint = localStorage.getItem('pending_print');
    if (pendingPrint) {
      try {
        // Parse and cast as TransactionReportItem
        const printData = JSON.parse(pendingPrint) as TransactionReportItem;

        // Optional: Validate the structure of printData if necessary
        if (isValidTransactionReportItem(printData)) {
          handlePrint(printData).catch(console.error);
        } else {
          console.error("Invalid data structure for TransactionReportItem:", printData);
        }
      } catch (error) {
        console.error("Error parsing pending print data:", error);
      } finally {
        // Clear pending print from localStorage
        localStorage.removeItem('pending_print');
      }
    }
  }, []);

  // Helper function to validate the TransactionReportItem structure
  function isValidTransactionReportItem(data: any): data is TransactionReportItem {
    return (
      data && typeof data === 'object' &&
      'property1' in data && // Replace with actual properties of TransactionReportItem
      'property2' in data // Continue adding property checks as needed
    );
  }
  // Run once on component mount

  // Update your navigation handler
  const handleNewSale = () => {
    setIsNavigating(true);
    setPaidStatus(false);
    window.location.href = '/'; // Use window.location instead of router.push
  };

  // Update your Card click handler
  const triggerPrint = async () => {
    console.log("triggerPrint");
    if (isNavigating) {
      const printData = transaction || trans;
      if (printData) {
        localStorage.setItem('pending_print', JSON.stringify(printData));
        window.location.href = '/';
      }
      return;
    }

    // Prefer localStorage data (already in correct format)
    if (transaction) {
      await handlePrint(transaction);
    } else if (trans) {
      await handlePrint(trans);
    }
  };

  useEffect(() => {
    handleFetchLatestTransaction().catch((error) => {
      console.error("Failed to fetch transactions:", error);
      toast.error("Failed to fetch transactions");
    });
  }, []);

  useEffect(() => {
    // if (paidStatus) {
    //   setTimeout(() => {
    //     setPaidStatus(false);
    //     router.push("/");
    //   }, 10000);
    // }
    // if (!paidStatus) {
    //   router.push("/");
    // }
    console.log("paidStatus", paidStatus);
  }, [paidStatus]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "n" || event.key === "N") {
        console.log("keydown", "n");

        event.preventDefault(); // Optional: Prevents the default browser action for F1
        setPaidStatus(false);
        router.push("/");
      }
      if (event.key === "p" || event.key === "P") {
        console.log("keydown", "p");
        void triggerPrint();
      }
    };

    // window.addEventListener("keypress", () => console.log("keypress"));
    // window.addEventListener("keyup", () => console.log("keyup"));
    // window.addEventListener("keydown", () => console.log("keydown"));

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const items: TransactionInvItem[] = JSON.parse(trans?.pitems || "[]");
  const payments: Payment[] = JSON.parse(trans?.payments || "[]");
  const discount = items.reduce((acc, item) => {
    return acc + parseInt(item.discount || "0");
  }, 0);
  const quantity = items.reduce((acc, item) => {
    return acc + parseInt(item.quantity || "0");
  }, 0);
  const paid = payments.reduce((acc, pymnt) => {
    return acc + Number(pymnt.TransAmount);
  }, 0);
  const balance = payments.reduce((acc, pymnt) => {
    return acc + Number(pymnt.balance || 0);
  }, 0);
  return (
    <DashboardLayout title={"Payment Received"}>
      <div className="flex h-full gap-12 max-lg:gap-4 max-sm:flex-col">
        <div className="border border-zinc-400 sm:sticky sm:top-0 sm:h-screen sm:min-w-[300px] lg:min-w-[370px]">
          <div className="relative h-full">
            <div className="no-scrollbar px-4 py-8 sm:h-[calc(100vh-60px)] sm:overflow-auto">
              <div className="space-y-2">
                {items.length > 0 &&
                  items.map((x) => (
                    <div
                      key={x.item_option_id}
                      className=" flex flex-col items-start gap-1"
                    >
                      <p className="text-xs">{x.item_option}</p>
                      <span className="flex flex-row items-center justify-between space-x-4 text-xs font-bold">
                        <p>
                          {x.quantity} x KES {x.price}
                        </p>
                        <p>
                          KES{" "}
                          {(parseInt(x.quantity) * parseFloat(x.price)).toFixed(
                            2,
                          )}
                        </p>
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className=" w-full bg-white p-4 md:absolute md:bottom-0 md:left-0">
            <span className="flex flex-row flex-wrap items-center justify-between space-x-4 text-sm font-bold">
              <p>SubTotal</p>
              <p>{trans?.ptotal}</p>
            </span>
            <span className="flex flex-row flex-wrap items-center justify-between space-x-4 text-sm font-bold">
              <p>Discount</p>
              <p>{discount}</p>
            </span>
            <span className="flex flex-row flex-wrap items-center justify-between space-x-4 text-sm font-bold">
              <p>Item Count</p>
              <p>{quantity}</p>
            </span>
            <div className="my-2 rounded-lg border border-dashed border-zinc-400 " />
            <span className="flex flex-row flex-wrap items-center justify-between space-x-4 text-sm font-bold">
              <p>Total</p>
              <p>{trans?.ptotal}</p>
            </span>
            <p className="text-sm text-muted-foreground">Paid </p>
            <Separator />

            {payments.length > 0 &&
              payments.map((x) => (
                <span
                  key={x.TransTime}
                  className="flex flex-row flex-wrap  items-center justify-between space-x-4  text-xs font-bold"
                >
                  <p>{x.Transtype}</p>
                  <p>{x.TransAmount}</p>
                </span>
              ))}

            <Separator />
            <span className="flex flex-row items-center justify-between space-x-4 text-sm font-bold">
              <p>Total Paid</p>
              <p>KES {paid}</p>
            </span>
          </div>
        </div>
        <div className="sticky top-0 h-max w-full max-w-4xl rounded-md px-4 py-8">
          <div className="flex flex-col items-start justify-center  py-4">
            <p className=" p-2 font-light">Action</p>
            <Separator />
          </div>
          <div className="flex h-full flex-col items-start justify-between p-6">
            <div className="flex min-h-56 w-full flex-row items-center justify-center">
              <span>
                <Banknote className=" h-16 w-16 text-black" />
              </span>
              <span className="ml-2 flex flex-row text-lg  font-medium">
                Change:
                <p className="text-xl font-semibold text-green-700">
                  KES {transactionDetails[0]?.balance || "0"}
                </p>
              </span>
            </div>
            <div className="w-full flex-grow flex-col items-center justify-between p-6">
              <h6 className="text-center text-xl font-light">
                Would you like to print this receipt again?
              </h6>
              {/* <div className="flex flex-row justify-center space-x-3  p-4">
                <Button>Reprint</Button>
                <Button>New Sale</Button>
              </div> */}
              <div className="grid w-full max-w-6xl gap-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                <Card
                  className="cursor-pointer rounded-none hover:bg-accent focus:bg-accent"
                  onClick={() => triggerPrint()}
                >
                  <CardHeader className="flex-col items-center justify-center p-2 ">
                    <h6 className="self-start text-left text-sm font-semibold text-muted-foreground">
                      P
                    </h6>
                    <PrinterIcon className="h-8 w-8 " />
                    <h4 className="text-center text-sm font-normal">Reprint</h4>
                  </CardHeader>
                </Card>
                <Card
                  className="cursor-pointer rounded-none hover:bg-accent focus:bg-accent"
                  onClick={handleNewSale}
                >
                  <CardHeader className="flex-col items-center justify-center  p-2 ">
                    <h6 className="self-start text-left text-sm font-semibold text-muted-foreground">
                      N
                    </h6>
                    <ShoppingCartIcon className="h-8 w-8 " />
                    <h4 className="text-center text-sm font-normal">
                      New Sale
                    </h4>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Paid;
