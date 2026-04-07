const SHOPIFY_STORE_DOMAIN = process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN ?? '';
const SHOPIFY_STOREFRONT_TOKEN =
  process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? '';

const STOREFRONT_API_VERSION = '2024-10';

const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/${STOREFRONT_API_VERSION}/graphql.json`;

async function storefront<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Storefront API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));
  }

  return json.data as T;
}

// ── Types ──────────────────────────────────────────────────────────

export type Money = { amount: string; currencyCode: string };

export type ProductImage = {
  id: string;
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: { name: string; value: string }[];
  image: ProductImage | null;
};

export type Product = {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  featuredImage: ProductImage | null;
  images: { edges: { node: ProductImage }[] };
  variants: { edges: { node: ProductVariant }[] };
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
};

export type CartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: { title: string; handle: string; featuredImage: ProductImage | null };
    price: Money;
    image: ProductImage | null;
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: Money;
    subtotalAmount: Money;
    totalTaxAmount: Money | null;
  };
  lines: { edges: { node: CartLine }[] };
};

// ── Fragments ──────────────────────────────────────────────────────

const IMAGE_FRAGMENT = `
  fragment ImageFields on Image {
    id
    url
    altText
    width
    height
  }
`;

const VARIANT_FRAGMENT = `
  fragment VariantFields on ProductVariant {
    id
    title
    availableForSale
    price { amount currencyCode }
    compareAtPrice { amount currencyCode }
    selectedOptions { name value }
    image { ...ImageFields }
  }
  ${IMAGE_FRAGMENT}
`;

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    title
    handle
    description
    descriptionHtml
    vendor
    productType
    featuredImage { ...ImageFields }
    images(first: 10) { edges { node { ...ImageFields } } }
    variants(first: 30) { edges { node { ...VariantFields } } }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
  }
  ${VARIANT_FRAGMENT}
`;

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      totalAmount { amount currencyCode }
      subtotalAmount { amount currencyCode }
      totalTaxAmount { amount currencyCode }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              product {
                title
                handle
                featuredImage { ...ImageFields }
              }
              price { amount currencyCode }
              image { ...ImageFields }
            }
          }
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

// ── Product Queries ────────────────────────────────────────────────

export type ProductSortKey = 'RELEVANCE' | 'BEST_SELLING' | 'CREATED_AT' | 'TITLE';

export type SortOption = {
  label: string;
  sortKey: ProductSortKey;
  reverse: boolean;
};

export const SORT_OPTIONS: SortOption[] = [
  { label: 'Relevant', sortKey: 'RELEVANCE', reverse: false },
  { label: 'Newest', sortKey: 'CREATED_AT', reverse: true },
  { label: 'Popular', sortKey: 'BEST_SELLING', reverse: false },
  { label: 'A–Z', sortKey: 'TITLE', reverse: false },
  { label: 'Z–A', sortKey: 'TITLE', reverse: true },
];

export async function getProducts(
  first = 20,
  cursor?: string,
  sortKey: ProductSortKey = 'RELEVANCE',
  reverse = false,
) {
  const query = `
    query Products($first: Int!, $cursor: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
      products(first: $first, after: $cursor, query: $query, sortKey: $sortKey, reverse: $reverse) {
        pageInfo { hasNextPage endCursor }
        edges { node { ...ProductFields } }
      }
    }
    ${PRODUCT_FRAGMENT}
  `;

  const data = await storefront<{
    products: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      edges: { node: Product }[];
    };
  }>(query, { first, cursor, query: 'available_for_sale:true', sortKey, reverse });

  return data.products;
}

export async function searchProducts(searchQuery: string, first = 20, cursor?: string) {
  const query = `
    query Search($query: String!, $first: Int!, $cursor: String) {
      search(query: $query, first: $first, after: $cursor, types: PRODUCT) {
        pageInfo { hasNextPage endCursor }
        edges {
          node {
            ... on Product { ...ProductFields }
          }
        }
      }
    }
    ${PRODUCT_FRAGMENT}
  `;

  const data = await storefront<{
    search: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      edges: { node: Product }[];
    };
  }>(query, { query: searchQuery, first, cursor });

  return data.search;
}

export async function getProductByHandle(handle: string) {
  const query = `
    query ProductByHandle($handle: String!) {
      productByHandle(handle: $handle) { ...ProductFields }
    }
    ${PRODUCT_FRAGMENT}
  `;

  const data = await storefront<{ productByHandle: Product | null }>(query, { handle });
  return data.productByHandle;
}

// ── Cart Mutations ─────────────────────────────────────────────────

export async function createCart(lines: { merchandiseId: string; quantity: number }[]) {
  const query = `
    mutation CartCreate($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
    ${CART_FRAGMENT}
  `;

  const data = await storefront<{
    cartCreate: { cart: Cart; userErrors: { field: string; message: string }[] };
  }>(query, { lines });

  if (data.cartCreate.userErrors.length > 0) {
    throw new Error(data.cartCreate.userErrors.map((e) => e.message).join(', '));
  }

  return data.cartCreate.cart;
}

export async function addCartLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
) {
  const query = `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
    ${CART_FRAGMENT}
  `;

  const data = await storefront<{
    cartLinesAdd: { cart: Cart; userErrors: { field: string; message: string }[] };
  }>(query, { cartId, lines });

  if (data.cartLinesAdd.userErrors.length > 0) {
    throw new Error(data.cartLinesAdd.userErrors.map((e) => e.message).join(', '));
  }

  return data.cartLinesAdd.cart;
}

export async function updateCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[],
) {
  const query = `
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
    ${CART_FRAGMENT}
  `;

  const data = await storefront<{
    cartLinesUpdate: { cart: Cart; userErrors: { field: string; message: string }[] };
  }>(query, { cartId, lines });

  if (data.cartLinesUpdate.userErrors.length > 0) {
    throw new Error(data.cartLinesUpdate.userErrors.map((e) => e.message).join(', '));
  }

  return data.cartLinesUpdate.cart;
}

export async function removeCartLines(cartId: string, lineIds: string[]) {
  const query = `
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
    ${CART_FRAGMENT}
  `;

  const data = await storefront<{
    cartLinesRemove: { cart: Cart; userErrors: { field: string; message: string }[] };
  }>(query, { cartId, lineIds });

  if (data.cartLinesRemove.userErrors.length > 0) {
    throw new Error(data.cartLinesRemove.userErrors.map((e) => e.message).join(', '));
  }

  return data.cartLinesRemove.cart;
}

// ── Helpers ────────────────────────────────────────────────────────

export function formatPrice(money: Money): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currencyCode,
  }).format(parseFloat(money.amount));
}
