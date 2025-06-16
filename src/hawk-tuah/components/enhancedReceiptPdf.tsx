/**
 * Complete Clean Receipt PDF with Duplicate Support
 * Located at: hawk-tuah/components/complete-clean-receipt-pdf.tsx
 * 
 * Clean receipt design with duplicate copy support and QR fallback
 * USING THE EXACT WORKING QR PATTERN FROM OLD CODE
 * Now with MINIMAL item separation - everything else EXACTLY the same
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
import EnhancedSeparatedItemsSection from "./enhancedSeparatedItemsSection";

const DEFAULT_QR_CODE_DATA = "ESD Device Unreachable";

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
        tax: number;
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
        grandTotal: number;
    };
}

/**
 * Calculate receipt data using server response values directly
 */
function calculateEnhancedReceiptData(data: SalesReceiptInformation): EnhancedReceiptCalculations {
    const salesInfo = data[0];
    const items: TransactionInvItem[] = salesInfo.pitems.length > 0 ? JSON.parse(salesInfo.pitems) : [];

    // Parse enhanced discount summary
    let discountSummary = null;
    try {
        if (salesInfo.discount_summary) {
            discountSummary = typeof salesInfo.discount_summary === 'string'
                ? JSON.parse(salesInfo.discount_summary)
                : salesInfo.discount_summary;
        }
    } catch (error) {
        console.log('Using item-level discount data');
    }

    // Process each item with enhanced details
    const enhancedItems = items.map(item => {
        const quantity = parseFloat(item.quantity);
        const finalPrice = parseFloat(item.price);
        const lineTotal = quantity * finalPrice;
        const totalDiscount = parseFloat(item.discount || "0");
        const tax = parseFloat(item.tax || "0");

        const originalPrice = item.original_price
            ? parseFloat(item.original_price)
            : finalPrice + (totalDiscount / quantity);

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
            tax,
            hasDiscount: totalDiscount > 0
        };
    });

    // Use server response values directly
    const subtotal = discountSummary?.subtotal || enhancedItems.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
    const finalTotal = parseFloat(salesInfo.ptotal); // Use ptotal directly from server
    const totalAutomaticDiscounts = discountSummary?.automatic_discounts || enhancedItems.reduce((sum, item) => sum + item.automaticDiscount, 0);
    const totalManualDiscounts = discountSummary?.manual_discounts || enhancedItems.reduce((sum, item) => sum + item.manualDiscount, 0);
    const bulkDiscount = discountSummary?.bulk_discount || 0;
    const totalSavings = totalAutomaticDiscounts + totalManualDiscounts + bulkDiscount;
    const totalTax = parseFloat(salesInfo.vat_amount || "0");

    // finalTotal from server already includes tax
    const grandTotal = finalTotal;

    return {
        items: enhancedItems,
        totals: {
            subtotal,
            totalAutomaticDiscounts,
            totalManualDiscounts,
            bulkDiscount,
            totalSavings,
            finalTotal,
            tax: totalTax,
            grandTotal
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
    // EXACT SAME PATTERN AS WORKING OLD CODE  
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    const [qrCodeStatus, setQrCodeStatus] = useState<'loading' | 'success' | 'error'>('loading');

    console.log("Data received for the receipt: ", data)
    console.log("Received QR data:", qrCodeUrl);

    const salesInfo = data[0];
    const payments: Payment[] = salesInfo.payments.length > 0 ? JSON.parse(salesInfo.payments) : [];
    const enhancedData = calculateEnhancedReceiptData(data);

    // EXACT SAME FUNCTION AS WORKING OLD CODE
    const generateDefaultQRCode = async (): Promise<string> => {
        try {
            const code = await QRCode.toDataURL(DEFAULT_QR_CODE_DATA);
            console.log("Generated default QR code:", code.substring(0, 50) + "...");
            return code;
        } catch (error) {
            console.error("Failed to generate default QR code:", error);
            throw error;
        }
    };

    // 3. Enhanced useEffect with better state management:
    useEffect(() => {
        const generateKraCode = async () => {
            try {
                setQrCodeStatus('loading');
                let generatedCode = "";

                if (data.qrCode && data.qrCode.length > 0) {
                    console.log("Generating QR from data.qrCode:", data.qrCode.substring(0, 50) + "...");
                    generatedCode = await QRCode.toDataURL(data.qrCode);
                } else {
                    console.log("No QR data, generating default");
                    generatedCode = await generateDefaultQRCode();
                }

                console.log("Setting QR code URL:", generatedCode.substring(0, 50) + "...");
                setQrCodeUrl(generatedCode);
                setQrCodeStatus('success');

            } catch (error) {
                console.error("Failed to generate QR code:", error);
                setQrCodeStatus('error');
                try {
                    const fallbackCode = await generateDefaultQRCode();
                    setQrCodeUrl(fallbackCode);
                    setQrCodeStatus('success');
                } catch (fallbackError) {
                    console.error("Failed to generate fallback QR code:", fallbackError);
                    setQrCodeUrl("");
                    setQrCodeStatus('error');
                }
            }
        };

        void generateKraCode();
    }, [data.qrCode]);

    // Calculate dynamic receipt size
    function getReceiptSize(): [number, number] {
        const baseHeight = 550;
        const itemsHeight = enhancedData.items.length * 15;
        const discountHeight = (enhancedData.totals.totalSavings > 0) ? 50 : 0;
        const paymentsHeight = payments.length * 12;
        return [200, baseHeight + itemsHeight + discountHeight + paymentsHeight];
    }

    // Get balance directly from server response
    const getBalanceFromPayments = () => {
        if (payments.length > 0 && payments[0].balance !== undefined) {
            return typeof payments[0].balance === "string"
                ? parseFloat(payments[0].balance)
                : payments[0].balance;
        }
        return 0;
    };

    const balance = getBalanceFromPayments();
    const dumbassShit = QRCode.toDataURL(DEFAULT_QR_CODE_DATA);

    // Receipt Page Component
    const ReceiptPage = ({ isOriginal }: { isOriginal: boolean }) => (
        <Page size={getReceiptSize()} style={styles.page}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.companyName}>{receipt_info.name}</Text>
                <Text style={styles.headerSubtext}>CASH RECEIPT</Text>
                {!isOriginal && <Text style={styles.duplicateText}>DUPLICATE COPY</Text>}
            </View>

            {/* Company Info */}
            <View style={styles.companyInfo}>
                <Text style={styles.bodyText}>Email: {receipt_info.email}</Text>
                <Text style={styles.bodyText}>Phone: {receipt_info.phone_number}</Text>
                <Text style={styles.bodyText}>KRA PIN: {receipt_info.receipt}</Text>
                <Text style={styles.bodyText}>Till No: {account.default_till}</Text>
            </View>

            <View style={styles.dottedLine} />

            {/* Transaction Info */}
            <View style={styles.transactionInfo}>
                <View style={styles.infoRow}>
                    <Text style={styles.bodyText}>Receipt #:</Text>
                    <Text style={styles.bodyText}>{salesInfo.rcp_no}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.bodyText}>Date:</Text>
                    <Text style={styles.bodyText}>{new Date(salesInfo.pdate).toLocaleDateString()}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.bodyText}>Time:</Text>
                    <Text style={styles.bodyText}>{new Date(salesInfo.pdate).toLocaleTimeString()}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.bodyText}>Cashier:</Text>
                    <Text style={styles.bodyText}>{data[0].uname}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.bodyText}>Customer:</Text>
                    <Text style={styles.bodyText}>{salesInfo.customername || "WALK-IN"}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.bodyText}>Branch:</Text>
                    <Text style={styles.bodyText}>{salesInfo.branch_name}</Text>
                </View>
            </View>

            <View style={styles.dottedLine} />

            {/* Items List - NOW WITH MINIMAL SEPARATION */}
            <EnhancedSeparatedItemsSection
                items={enhancedData.items}
                showDiscounts={true}
            />

            <View style={styles.dottedLine} />

            {/* Discount Summary */}
            {enhancedData.totals.totalSavings > 0 && (
                <>
                    <View style={styles.savingsSection}>
                        <Text style={styles.savingsTitle}>Savings Breakdown:</Text>

                        {enhancedData.totals.totalAutomaticDiscounts > 0 && (
                            <View style={styles.savingsRow}>
                                <Text style={styles.bodyText}>Auto Discounts:</Text>
                                <Text style={styles.savingsAmount}>-{formatMoney(enhancedData.totals.totalAutomaticDiscounts)}</Text>
                            </View>
                        )}

                        {enhancedData.totals.totalManualDiscounts > 0 && (
                            <View style={styles.savingsRow}>
                                <Text style={styles.bodyText}>Manual Discounts:</Text>
                                <Text style={styles.savingsAmount}>-{formatMoney(enhancedData.totals.totalManualDiscounts)}</Text>
                            </View>
                        )}

                        {enhancedData.totals.bulkDiscount > 0 && (
                            <View style={styles.savingsRow}>
                                <Text style={styles.bodyText}>Bulk Discount:</Text>
                                <Text style={styles.savingsAmount}>-{formatMoney(enhancedData.totals.bulkDiscount)}</Text>
                            </View>
                        )}

                        <View style={styles.totalSavingsRow}>
                            <Text style={styles.boldText}>Total Savings:</Text>
                            <Text style={styles.totalSavingsAmount}>{formatMoney(enhancedData.totals.totalSavings)}</Text>
                        </View>
                    </View>
                    <View style={styles.dottedLine} />
                </>
            )}

            {/* Totals */}
            <View style={styles.totalsSection}>
                {enhancedData.totals.totalSavings > 0 && (
                    <View style={styles.totalRow}>
                        <Text style={styles.bodyText}>Sub Total (Before Discounts):</Text>
                        <Text style={styles.bodyText}>{formatMoney(enhancedData.totals.subtotal)}</Text>
                    </View>
                )}
                <View style={styles.totalRow}>
                    <Text style={styles.boldText}>Total (Inc. VAT):</Text>
                    <Text style={styles.boldText}>{formatMoney(enhancedData.totals.grandTotal)}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={styles.bodyText}>VAT Amount (16%):</Text>
                    <Text style={styles.bodyText}>{formatMoney(enhancedData.totals.tax)}</Text>
                </View>
            </View>

            <View style={styles.dottedLine} />

            {/* Payment Info */}
            <View style={styles.paymentSection}>
                {payments.map((payment, index) => {
                    const amount = typeof payment.TransAmount === "string"
                        ? parseFloat(payment.TransAmount)
                        : payment.TransAmount;

                    const paymentBalance = payment.balance !== undefined
                        ? (typeof payment.balance === "string" ? parseFloat(payment.balance) : payment.balance)
                        : 0;

                    const totalPaidByCustomer = amount + paymentBalance;

                    return (
                        <View key={index}>
                            <View style={styles.totalRow}>
                                <Text style={styles.bodyText}>{payment.Transtype}:</Text>
                                <Text style={styles.bodyText}>{formatMoney(amount)}</Text>
                            </View>
                            {paymentBalance > 0 && (
                                <View style={styles.totalRow}>
                                    <Text style={styles.bodyText}>Amount Paid:</Text>
                                    <Text style={styles.bodyText}>{formatMoney(totalPaidByCustomer)}</Text>
                                </View>
                            )}
                        </View>
                    );
                })}

                <View style={styles.totalRow}>
                    <Text style={styles.bodyText}>Balance:</Text>
                    <Text style={[styles.bodyText, balance < 0 && styles.negativeText]}>
                        {formatMoney(balance)}
                    </Text>
                </View>
            </View>

            {/* Special Messages */}
            {enhancedData.totals.totalSavings > 0 && (
                <>
                    <View style={styles.dottedLine} />
                    <View style={styles.savingsHighlight}>
                        <Text style={styles.savingsHighlightText}>
                            YOU SAVED {formatMoney(enhancedData.totals.totalSavings)}!
                        </Text>
                    </View>
                </>
            )}

            <View style={styles.dottedLine} />

            {/* QR Code and Control Info */}
            <View style={styles.qrSection}>
                {/* Simple, reliable conditional rendering */}
                {qrCodeUrl && qrCodeUrl.length > 50 ? (
                    <Image
                        src={qrCodeUrl}
                        style={{ width: 70, height: 70 }}
                        alt="QR Code"
                    />
                ) : (
                    <Image
                        src={dumbassShit}
                        style={styles.qrCode}
                        alt="QR Code Placeholder"
                    />
                )}

                {(data.middlewareInvoiceNumber || data.controlCode || data.qrDate) && (
                    <View style={styles.controlInfo}>
                        {data.middlewareInvoiceNumber && (
                            <Text style={styles.controlText}>Middleware: {data.middlewareInvoiceNumber}</Text>
                        )}
                        {data.controlCode && (
                            <Text style={styles.controlText}>Control: {data.controlCode}</Text>
                        )}
                        {data.qrDate && (
                            <Text style={styles.controlText}>QR Date: {data.qrDate}</Text>
                        )}
                    </View>
                )}
            </View>

            <View style={styles.dottedLine} />

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.thankYouText}>THANK YOU FOR SHOPPING!</Text>
                <Text style={styles.policyText}>NO REFUND • NO EXCHANGE</Text>
                <Text style={styles.visitText}>Visit us again!</Text>
            </View>

        </Page>
    );

    return (
        <Document>
            {/* Original Receipt */}
            <ReceiptPage isOriginal={true} />

            {/* Duplicate Copy */}
            {duplicate && <ReceiptPage isOriginal={false} />}
        </Document>
    );
};

// EXACT ORIGINAL STYLES - no changes
const styles = StyleSheet.create({
    page: {
        padding: 10,
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
    },

    // Header Styles
    header: {
        alignItems: 'center',
        marginBottom: 8,
    },
    companyName: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 2,
    },
    headerSubtext: {
        fontSize: 10,
        textAlign: 'center',
        marginBottom: 2,
    },
    duplicateText: {
        fontSize: 8,
        color: '#666',
        textAlign: 'center',
    },

    // Company Info
    companyInfo: {
        alignItems: 'center',
        marginBottom: 6,
    },

    // Dotted Line Separator
    dottedLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderStyle: 'dotted',
        marginVertical: 4,
    },

    // Transaction Info
    transactionInfo: {
        marginBottom: 6,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 1,
    },

    // Savings Section
    savingsSection: {
        marginBottom: 6,
    },
    savingsTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    savingsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 1,
    },
    savingsAmount: {
        fontSize: 8,
        color: '#228B22',
    },
    totalSavingsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 2,
        paddingTop: 2,
        borderTopWidth: 1,
        borderTopColor: '#000',
        borderStyle: 'dotted',
    },
    totalSavingsAmount: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#228B22',
    },

    // Totals Section
    totalsSection: {
        marginBottom: 6,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 1,
    },

    // Payment Section
    paymentSection: {
        marginBottom: 6,
    },

    // Savings Highlight
    savingsHighlight: {
        alignItems: 'center',
        marginBottom: 6,
    },
    savingsHighlightText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#228B22',
        textAlign: 'center',
    },

    // QR Section
    qrSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    qrContainer: {
        alignItems: 'center',
    },
    qrCode: {
        width: 50,
        height: 50,
    },
    controlInfo: {
        flex: 1,
        paddingLeft: 8,
    },
    controlText: {
        fontSize: 7,
        marginBottom: 1,
    },

    // Footer
    footer: {
        alignItems: 'center',
    },
    thankYouText: {
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 2,
    },
    policyText: {
        fontSize: 8,
        textAlign: 'center',
        marginBottom: 2,
    },
    visitText: {
        fontSize: 8,
        textAlign: 'center',
    },

    // Common Text Styles
    bodyText: {
        fontSize: 8,
    },
    boldText: {
        fontSize: 8,
        fontWeight: 'bold',
    },
    negativeText: {
        color: '#DC143C',
    },
});

export default EnhancedTransactionReceiptPDF;