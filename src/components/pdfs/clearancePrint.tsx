import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register custom font
Font.register({
  family: "Courier Prime",
  src: "http://fonts.gstatic.com/s/raleway/v11/bIcY3_3JNqUVRAQQRNVteQ.ttf",
});

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 4,
  },
  header: {
    fontSize: 8,
    marginBottom: 5,
    fontFamily: "Courier",
  },
  text: {
    fontSize: 5.0,
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
    fontFamily: "Courier-Bold",
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

type PaymentTypes = Record<string, number>;

interface ClearancePrintPDFProps {
  selectedShift: Shift | null;
  amounts: Record<string, string>;
  paymentSummary: TransTypeSummary[];
  receipt_info: CompanyReceiptInfo;
  account: UserAccountInfo;
}

const ClearancePrintPDF = ({
  selectedShift,
  amounts,
  paymentSummary,
  receipt_info,
  account,
}: ClearancePrintPDFProps) => {
  function get_printout_size(length: number): [number, number] {
    return [200, 800 + length * 10];
  }
  const dataToSubmit = paymentSummary.map((paymentType) => ({
    TransType: paymentType.TransType!,
    ActualValue: amounts[paymentType.TransType!]?.toString() || "0.00",
  }));

  return (
    <Document>
      <Page size={get_printout_size(5)} style={{ padding: 2 }}>
        <View>
          <View style={{ paddingVertical: 4, alignItems: "center" }}>
            <Text
              style={[styles.text, { fontWeight: "bold", marginBottom: 4 }]}
            >
              {receipt_info.name}
            </Text>
            <Text
              style={[styles.text, { fontWeight: "bold", marginBottom: 1 }]}
            >
              Email: {receipt_info.email}
            </Text>
            <Text
              style={[styles.text, { fontWeight: "bold", marginBottom: 1 }]}
            >
              Phone Number: {receipt_info.phone_number}
            </Text>
            <Text
              style={[styles.text, { fontWeight: "bold", marginBottom: 1 }]}
            >
              KRA Pin: {receipt_info.receipt}
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
                  {`User: ${account.real_name ?? "N/A"}`}
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
              </View>
            </View>
          </View>
          <View style={{ paddingVertical: 1 }}>
            <Text
              style={[styles.text, { marginBottom: 1, fontWeight: "bold" }]}
            >
              Shift Details
            </Text>
            <View style={{ flexDirection: "row" }}>
              <Text style={[styles.text, { width: "50%" }]}>
                {selectedShift?.user_name}
              </Text>
              <Text style={[styles.text, { width: "25%" }]}>
                {selectedShift?.start_date}
              </Text>
              <Text style={[styles.text, { width: "25%" }]}>
                {selectedShift?.end_date}
              </Text>
            </View>
          </View>

          <View style={{ paddingVertical: 1 }}>
            <Text
              style={[styles.text, { marginBottom: 1, fontWeight: "bold" }]}
            >
              Payments Received
            </Text>
            {Object.entries(dataToSubmit).map(([type, i], index) => (
              <View key={index} style={{ flexDirection: "row" }}>
                <Text style={[styles.text, { width: "50%" }]}>
                  {i.TransType}
                </Text>
                <Text style={[styles.text, { width: "50%" }]}>
                  {i.ActualValue}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ClearancePrintPDF;
