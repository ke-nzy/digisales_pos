/**
 * Enhanced Transaction Receipt PDF
 * Located at: hawk-tuah/components/enhanced-receipt-pdf.tsx
 * 
 * Displays full discount transparency with original vs final prices
 */

import React, { useState, useEffect } from "react";
import {
    Document,
    Page,
    Text,
    Image,
    View,
    StyleSheet,
} from "@react-pdf/renderer";
import QRCode from "qrcode";
import { toast } from "sonner";
import { formatMoney } from "../utils/formatters";

// Enhanced receipt calculation
interface EnhancedReceiptCalculations {
    items: Array<{
        id: string;
        name: string;
        quantity: number;
        originalPrice: number;
        finalPrice: number;
        automaticDiscount: number;
        manualDiscount: number;
        totalDiscount: number;
        lineTotal: number;
        hasDiscount: boolean;
    }>;
    totals: {
        subtotal: number;
        totalAutomaticDiscounts: number;
        totalManualDiscounts: number;
        bulkDiscount: number;
        totalSavings: number;
        finalTotal: number;
        tax: number;
    };
}

/**
 * Calculate enhanced receipt data from submission response
 */
function calculateEnhancedReceiptData(data: SalesReceiptInformation): EnhancedReceiptCalculations {
    const salesInfo = data[0];
    const items: TransactionInvItem[] = salesInfo.pitems.length > 0 ? JSON.parse(salesInfo.pitems) : [];

    // Parse discount summary if available (from our enhanced submission)
    let discountSummary = null;
    try {
        if (data.discount_summary) {
            discountSummary = typeof data.discount_summary === 'string'
                ? JSON.parse(data.discount_summary)
                : data.discount_summary;
        }
    } catch (error) {
        console.log('No enhanced discount summary found, using item-level data');
    }

    // Process each item
    const enhancedItems = items.map(item => {
        const quantity = parseFloat(item.quantity);
        const finalPrice = parseFloat(item.price);
        const lineTotal = quantity * finalPrice;
        const totalDiscount = parseFloat(item.discount || "0");

        // Try to extract original price if available (from our enhanced submission)
        const originalPrice = item.original_price
            ? parseFloat(item.original_price)
            : finalPrice + (totalDiscount / quantity); // Estimate if not available

        const automaticDiscount = item.automatic_discount
            ? parseFloat(item.automatic_discount)
            : 0;

        const manualDiscount = item.manual_discount
            ? parseFloat(item.manual_discount)
            : totalDiscount - automaticDiscount;

        return {
            id: item.item_option_id,
            name: item.item_option,
            quantity,
            originalPrice,
            finalPrice,
            automaticDiscount,
            manualDiscount,
            totalDiscount,
            lineTotal,
            hasDiscount: totalDiscount > 0
        };
    });

    // Calculate totals
    const subtotal = enhancedItems.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
    const finalTotal = enhancedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalAutomaticDiscounts = enhancedItems.reduce((sum, item) => sum + item.automaticDiscount, 0);
    const totalManualDiscounts = enhancedItems.reduce((sum, item) => sum + item.manualDiscount, 0);

    // Use enhanced summary if available, otherwise calculate from items
    const bulkDiscount = discountSummary?.bulk_discount || 0;
    const totalSavings = totalAutomaticDiscounts + totalManualDiscounts + bulkDiscount;
    const tax = parseFloat(salesInfo.vat_amount || "0");

    return {
        items: enhancedItems,
        totals: {
            subtotal,
            totalAutomaticDiscounts,
            totalManualDiscounts,
            bulkDiscount,
            totalSavings,
            finalTotal,
            tax
        }
    };
}

const EnhancedTransactionReceiptPDF = ({
    data,
    receipt_info,
    account,
    duplicate,
}: {
    data: SalesReceiptInformation;
    receipt_info: CompanyReceiptInfo;
    account: UserAccountInfo;
    duplicate: boolean;
}) => {
    const [qrCodeUrl, setQrCodeUrl] = useState(data.qrCode || "");

    const salesInfo = data[0];
    const payments: Payment[] = salesInfo.payments.length > 0 ? JSON.parse(salesInfo.payments) : [];
    const enhancedData = calculateEnhancedReceiptData(data);

    // Generate QR Code
    useEffect(() => {
        const generateQRCode = async () => {
            try {
                const qrData = data.qrCode || "ESD Device Unreachable";
                const code = await QRCode.toDataURL(qrData);
                setQrCodeUrl(code);
            } catch (error) {
                console.error("Failed to generate QR code:", error);
            }
        };
        void generateQRCode();
    }, [data.qrCode]);

    // Calculate receipt size dynamically
    function getReceiptSize(): [number, number] {
        const baseHeight = 500;
        const itemsHeight = enhancedData.items.length * 12;
        const discountHeight = (enhancedData.totals.totalSavings > 0) ? 40 : 0;
        const paymentsHeight = payments.length * 12;

        return [200, baseHeight + itemsHeight + discountHeight + paymentsHeight];
    }

    const totalPaid = payments.reduce((sum, payment) => {
        const amount = typeof payment.TransAmount === "string"
            ? parseFloat(payment.TransAmount)
            : payment.TransAmount;
        const balance = payment.balance !== undefined
            ? (typeof payment.balance === "string" ? parseFloat(payment.balance) : payment.balance)
            : 0;
        return sum + (isNaN(amount) ? 0 : amount) + (isNaN(balance) ? 0 : balance);
    }, 0);

    const balance = enhancedData.totals.finalTotal - totalPaid;

    return (
        <Document>
            <Page size={getReceiptSize()} style={{ padding: 2 }}>
                {/* Header Section */}
                <View style={{ paddingVertical: 2, alignItems: "center" }}>
                    <Text style={[styles.text, { fontWeight: "bold", marginBottom: 4 }]}>
                        {receipt_info.name}
                    </Text>
                    <Text style={[styles.text, { fontWeight: "bold", marginBottom: 1 }]}>
                        Email: {receipt_info.email}
                    </Text>
                    <Text style={[styles.text, { fontWeight: "bold", marginBottom: 1 }]}>
                        Phone: {receipt_info.phone_number}
                    </Text>
                    <Text style={[styles.text, { fontWeight: "bold", marginBottom: 1 }]}>
                        KRA Pin: {receipt_info.receipt}
                    </Text>
                    <Text style={[styles.text, { fontWeight: "bold", marginBottom: 1 }]}>
                        Till Number: {account.default_till}
                    </Text>
                </View>

                {/* Customer Info */}
                <View style={{ paddingVertical: 1 }}>
                    <View style={styles.infoRow}>
                        <Text style={styles.text}>Customer:</Text>
                        <Text style={styles.text}>{salesInfo.customername || "N/A"}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.text}>Customer Pin:</Text>
                        <Text style={styles.text}>{salesInfo.pin || "N/A"}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.text}>Print Date:</Text>
                        <Text style={styles.text}>{new Date().toLocaleString()}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.text}>Cashier:</Text>
                        <Text style={styles.text}>{account.real_name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.text}>Branch:</Text>
                        <Text style={styles.text}>{account.default_store_name}</Text>
                    </View>
                </View>

                {/* Transaction Info */}
                <View style={styles.transactionHeader}>
                    <Text style={[styles.text, { fontWeight: "bold" }]}>
                        Trans ID: {salesInfo.id}
                    </Text>
                    <Text style={[styles.text, { fontWeight: "bold" }]}>
                        {duplicate ? "Transaction Receipt" : "Transaction Receipt - Reprint"}
                    </Text>
                </View>

                {/* Items Section */}
                <View style={{ paddingVertical: 1 }}>
                    <Text style={[styles.text, { marginBottom: 1, fontWeight: "bold" }]}>
                        Items
                    </Text>

                    {/* Items Header */}
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCol, { width: "45%" }, styles.leftBorder]}>
                            <Text style={[styles.text, { fontWeight: "bold" }]}>Name</Text>
                        </View>
                        <View style={[styles.tableCol, { width: "10%" }]}>
                            <Text style={[styles.text, { fontWeight: "bold" }]}>Qty</Text>
                        </View>
                        <View style={[styles.tableCol, { width: "22.5%" }]}>
                            <Text style={[styles.text, { fontWeight: "bold" }]}>Price(KES)</Text>
                        </View>
                        <View style={[styles.tableCol, { width: "22.5%" }]}>
                            <Text style={[styles.text, { fontWeight: "bold" }]}>Total(KES)</Text>
                        </View>
                    </View>

                    {/* Items Data */}
                    {enhancedData.items.map((item, index) => (
                        <View key={item.id}>
                            {/* Main item row */}
                            <View style={styles.tableRow}>
                                <View style={[styles.tableCol, { width: "45%" }, styles.leftBorder]}>
                                    <Text style={styles.text}>{item.name}</Text>
                                    {item.hasDiscount && (
                                        <Text style={[styles.text, { fontSize: 6, color: "#22c55e" }]}>
                                            💰 Saved: {formatMoney(item.totalDiscount)}
                                        </Text>
                                    )}
                                </View>
                                <View style={[styles.tableCol, { width: "10%" }]}>
                                    <Text style={styles.text}>{item.quantity}</Text>
                                </View>
                                <View style={[styles.tableCol, { width: "22.5%" }]}>
                                    {item.hasDiscount ? (
                                        <View>
                                            <Text style={[styles.text, { fontSize: 6, textDecoration: "line-through" }]}>
                                                {item.originalPrice}
                                            </Text>
                                            <Text style={[styles.text, { color: "#22c55e" }]}>
                                                {item.finalPrice}
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.text}>{item.finalPrice}</Text>
                                    )}
                                </View>
                                <View style={[styles.tableCol, { width: "22.5%" }]}>
                                    <Text style={[styles.text, item.hasDiscount ? { color: "#22c55e" } : {}]}>
                                        {item.lineTotal}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}

                    {/* Subtotal Row */}
                    <View style={[styles.tableRow, { borderTop: "0.5px solid #000", marginTop: 2 }]}>
                        <View style={[{ width: "55%" }]} />
                        <View style={[{ width: "22.5%" }]}>
                            <Text style={[styles.text, { fontWeight: "bold" }]}>Subtotal:</Text>
                        </View>
                        <View style={[{ width: "22.5%", border: "0.5px solid #000" }]}>
                            <Text style={[styles.text, { fontWeight: "bold" }]}>
                                {enhancedData.totals.subtotal}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Discount Breakdown (if any discounts) */}
                {enhancedData.totals.totalSavings > 0 && (
                    <View style={{ paddingVertical: 1, backgroundColor: "#f8f9fa" }}>
                        <Text style={[styles.text, { fontWeight: "bold", marginBottom: 1 }]}>
                            💰 Discount Breakdown
                        </Text>

                        {enhancedData.totals.totalAutomaticDiscounts > 0 && (
                            <View style={styles.discountRow}>
                                <Text style={[styles.text, { width: "70%" }]}>Automatic Discounts:</Text>
                                <Text style={[styles.text, { color: "#22c55e" }]}>
                                    -{formatMoney(enhancedData.totals.totalAutomaticDiscounts)}
                                </Text>
                            </View>
                        )}

                        {enhancedData.totals.totalManualDiscounts > 0 && (
                            <View style={styles.discountRow}>
                                <Text style={[styles.text, { width: "70%" }]}>Manual Discounts:</Text>
                                <Text style={[styles.text, { color: "#22c55e" }]}>
                                    -{formatMoney(enhancedData.totals.totalManualDiscounts)}
                                </Text>
                            </View>
                        )}

                        {enhancedData.totals.bulkDiscount > 0 && (
                            <View style={styles.discountRow}>
                                <Text style={[styles.text, { width: "70%" }]}>Bulk Discount:</Text>
                                <Text style={[styles.text, { color: "#22c55e" }]}>
                                    -{formatMoney(enhancedData.totals.bulkDiscount)}
                                </Text>
                            </View>
                        )}

                        <View style={[styles.discountRow, { borderTop: "0.5px solid #22c55e", paddingTop: 1 }]}>
                            <Text style={[styles.text, { fontWeight: "bold", width: "70%" }]}>Total Savings:</Text>
                            <Text style={[styles.text, { fontWeight: "bold", color: "#22c55e" }]}>
                                {formatMoney(enhancedData.totals.totalSavings)}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Payments Section */}
                <View style={{ paddingVertical: 1 }}>
                    <Text style={[styles.text, { marginBottom: 1, fontWeight: "bold" }]}>
                        Payments
                    </Text>

                    <View style={styles.tableRow}>
                        <View style={[styles.tableCol, { width: "50%" }, styles.leftBorder]}>
                            <Text style={[styles.text, { fontWeight: "bold" }]}>Type</Text>
                        </View>
                        <View style={[styles.tableCol, { width: "50%" }]}>
                            <Text style={[styles.text, { fontWeight: "bold" }]}>Amount</Text>
                        </View>
                    </View>

                    {payments.map((payment, index) => {
                        const transAmount = typeof payment.TransAmount === "string"
                            ? parseFloat(payment.TransAmount)
                            : payment.TransAmount;
                        const balance = payment.balance !== undefined
                            ? (typeof payment.balance === "string" ? parseFloat(payment.balance) : payment.balance)
                            : 0;
                        const totalAmount = (isNaN(transAmount) ? 0 : transAmount) + (isNaN(balance) ? 0 : balance);

                        return (
                            <View style={styles.tableRow} key={index}>
                                <View style={[styles.tableCol, { width: "50%" }, styles.leftBorder]}>
                                    <Text style={styles.text}>{payment.Transtype}</Text>
                                </View>
                                <View style={[styles.tableCol, { width: "50%" }]}>
                                    <Text style={styles.text}>{totalAmount}</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Totals Section */}
                <View style={{ alignItems: "flex-end", paddingVertical: 2 }}>
                    <TotalRowItem label="Item Count" value={`${enhancedData.items.reduce((sum, item) => sum + item.quantity, 0)}`} />

                    {enhancedData.totals.totalSavings > 0 && (
                        <>
                            <TotalRowItem label="Before Discounts" value={`${formatMoney(enhancedData.totals.subtotal)}`} />
                            <TotalRowItem label="Total Savings" value={`${formatMoney(enhancedData.totals.totalSavings)}`} />
                        </>
                    )}

                    <TotalRowItem label="Subtotal" value={`${formatMoney(enhancedData.totals.finalTotal)}`} />
                    <TotalRowItem label="Tax 16%" value={`${formatMoney(enhancedData.totals.tax)}`} />
                    <TotalRowItem label="Total Paid" value={`${formatMoney(totalPaid)}`} />
                    <TotalRowItem
                        label="Balance"
                        value={`${formatMoney(balance)}`}
                        isLast={true}
                        isNegative={balance < 0}
                    />
                </View>

                {/* QR Code and Control Info */}
                <View style={{ width: "100%", paddingVertical: 4, flexDirection: "row", justifyContent: "space-between" }}>
                    <Image src={qrCodeUrl} style={{ maxHeight: 70, maxWidth: 70 }} />

                    <View style={{ width: "60%", padding: 2, justifyContent: "center", flexDirection: "column" }}>
                        {data.middlewareInvoiceNumber && (
                            <View style={{ paddingVertical: 1 }}>
                                <Text style={styles.text}>Middleware Invoice:</Text>
                                <Text style={[styles.text, { fontWeight: "bold" }]}>
                                    {data.middlewareInvoiceNumber}
                                </Text>
                            </View>
                        )}

                        {data.qrDate && (
                            <View style={{ paddingVertical: 1 }}>
                                <Text style={styles.text}>QR Date:</Text>
                                <Text style={[styles.text, { fontWeight: "bold" }]}>{data.qrDate}</Text>
                            </View>
                        )}

                        {data.controlCode && (
                            <View style={{ paddingVertical: 1 }}>
                                <Text style={styles.text}>Control Code:</Text>
                                <Text style={[styles.text, { fontWeight: "bold" }]}>{data.controlCode}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Footer */}
                <View style={{ alignItems: "center", marginBottom: 3 }}>
                    <Text style={[styles.text, { fontWeight: "bold" }]}>
                        Thank you for doing business with us
                    </Text>
                    <Text style={[styles.text, { fontWeight: "bold", fontSize: 9 }]}>
                        NO REFUND, NO EXCHANGE
                    </Text>

                    {enhancedData.totals.totalSavings > 0 && (
                        <Text style={[styles.text, { color: "#22c55e", fontWeight: "bold", marginTop: 2 }]}>
                            🎉 You saved {formatMoney(enhancedData.totals.totalSavings)} today!
                        </Text>
                    )}
                </View>
            </Page>

            {/* Duplicate Copy (if requested) */}
            {duplicate && (
                <Page size={getReceiptSize()} style={{ padding: 2 }}>
                    {/* Same content but marked as "Copy" */}
                    {/* Implementation would be similar to above but with "Copy" label */}
                </Page>
            )}
        </Document>
    );
};

// Styles
const styles = StyleSheet.create({
    text: { fontSize: 8 },
    infoRow: {
        justifyContent: "space-between",
        paddingVertical: 1,
        flexDirection: "row",
    },
    transactionHeader: {
        borderBottomWidth: 0.2,
        borderBottomColor: "#000",
        borderTopColor: "#000",
        borderTopWidth: 0.2,
        paddingVertical: 1,
        flexDirection: "column",
    },
    tableRow: { flexDirection: "row" },
    tableCol: {
        paddingHorizontal: 1,
        borderTopColor: "#000",
        borderTopWidth: 0.5,
        padding: 1,
        borderRightWidth: 0.5,
        borderRightColor: "#000",
    },
    leftBorder: {
        borderLeftWidth: 0.3,
        borderLeftColor: "#000",
    },
    discountRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 0.5,
    },
});

// Total Row Component
interface TotalRowItemProps {
    label: string;
    value: string;
    isLast?: boolean;
    isNegative?: boolean;
}

function TotalRowItem({ label, value, isLast, isNegative }: TotalRowItemProps) {
    return (
        <View style={[
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
            isLast && {
                borderBottomWidth: 0.2,
                borderBottomColor: "#000",
            },
        ]}>
            <View style={{
                width: "50%",
                borderRightWidth: 0.2,
                borderRightColor: "#000",
                padding: 1,
            }}>
                <Text style={[styles.text, { fontWeight: "bold" }]}>{label}</Text>
            </View>
            <View style={{ width: "50%", padding: 1 }}>
                <Text style={[
                    styles.text,
                    isNegative ? { color: "#ef4444" } : {},
                ]}>
                    {value}
                </Text>
            </View>
        </View>
    );
}

export default EnhancedTransactionReceiptPDF;