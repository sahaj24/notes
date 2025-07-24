/**
 * PayPal Pricing Configuration
 * Centralized configuration for all PayPal pricing tiers and settings
 */

// PayPal Configuration
export const PAYPAL_CONFIG = {
    // Production Client ID
    CLIENT_ID: "BAAxRFSP8kAHMTn1JreZMzW1dhoxQa9-5Bifrq6aDyjG4fNy6XmEuGAHIotM_ygJQM1YsLLXVFmzDxIvts",

    // Hosted Button IDs
    HOSTED_BUTTON_ID_499: "D65N4BSG3Z5SN",  // $4.99/100 coins (NEW PROD)
    HOSTED_BUTTON_ID_1999: "7J863KLHPCGS8", // $19.99/500 coins
    HOSTED_BUTTON_ID_5999: "9JZDUR4NLRZJY", // $59.99/1500 coins

    // PayPal SDK URL
    SDK_URL: "https://www.paypal.com/sdk/js",

    // Currency
    CURRENCY: "USD",

    // Environment
    ENVIRONMENT: "production",
} as const;

// Pricing Tiers Configuration
export const PRICING_TIERS = {
    FREE: {
        id: "free",
        name: "Free",
        description: "Try before you buy",
        price: 0,
        priceDisplay: "$0",
        period: "forever",
        coins: 10,
        pages: 10,
        features: [
            "10 free coins",
            "Generate up to 10 pages",
            "All note formats",
            "No credit card required"
        ],
        buttonText: "Get started free",
        buttonLink: "/signup",
        isPayPal: false,
        isHighlighted: false,
    },

    STARTER: {
        id: "starter",
        name: "100 Coins",
        description: "Perfect for getting started",
        price: 4.99,
        priceDisplay: "$4.99",
        period: "one-time payment",
        coins: 100,
        pages: 100,
        features: [
            "100 coins total",
            "Generate up to 100 pages",
            "All note formats",
            "PDF export"
        ],
        buttonText: "Pay Now",
        isPayPal: true,
        isHighlighted: false,
        paypalConfig: {
            hostedButtonId: PAYPAL_CONFIG.HOSTED_BUTTON_ID_499,
            amount: "4.99",
            coins: 100,
            tier: "starter"
        }
    },

    PRO: {
        id: "pro",
        name: "500 Coins",
        description: "For students and professionals",
        price: 19.99,
        priceDisplay: "$19.99",
        period: "one-time payment",
        coins: 500,
        pages: 500,
        features: [
            "500 coins total",
            "Generate up to 500 pages",
            "All note formats",
            "PDF export",
            "Priority support"
        ],
        buttonText: "Pay Now",
        isPayPal: true, // Enable $19.99 hosted button
        isHighlighted: true,
        badge: "Best Value",
        paypalConfig: {
            hostedButtonId: PAYPAL_CONFIG.HOSTED_BUTTON_ID_1999,
            amount: "19.99",
            coins: 500,
            tier: "pro"
        }
    },

    ENTERPRISE: {
        id: "enterprise",
        name: "1500 Coins",
        description: "For power users and teams",
        price: 59.99,
        priceDisplay: "$59.99",
        period: "one-time payment",
        coins: 1500,
        pages: 1500,
        features: [
            "1500 coins total",
            "Generate up to 1500 pages",
            "All note formats",
            "PDF export",
            "Priority support"
        ],
        buttonText: "Pay Now",
        isPayPal: true, // Enable $59.99 hosted button
        isHighlighted: false,
        paypalConfig: {
            hostedButtonId: PAYPAL_CONFIG.HOSTED_BUTTON_ID_5999,
            amount: "59.99",
            coins: 1500,
            tier: "enterprise"
        }
    }
} as const;

// Helper functions
export const getPricingTier = (tierId: keyof typeof PRICING_TIERS) => {
    return PRICING_TIERS[tierId];
};

export const getAllPricingTiers = () => {
    return Object.values(PRICING_TIERS);
};

export const getPayPalTiers = () => {
    return Object.values(PRICING_TIERS).filter(tier => tier.isPayPal);
};

export const getPayPalSDKUrl = () => {
    return `${PAYPAL_CONFIG.SDK_URL}?client-id=${PAYPAL_CONFIG.CLIENT_ID}&components=hosted-buttons&disable-funding=venmo&currency=${PAYPAL_CONFIG.CURRENCY}`;
};

// Type definitions
export type PricingTier = typeof PRICING_TIERS[keyof typeof PRICING_TIERS];
export type PayPalConfig = {
    hostedButtonId?: string;
    planId?: string;
    amount: string;
    coins: number;
    tier: string;
};

// Validation functions
export const validatePayPalConfig = (config: PayPalConfig): boolean => {
    return !!(config.planId && config.amount && config.coins && config.tier);
};

export const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
};

export const formatCoins = (coins: number): string => {
    return `${coins.toLocaleString()} coins`;
};

// Constants for API calls
export const API_ENDPOINTS = {
    UPGRADE: "/api/user/upgrade",
    PROFILE: "/api/user/profile",
    COINS: "/api/user/coins"
} as const;

// Payment method types
export const PAYMENT_METHODS = {
    PAYPAL: "paypal",
    STRIPE: "stripe", // For future use
    DIRECT: "direct"
} as const;

export default {
    PAYPAL_CONFIG,
    PRICING_TIERS,
    getPricingTier,
    getAllPricingTiers,
    getPayPalTiers,
    getPayPalSDKUrl,
    validatePayPalConfig,
    formatPrice,
    formatCoins,
    API_ENDPOINTS,
    PAYMENT_METHODS
};