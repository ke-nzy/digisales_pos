/**
 * Discount Service - Manages discount rules fetching and caching
 * Located at: hawk-tuah/services/discount-service.ts
 * 
 * Handles:
 * - Fetching discount rules from backend
 * - Periodic refresh during shift
 * - Caching for performance
 * - Error handling and fallbacks
 */

import axios from 'axios';
import { DiscountRule, DiscountRulesResponse, DiscountServiceState } from '../types/discount-types';

export class DiscountService {
    private static instance: DiscountService;
    private state: DiscountServiceState = {
        rules: [],
        last_updated: null,
        is_loading: false,
        error: null
    };

    private refreshInterval: NodeJS.Timeout | null = null;
    private readonly REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
    private readonly MAX_RETRIES = 3;

    // Singleton pattern for global discount management
    public static getInstance(): DiscountService {
        if (!DiscountService.instance) {
            DiscountService.instance = new DiscountService();
        }
        return DiscountService.instance;
    }

    /**
     * Initialize discount service - call this when user starts shift
     */
    public async initialize(
        site_url: string,
        company_prefix: string,
        branch_code: string
    ): Promise<void> {
        console.log('🎯 Initializing Discount Service...');

        // Initial fetch
        await this.fetchDiscountRules(site_url, company_prefix, branch_code);

        // Set up periodic refresh
        this.startPeriodicRefresh(site_url, company_prefix, branch_code);
    }

    /**
     * Fetch discount rules from backend
     */
    public async fetchDiscountRules(
        site_url: string,
        company_prefix: string,
        branch_code: string,
        retryCount = 0
    ): Promise<DiscountRule[]> {

        this.state.is_loading = true;
        this.state.error = null;

        try {
            console.log(`🔄 Fetching discount rules for branch: ${branch_code}`);

            const form_data = new FormData();
            form_data.append("tp", "getBranchDiscounts"); // TODO: Confirm parameter name
            form_data.append("cp", company_prefix);
            form_data.append("branch_code", branch_code);

            const response = await axios.postForm<DiscountRulesResponse>(
                `${site_url}process.php`,
                form_data,
            );

            if (response.data.status === "SUCCESS") {
                this.state.rules = response.data.data;
                this.state.last_updated = new Date();
                this.state.is_loading = false;

                console.log(`✅ Loaded ${this.state.rules.length} discount rules`);
                this.logDiscountRulesSummary();

                return this.state.rules;
            } else {
                throw new Error(`Backend returned non-success status: ${response.data.status}`);
            }

        } catch (error) {
            console.error('❌ Failed to fetch discount rules:', error);

            // Retry logic
            if (retryCount < this.MAX_RETRIES) {
                console.log(`🔄 Retrying... (${retryCount + 1}/${this.MAX_RETRIES})`);
                await this.delay(1000 * (retryCount + 1)); // Exponential backoff
                return this.fetchDiscountRules(site_url, company_prefix, branch_code, retryCount + 1);
            }

            this.state.error = error instanceof Error ? error.message : 'Unknown error';
            this.state.is_loading = false;

            // Return empty array on final failure (system continues working)
            return [];
        }
    }

    /**
     * Get discount rules by type
     */
    public getDiscountRules(type?: 'item' | 'category' | 'bulk'): DiscountRule[] {
        if (!type) return this.state.rules;
        return this.state.rules.filter(rule => rule.discount_type === type);
    }

    /**
     * Find applicable item discount
     */
    public findItemDiscount(item_id: string, price: number): DiscountRule | null {
        const itemDiscounts = this.getDiscountRules('item');

        return itemDiscounts.find(rule =>
            rule.item_id === item_id &&
            price >= rule.lower_limit &&
            price <= rule.upper_limit
        ) || null;
    }

    /**
     * Find applicable category discount
     */
    public findCategoryDiscount(category_id: string, price: number): DiscountRule | null {
        const categoryDiscounts = this.getDiscountRules('category');

        return categoryDiscounts.find(rule =>
            rule.category_id === category_id &&
            price >= rule.lower_limit &&
            price <= rule.upper_limit
        ) || null;
    }

    /**
     * Find applicable bulk discount for cart total
     */
    public findBulkDiscount(cart_total: number): DiscountRule | null {
        const bulkDiscounts = this.getDiscountRules('bulk');

        // Find the best bulk discount (highest percentage within range)
        let bestDiscount: DiscountRule | null = null;

        for (const rule of bulkDiscounts) {
            if (cart_total >= rule.lower_limit && cart_total <= rule.upper_limit) {
                if (!bestDiscount || rule.discount_percent > bestDiscount.discount_percent) {
                    bestDiscount = rule;
                }
            }
        }

        return bestDiscount;
    }

    /**
     * Get current service state
     */
    public getState(): DiscountServiceState {
        return { ...this.state };
    }

    /**
     * Start periodic refresh during shift
     */
    private startPeriodicRefresh(
        site_url: string,
        company_prefix: string,
        branch_code: string
    ): void {

        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.refreshInterval = setInterval(async () => {
            console.log('🔄 Periodic discount rules refresh...');
            await this.fetchDiscountRules(site_url, company_prefix, branch_code);
        }, this.REFRESH_INTERVAL);
    }

    /**
     * Stop periodic refresh - call this when shift ends
     */
    public stopPeriodicRefresh(): void {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
            console.log('⏹️ Stopped discount rules periodic refresh');
        }
    }

    /**
     * Clear all cached data
     */
    public clearCache(): void {
        this.state = {
            rules: [],
            last_updated: null,
            is_loading: false,
            error: null
        };
        this.stopPeriodicRefresh();
        console.log('🧹 Discount service cache cleared');
    }

    /**
     * Utility methods
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private logDiscountRulesSummary(): void {
        const summary = {
            total: this.state.rules.length,
            item: this.getDiscountRules('item').length,
            category: this.getDiscountRules('category').length,
            bulk: this.getDiscountRules('bulk').length
        };

        console.log('📊 Discount Rules Summary:', summary);
    }
}

// Export singleton instance for easy import
export const discountService = DiscountService.getInstance();