import { SubscriptionPlan } from "@/types/pricing-plan";

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "starter_monthly",
    priceId: process.env.NEXT_PUBLIC_STARTER_MONTHLY_PRICE_ID || "",
    type: "starter",
    name: "Starter",
    interval: "monthly",
    price: 9,
    description: "For startups & side projects",
  },
  {
    id: "team_monthly",
    priceId: process.env.NEXT_PUBLIC_TEAM_MONTHLY_PRICE_ID || "",
    type: "team",
    name: "Team",
    interval: "monthly",
    price: 29,
    description: "For startups & side projects",
  },
  {
    id: "business_monthly",
    priceId: process.env.NEXT_PUBLIC_BUSINESS_MONTHLY_PRICE_ID || "",
    type: "business",
    name: "Business",
    interval: "monthly",
    price: 99,
    description: "For startups & side projects",
    isPopular: true,
  },
  {
    id: "enterprise_monthly",
    priceId: process.env.NEXT_PUBLIC_ENTERPRISE_MONTHLY_PRICE_ID || "",
    type: "enterprise",
    name: "Enterprise",
    interval: "monthly",
    price: 699,
    description: "For startups & side projects",
  },
  {
    id: "starter_annually",
    priceId: process.env.NEXT_PUBLIC_STARTER_YEARLY_PRICE_ID || "",
    type: "starter",
    name: "Starter",
    interval: "annually",
    price: 90,
    description: "For startups & side projects",
  },
  {
    id: "team_annually",
    priceId: process.env.NEXT_PUBLIC_TEAM_YEARLY_PRICE_ID || "",
    type: "team",
    name: "Team",
    interval: "annually",
    price: 290,
    description: "For startups & side projects",
  },
  {
    id: "business_annually",
    priceId: process.env.NEXT_PUBLIC_BUSINESS_YEARLY_PRICE_ID || "",
    type: "business",
    name: "Business",
    interval: "annually",
    price: 990,
    description: "For startups & side projects",
    isPopular: true,
  },
  {
    id: "enterprise_annually",
    priceId: process.env.NEXT_PUBLIC_ENTERPRISE_YEARLY_PRICE_ID || "",
    type: "enterprise",
    name: "Enterprise",
    interval: "annually",
    price: 6990,
    description: "For startups & side projects",
  },
];
