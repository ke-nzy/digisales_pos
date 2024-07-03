import React from "react";
import {
  Document,
  Page,
  Text,
  Image,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import QrCode from "qrcode";

import { calculateSubtotalAndDiscount } from "~/lib/utils";
Font.register({
  family: "Courier Prime",
  src: "http://fonts.gstatic.com/s/raleway/v11/bIcY3_3JNqUVRAQQRNVteQ.ttf",
});
const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 4,
  },

  company_section: {
    marginBottom: 5,
    marginTop: 10,
    textAlign: "left",
    fontFamily: "Courier Prime",
  },
  customer_section: {
    marginBottom: 5,
    textAlign: "left",
    fontFamily: "Courier Prime",
  },
  header: {
    fontSize: 8,
    marginBottom: 5,
    fontFamily: "Courier Prime",
  },
  text: {
    fontSize: 3.0,
  },
  table: {
    display: "flex",
    flexDirection: "column",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "35rem",
  },
  tableCol: {
    width: "40rem",
    borderStyle: "solid",
  },
  tableCell: {
    margin: 5,
    fontSize: 7,
    fontFamily: "Courier Prime",
  },
  table_col: {
    paddingHorizontal: 1,
    borderTopColor: "#000",
    borderTopWidth: 0.5,
    padding: 1,
    borderRightWidth: 0.5,
    borderRightColor: "#000",
  },
  table_col_last_row: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#000",
  },
});

const TransactionReceiptPDF = ({
  data,
  receipt_info,
  account,
  duplicate,
}: {
  data: TransactionReportItem;
  receipt_info: CompanyReceiptInfo;
  account: UserAccountInfo;
  duplicate: boolean;
}) => {
  const items: TransactionInvItem[] =
    data.pitems.length > 0 ? JSON.parse(data.pitems) : [];
  const payments: Payment[] =
    data.payments.length > 0 ? JSON.parse(data.payments) : [];

  function get_printout_size(length: number): [number, number] {
    return [80, 140 + length * 14];
  }

  const calculateTotalQuantity = (items: TransactionInvItem[]): number => {
    return items.reduce((total, item) => total + parseFloat(item.quantity), 0);
  };
  const totalDiscount = calculateSubtotalAndDiscount(data);
  const totalQuantity = calculateTotalQuantity(items);
  const kra_code = async () =>
    await QrCode.toDataURL(data.qrCode ?? "Digisales No KRA");
  return (
    <Document>
      <Page
        size={get_printout_size(items.length + payments.length)}
        style={{ padding: 2 }}
      >
        <View>
          <View
            style={{
              paddingVertical: 4,
              alignItems: "center",
            }}
          >
            <Text
              style={[styles.text, { fontWeight: "bold", marginBottom: 4 }]}
            >
              {`${receipt_info.name}`}
            </Text>
            <Text
              style={[styles.text, { fontWeight: "bold", marginBottom: 1 }]}
            >
              {`Email: ${receipt_info.email}`}:
            </Text>
            <Text
              style={[styles.text, { fontWeight: "bold", marginBottom: 1 }]}
            >
              {`Phone Number: ${receipt_info.phone_number}`}
            </Text>
            <Text
              style={[styles.text, { fontWeight: "bold", marginBottom: 1 }]}
            >
              {`KRA Pin: ${receipt_info.receipt}`}
            </Text>
          </View>
          <View>
            <View
              style={{
                paddingVertical: 1,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View style={{ width: "100%" }}>
                <Text style={[styles.text, { marginBottom: 1 }]}>
                  {`Customer: ${data.customername ?? "N/A"}`}
                </Text>
                <View
                  style={{
                    justifyContent: "space-between",
                    paddingVertical: 1,
                    flexDirection: "row",
                  }}
                >
                  <Text style={[styles.text, {}]}>Print Out Date</Text>
                  <Text style={[styles.text, {}]}>
                    {new Date().toLocaleString()}
                  </Text>
                </View>
                <View
                  style={{
                    justifyContent: "space-between",
                    paddingVertical: 1,
                    flexDirection: "row",
                  }}
                >
                  <Text style={[styles.text, {}]}>User</Text>
                  <Text style={[styles.text, {}]}>{account.real_name}</Text>
                </View>
                <View
                  style={{
                    justifyContent: "space-between",
                    paddingVertical: 1,
                    flexDirection: "row",
                  }}
                >
                  <Text style={[styles.text, {}]}>Branch ID</Text>
                  <Text style={[styles.text, {}]}>{account.default_store}</Text>
                </View>
              </View>
            </View>
          </View>
          <View
            style={{
              borderBottomWidth: 0.2,
              borderBottomColor: "#000",
              borderTopColor: "#000",
              borderTopWidth: 0.2,
              paddingVertical: 1,
              flexDirection: "column",
            }}
          >
            <Text style={[styles.text, { fontWeight: "bold" }]}>
              {`Trans ID: ${data.unique_identifier}`}
            </Text>
            <Text style={[styles.text, { fontWeight: "bold" }]}>
              {duplicate
                ? "Transaction Receipt"
                : "Transaction Receipt - Reprint"}
            </Text>
          </View>
        </View>

        <View style={{ paddingVertical: 1 }}>
          <Text
            style={[
              styles.text,
              {
                marginBottom: 1,
                fontWeight: "bold",
              },
            ]}
          >
            Items
          </Text>
          <View style={{ flexDirection: "row" }}>
            <View
              style={[
                styles.table_col,
                { width: "47%" },
                {
                  borderLeftWidth: 0.2,
                  borderLeftColor: "#000",
                },
              ]}
            >
              <Text style={[styles.text, { fontWeight: "bold" }]}>Name</Text>
            </View>
            <View style={[styles.table_col, { width: "13%" }]}>
              <Text style={[styles.text, { fontWeight: "bold" }]}>Qty</Text>
            </View>
            <View style={[styles.table_col, { width: "20%" }]}>
              <Text style={[styles.text, { fontWeight: "bold" }]}>
                Price(KES)
              </Text>
            </View>
            <View style={[styles.table_col, { width: "20%" }]}>
              <Text style={[styles.text, { fontWeight: "bold" }]}>
                Total(KES)
              </Text>
            </View>
          </View>
          {items.map((item, index, array) => {
            return (
              <View style={{ flexDirection: "row" }} key={index}>
                <View
                  style={[
                    styles.table_col,
                    { width: "47%" },
                    index === array.length - 1 ? styles.table_col_last_row : {},
                    { borderLeftWidth: 0.3, borderLeftColor: "#000" },
                  ]}
                >
                  <Text style={[styles.text]}>{item.item_option}</Text>
                </View>
                <View
                  style={[
                    styles.table_col,
                    { width: "13%" },
                    index === array.length - 1 ? styles.table_col_last_row : {},
                  ]}
                >
                  <Text style={[styles.text]}>{item.quantity}</Text>
                </View>
                <View
                  style={[
                    styles.table_col,
                    { width: "20%" },
                    index === array.length - 1 ? styles.table_col_last_row : {},
                  ]}
                >
                  <Text style={[styles.text]}>{`${item.price}`}</Text>
                </View>
                <View
                  style={[
                    styles.table_col,
                    { width: "20%" },
                    index === array.length - 1 ? styles.table_col_last_row : {},
                  ]}
                >
                  <Text style={[styles.text]}>
                    {`${parseFloat(item.quantity) * parseFloat(item.price)}`}
                  </Text>
                </View>
              </View>
            );
            // <View style={styles.tableRow} key={index}>
            //   <View style={[styles.tableCol, { width: "60rem" }]}>
            //     <Text style={styles.tableCell}>{item.item_option}</Text>
            //   </View>
            //   <View style={styles.tableCol}>
            //     <Text style={styles.tableCell}>{item.quantity}</Text>
            //   </View>
            //   <View style={styles.tableCol}>
            //     <Text style={styles.tableCell}>{item.price}</Text>
            //   </View>
            //   <View style={styles.tableCol}>
            //     <Text style={styles.tableCell}>
            //       {(parseFloat(item.price) * parseFloat(item.quantity)).toFixed(
            //         2,
            //       )}
            //     </Text>
            //   </View>
            // </View>
          })}
        </View>
        <View style={{ paddingVertical: 1 }}>
          <Text
            style={[
              styles.text,
              {
                marginBottom: 1,
                fontWeight: "bold",
              },
            ]}
          >
            Payments
          </Text>
          <View style={{ flexDirection: "row" }}>
            <View
              style={[
                styles.table_col,
                { width: "50%" },
                {
                  borderLeftWidth: 0.2,
                  borderLeftColor: "#000",
                },
              ]}
            >
              <Text style={[styles.text, { fontWeight: "bold" }]}>Type</Text>
            </View>
            <View style={[styles.table_col, { width: "50%" }]}>
              <Text style={[styles.text, { fontWeight: "bold" }]}>Amount</Text>
            </View>
          </View>
          {payments.map((item, index, array) => {
            return (
              <View style={{ flexDirection: "row" }} key={index}>
                <View
                  style={[
                    styles.table_col,
                    { width: "50%" },
                    index === array.length - 1 ? styles.table_col_last_row : {},
                    { borderLeftWidth: 0.3, borderLeftColor: "#000" },
                  ]}
                >
                  <Text style={[styles.text]}>{item.Transtype}</Text>
                </View>
                <View
                  style={[
                    styles.table_col,
                    { width: "50%" },
                    index === array.length - 1 ? styles.table_col_last_row : {},
                  ]}
                >
                  <Text style={[styles.text]}>{item.TransAmount}</Text>
                </View>
              </View>
            );
            // <View style={styles.tableRow} key={index}>
            //   <View style={[styles.tableCol, { width: "60rem" }]}>
            //     <Text style={styles.tableCell}>{item.item_option}</Text>
            //   </View>
            //   <View style={styles.tableCol}>
            //     <Text style={styles.tableCell}>{item.quantity}</Text>
            //   </View>
            //   <View style={styles.tableCol}>
            //     <Text style={styles.tableCell}>{item.price}</Text>
            //   </View>
            //   <View style={styles.tableCol}>
            //     <Text style={styles.tableCell}>
            //       {(parseFloat(item.price) * parseFloat(item.quantity)).toFixed(
            //         2,
            //       )}
            //     </Text>
            //   </View>
            // </View>
          })}
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <TotalRowItem label={"Total Item Count"} value={`${totalQuantity}`} />
          <TotalRowItem
            label={"Sub total"}
            value={`KES ${totalDiscount.subtotal}`}
          />
          <TotalRowItem
            label={"Discount"}
            value={`KES ${totalDiscount.totalDiscount}`}
            is_last
          />
          <TotalRowItem
            label={"Total"}
            value={`KES ${totalDiscount.subtotal - totalDiscount.totalDiscount}`}
            is_last
          />
        </View>
        <View
          style={{
            width: "100%",
            paddingVertical: 4,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              width: "40%",
              padding: 2,
              justifyContent: "center",
              backgroundColor: "#fff",
            }}
          >
            <Image src={kra_code} style={{ height: 24, width: 24 }} />
          </View>
          <View
            style={{
              width: "60%",
              padding: 2,
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            {data.middlewareInvoiceNumber ? (
              <View style={{ paddingVertical: 1 }}>
                <Text style={[styles.text]}>{`Middleware Invoice Number`}</Text>
                <Text style={[styles.text, { fontWeight: "bold" }]}>
                  {`${data.middlewareInvoiceNumber}`}
                </Text>
              </View>
            ) : null}

            {data.qrDate !== "" ? (
              <View style={{ paddingVertical: 1 }}>
                <Text style={[styles.text]}>{`QR Date`}</Text>
                <Text style={[styles.text, { fontWeight: "bold" }]}>
                  {`${data.qrDate}`}
                </Text>
              </View>
            ) : (
              <></>
            )}

            {data.controlCode !== "" ? (
              <View style={{ paddingVertical: 1 }}>
                <Text style={[styles.text]}>{`Control Code`}</Text>
                <Text style={[styles.text, { fontWeight: "bold" }]}>
                  {`${data.controlCode}`}
                </Text>
              </View>
            ) : (
              <></>
            )}
          </View>
        </View>

        <View style={{ flex: 1 }} />
        <View style={{ alignItems: "center" }}>
          <Text style={[styles.text, { fontWeight: "bold" }]}>
            Thank you for doing business with us
          </Text>
          <Text style={[styles.text, { fontWeight: "bold" }]}>
            NO refund , No exchange
          </Text>
          <Text style={[styles.text]}></Text>
        </View>
      </Page>
      {duplicate && (
        <Page size={get_printout_size(items.length)} style={{ padding: 2 }}>
          {/* <View style={styles.company_section}>
          <Text style={styles.header}>Transaction Receipt</Text>
        </View> */}
          {/* <View style={styles.company_section}>
          <Text
            style={[
              styles.text,
              { letterSpacing: 2, textAlign: "left", fontWeight: "bold" },
            ]}
          >
            {receipt_info.name}
          </Text>

          <Text style={styles.text}>{receipt_info.location}</Text>
          <Text style={styles.text}>TEL:{receipt_info.phone_number}</Text>
          <Text style={styles.text}>EMAIL:{receipt_info.email}</Text>
          <Text style={styles.text}>KRA:{receipt_info.receipt}</Text>
        </View> */}
          <View>
            <View
              style={{
                paddingVertical: 4,
                alignItems: "center",
              }}
            >
              <Text
                style={[styles.text, { fontWeight: "bold", marginBottom: 4 }]}
              >
                {`${receipt_info.name}`}
              </Text>
              <Text
                style={[styles.text, { fontWeight: "bold", marginBottom: 1 }]}
              >
                {`Email: ${receipt_info.email}`}:
              </Text>
              <Text
                style={[styles.text, { fontWeight: "bold", marginBottom: 1 }]}
              >
                {`Phone Number: ${receipt_info.phone_number}`}
              </Text>
              <Text
                style={[styles.text, { fontWeight: "bold", marginBottom: 1 }]}
              >
                {`KRA Pin: ${receipt_info.receipt}`}
              </Text>
            </View>
            <View>
              <View
                style={{
                  paddingVertical: 1,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ width: "100%" }}>
                  <Text style={[styles.text, { marginBottom: 1 }]}>
                    {`Customer: ${data.customername ?? "N/A"}`}
                  </Text>
                  <View
                    style={{
                      justifyContent: "space-between",
                      paddingVertical: 1,
                      flexDirection: "row",
                    }}
                  >
                    <Text style={[styles.text, {}]}>Print Out Date</Text>
                    <Text style={[styles.text, {}]}>
                      {new Date().toLocaleString()}
                    </Text>
                  </View>
                  <View
                    style={{
                      justifyContent: "space-between",
                      paddingVertical: 1,
                      flexDirection: "row",
                    }}
                  >
                    <Text style={[styles.text, {}]}>User</Text>
                    <Text style={[styles.text, {}]}>{account.user_id}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View
              style={{
                borderBottomWidth: 0.2,
                borderBottomColor: "#000",
                borderTopColor: "#000",
                borderTopWidth: 0.2,
                paddingVertical: 1,
                flexDirection: "column",
              }}
            >
              <Text style={[styles.text, { fontWeight: "bold" }]}>
                {`Sales Code: ${data.unique_identifier}`}
              </Text>
              <Text style={[styles.text, { fontWeight: "bold" }]}>
                {"Transaction Receipt - Copy"}
              </Text>
            </View>
          </View>

          <View style={{ paddingVertical: 1 }}>
            <Text
              style={[
                styles.text,
                {
                  marginBottom: 1,
                  fontWeight: "bold",
                },
              ]}
            >
              Items
            </Text>
            <View style={{ flexDirection: "row" }}>
              <View
                style={[
                  styles.table_col,
                  { width: "47%" },
                  {
                    borderLeftWidth: 0.2,
                    borderLeftColor: "#000",
                  },
                ]}
              >
                <Text style={[styles.text, { fontWeight: "bold" }]}>Name</Text>
              </View>
              <View style={[styles.table_col, { width: "13%" }]}>
                <Text style={[styles.text, { fontWeight: "bold" }]}>Qty</Text>
              </View>
              <View style={[styles.table_col, { width: "20%" }]}>
                <Text style={[styles.text, { fontWeight: "bold" }]}>
                  Price(KES)
                </Text>
              </View>
              <View style={[styles.table_col, { width: "20%" }]}>
                <Text style={[styles.text, { fontWeight: "bold" }]}>
                  Total(KES)
                </Text>
              </View>
            </View>
            {items.map((item, index, array) => {
              return (
                <View style={{ flexDirection: "row" }} key={index}>
                  <View
                    style={[
                      styles.table_col,
                      { width: "47%" },
                      index === array.length - 1
                        ? styles.table_col_last_row
                        : {},
                      { borderLeftWidth: 0.3, borderLeftColor: "#000" },
                    ]}
                  >
                    <Text style={[styles.text]}>{item.item_option}</Text>
                  </View>
                  <View
                    style={[
                      styles.table_col,
                      { width: "13%" },
                      index === array.length - 1
                        ? styles.table_col_last_row
                        : {},
                    ]}
                  >
                    <Text style={[styles.text]}>{item.quantity}</Text>
                  </View>
                  <View
                    style={[
                      styles.table_col,
                      { width: "20%" },
                      index === array.length - 1
                        ? styles.table_col_last_row
                        : {},
                    ]}
                  >
                    <Text style={[styles.text]}>{`${item.price}`}</Text>
                  </View>
                  <View
                    style={[
                      styles.table_col,
                      { width: "20%" },
                      index === array.length - 1
                        ? styles.table_col_last_row
                        : {},
                    ]}
                  >
                    <Text style={[styles.text]}>
                      {`${parseFloat(item.quantity) * parseFloat(item.price)}`}
                    </Text>
                  </View>
                </View>
              );
              // <View style={styles.tableRow} key={index}>
              //   <View style={[styles.tableCol, { width: "60rem" }]}>
              //     <Text style={styles.tableCell}>{item.item_option}</Text>
              //   </View>
              //   <View style={styles.tableCol}>
              //     <Text style={styles.tableCell}>{item.quantity}</Text>
              //   </View>
              //   <View style={styles.tableCol}>
              //     <Text style={styles.tableCell}>{item.price}</Text>
              //   </View>
              //   <View style={styles.tableCol}>
              //     <Text style={styles.tableCell}>
              //       {(parseFloat(item.price) * parseFloat(item.quantity)).toFixed(
              //         2,
              //       )}
              //     </Text>
              //   </View>
              // </View>
            })}
          </View>
          <View style={{ paddingVertical: 1 }}>
            <Text
              style={[
                styles.text,
                {
                  marginBottom: 1,
                  fontWeight: "bold",
                },
              ]}
            >
              Payments
            </Text>
            <View style={{ flexDirection: "row" }}>
              <View
                style={[
                  styles.table_col,
                  { width: "50%" },
                  {
                    borderLeftWidth: 0.2,
                    borderLeftColor: "#000",
                  },
                ]}
              >
                <Text style={[styles.text, { fontWeight: "bold" }]}>Type</Text>
              </View>
              <View style={[styles.table_col, { width: "50%" }]}>
                <Text style={[styles.text, { fontWeight: "bold" }]}>
                  Amount
                </Text>
              </View>
            </View>
            {payments.map((item, index, array) => {
              return (
                <View style={{ flexDirection: "row" }} key={index}>
                  <View
                    style={[
                      styles.table_col,
                      { width: "50%" },
                      index === array.length - 1
                        ? styles.table_col_last_row
                        : {},
                      { borderLeftWidth: 0.3, borderLeftColor: "#000" },
                    ]}
                  >
                    <Text style={[styles.text]}>{item.Transtype}</Text>
                  </View>
                  <View
                    style={[
                      styles.table_col,
                      { width: "50%" },
                      index === array.length - 1
                        ? styles.table_col_last_row
                        : {},
                    ]}
                  >
                    <Text style={[styles.text]}>{item.TransAmount}</Text>
                  </View>
                </View>
              );
              // <View style={styles.tableRow} key={index}>
              //   <View style={[styles.tableCol, { width: "60rem" }]}>
              //     <Text style={styles.tableCell}>{item.item_option}</Text>
              //   </View>
              //   <View style={styles.tableCol}>
              //     <Text style={styles.tableCell}>{item.quantity}</Text>
              //   </View>
              //   <View style={styles.tableCol}>
              //     <Text style={styles.tableCell}>{item.price}</Text>
              //   </View>
              //   <View style={styles.tableCol}>
              //     <Text style={styles.tableCell}>
              //       {(parseFloat(item.price) * parseFloat(item.quantity)).toFixed(
              //         2,
              //       )}
              //     </Text>
              //   </View>
              // </View>
            })}
          </View>
          <View
            style={{
              width: "100%",
              paddingVertical: 4,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                width: "40%",
                padding: 2,
                justifyContent: "center",
                backgroundColor: "#fff",
              }}
            >
              <Image src={kra_code} style={{ height: 24, width: 24 }} />
            </View>
            <View
              style={{
                width: "60%",
                padding: 2,
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              {data.middlewareInvoiceNumber ? (
                <View style={{ paddingVertical: 1 }}>
                  <Text
                    style={[styles.text]}
                  >{`Middleware Invoice Number`}</Text>
                  <Text style={[styles.text, { fontWeight: "bold" }]}>
                    {`${data.middlewareInvoiceNumber}`}
                  </Text>
                </View>
              ) : null}

              {data.qrDate !== "" ? (
                <View style={{ paddingVertical: 1 }}>
                  <Text style={[styles.text]}>{`QR Date`}</Text>
                  <Text style={[styles.text, { fontWeight: "bold" }]}>
                    {`${data.qrDate}`}
                  </Text>
                </View>
              ) : (
                <></>
              )}

              {data.controlCode !== "" ? (
                <View style={{ paddingVertical: 1 }}>
                  <Text style={[styles.text]}>{`Control Code`}</Text>
                  <Text style={[styles.text, { fontWeight: "bold" }]}>
                    {`${data.controlCode}`}
                  </Text>
                </View>
              ) : (
                <></>
              )}
            </View>
          </View>

          <View style={{ flex: 1 }} />
          {/*NOTE: (teddy) THank you message*/}
          <View style={{ paddingVertical: 1, alignItems: "center" }}>
            <Text
              style={[styles.text, { marginBottom: 1, fontWeight: "bold" }]}
            >
              Thank you for doing business with us
            </Text>
            <Text style={[styles.text]}></Text>
          </View>
        </Page>
      )}
    </Document>
  );
};

export default TransactionReceiptPDF;

type TotalRowItemProps = {
  is_last?: boolean;
  label: string;
  value: string;
};

function TotalRowItem({ is_last, label, value }: TotalRowItemProps) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          width: "70%",
          borderTopColor: "#000",
          borderTopWidth: 0.2,
          borderRightColor: "#000",
          borderRightWidth: 0.2,
          borderLeftColor: "#000",
          borderLeftWidth: 0.2,
        },
        is_last
          ? {
              borderBottomWidth: 0.2,
              borderBottomColor: "#000",
            }
          : {},
      ]}
    >
      <View
        style={{
          width: "50%",
          borderRightWidth: 0.2,
          borderRightColor: "#000",
          padding: 1,
        }}
      >
        <Text style={[styles.text, { fontWeight: "bold" }]}>{label}</Text>
      </View>
      <View
        style={{
          width: "50%",
          padding: 1,
        }}
      >
        <Text style={[styles.text]}>{value}</Text>
      </View>
    </View>
  );
}
