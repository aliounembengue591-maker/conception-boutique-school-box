export interface SchoolBoxProduct {
  id: string
  title: string
  handle: string
  description: string
  tags: string[]
  featuredImage: {
    url: string
    altText: string | null
    width: number
    height: number
  } | null
  variant: {
    id: string
    title: string
    availableForSale: boolean
    quantityAvailable: number
  } | null
  priceXof: number
  isBestSeller: boolean
}

interface ShopifyProductsResponse {
  data?: {
    products?: {
      nodes: Array<{
        id: string
        title: string
        handle: string
        description: string
        tags: string[]
        featuredImage: SchoolBoxProduct['featuredImage']
        variants: {
          nodes: Array<{
            id: string
            title: string
            availableForSale: boolean
            quantityAvailable: number
          }>
        }
      }>
    }
  }
  errors?: Array<{ message: string }>
}

const PRODUCTS_QUERY = `
  query SchoolBoxProducts {
    products(first: 24, query: "tag:schoolbox-kit") {
      nodes {
        id
        title
        handle
        description
        tags
        featuredImage {
          url
          altText
          width
          height
        }
        variants(first: 1) {
          nodes {
            id
            title
            availableForSale
            quantityAvailable
          }
        }
      }
    }
  }
`

export async function getSchoolBoxProducts(): Promise<SchoolBoxProduct[]> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN
  const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

  if (!domain || !accessToken) {
    throw new Error('La connexion Shopify Storefront est incomplète.')
  }

  const response = await fetch(`https://${domain}/api/2025-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': accessToken,
    },
    body: JSON.stringify({ query: PRODUCTS_QUERY }),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Shopify Storefront a répondu avec le statut ${response.status}.`)
  }

  const result = (await response.json()) as ShopifyProductsResponse

  if (result.errors?.length) {
    throw new Error(result.errors.map((error) => error.message).join(' '))
  }

  return (result.data?.products?.nodes ?? [])
    .map((product) => {
      const priceTag = product.tags.find((tag) => /^prix-xof-\d+$/.test(tag))
      const priceXof = priceTag ? Number(priceTag.replace('prix-xof-', '')) : 0
      const variant = product.variants.nodes[0] ?? null

      return {
        ...product,
        variant,
        priceXof,
        isBestSeller: product.tags.includes('best-seller'),
      }
    })
    .filter((product) => product.priceXof > 0 && product.variant !== null)
    .sort((first, second) => Number(second.isBestSeller) - Number(first.isBestSeller))
}

export function formatXof(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount)
}
