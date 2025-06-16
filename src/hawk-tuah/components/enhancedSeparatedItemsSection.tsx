/**
 * Enhanced Separated Items Section Component
 * Located at: hawk-tuah/components/enhancedSeparatedItemsSection.tsx
 * 
 * MINIMAL separation - just separates bags from other items
 * Uses EXACT original formatting and styling - no changes whatsoever
 */

import React from "react";
import {
    Text,
    View,
    StyleSheet,
} from "@react-pdf/renderer";
import { formatMoney } from "../utils/formatters";

// Enhanced item interface matching your current structure
interface EnhancedReceiptItem {
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
}

interface EnhancedSeparatedItemsSectionProps {
    items: EnhancedReceiptItem[];
    showDiscounts?: boolean;
    className?: string;
}

/**
 * Component to render items separated by category - MINIMAL changes
 * Just separates bags (CR0001, CR0002) from other items
 * Everything else stays EXACTLY the same as original
 */
export const EnhancedSeparatedItemsSection: React.FC<EnhancedSeparatedItemsSectionProps> = ({
    items,
    showDiscounts = true
}) => {
    // Configuration for item separation
    const BAG_ITEM_IDS = ["CR0001", "CR0002"];

    /**
     * Separate items into bags and other items based on item IDs
     */
    const separateItems = () => {
        const bags = items.filter(item => BAG_ITEM_IDS.includes(item.id));
        const otherItems = items.filter(item => !BAG_ITEM_IDS.includes(item.id));

        return { bags, otherItems };
    };

    const { bags, otherItems } = separateItems();

    return (
        <View style={styles.container}>
            {/* Items Header - EXACT original */}
            <View style={styles.itemsHeader}>
                <Text style={styles.headerText}>ITEM    QTY    DESCRIPTION            COST</Text>
            </View>

            {/* Items List - EXACT original rendering */}
            <View style={styles.itemsList}>
                {/* Other Items First */}
                {otherItems.map((item, index) => (
                    <View key={item.id} style={styles.itemContainer}>
                        <View style={styles.itemRow}>
                            <Text style={styles.itemCode}>{index + 1}</Text>
                            <Text style={styles.itemQty}>{item.quantity}</Text>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemPrice}>{formatMoney(item.finalPrice)}</Text>
                        </View>

                        {item.hasDiscount && (
                            <View style={styles.discountRow}>
                                <Text style={styles.originalPriceText}>
                                    Original: {formatMoney(item.originalPrice)}
                                </Text>
                                <Text style={styles.savingsText}>
                                    Saved: {formatMoney(item.totalDiscount)}
                                </Text>
                            </View>
                        )}

                        <View style={styles.itemTotalRow}>
                            <Text style={styles.itemTotal}>
                                Total: {formatMoney(item.lineTotal)}
                            </Text>
                        </View>
                    </View>
                ))}

                {/* Simple separator if both sections exist */}
                {otherItems.length > 0 && bags.length > 0 && (
                    <View style={styles.dottedLine} />
                )}

                {/* Bags Section */}
                {bags.map((item, index) => (
                    <View key={item.id} style={styles.itemContainer}>
                        <View style={styles.itemRow}>
                            <Text style={styles.itemCode}>{otherItems.length + index + 1}</Text>
                            <Text style={styles.itemQty}>{item.quantity}</Text>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemPrice}>{formatMoney(item.finalPrice)}</Text>
                        </View>

                        {item.hasDiscount && (
                            <View style={styles.discountRow}>
                                <Text style={styles.originalPriceText}>
                                    Original: {formatMoney(item.originalPrice)}
                                </Text>
                                <Text style={styles.savingsText}>
                                    Saved: {formatMoney(item.totalDiscount)}
                                </Text>
                            </View>
                        )}

                        <View style={styles.itemTotalRow}>
                            <Text style={styles.itemTotal}>
                                Total: {formatMoney(item.lineTotal)}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

/**
 * EXACT original styles - no changes at all
 */
const styles = StyleSheet.create({
    container: {
        // No styles needed here
    },

    // Items Section - EXACT original
    itemsHeader: {
        marginBottom: 4,
    },
    headerText: {
        fontSize: 8,
        fontWeight: 'bold',
    },
    itemsList: {
        marginBottom: 6,
    },
    itemContainer: {
        marginBottom: 6,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    itemCode: {
        fontSize: 8,
        width: '8%',
    },
    itemQty: {
        fontSize: 8,
        width: '8%',
        textAlign: 'center',
    },
    itemName: {
        fontSize: 8,
        width: '60%',
        flexWrap: 'wrap',
    },
    itemPrice: {
        fontSize: 8,
        width: '24%',
        textAlign: 'right',
    },
    discountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 1,
        paddingLeft: '16%',
    },
    originalPriceText: {
        fontSize: 7,
        color: '#666',
        textDecoration: 'line-through',
    },
    savingsText: {
        fontSize: 7,
        color: '#228B22',
        fontWeight: 'bold',
    },
    itemTotalRow: {
        alignItems: 'flex-end',
        marginTop: 1,
    },
    itemTotal: {
        fontSize: 8,
        fontWeight: 'bold',
    },

    // Only ONE addition - simple dotted line separator
    dottedLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderStyle: 'dotted',
        marginVertical: 4,
    },
});

export default EnhancedSeparatedItemsSection;