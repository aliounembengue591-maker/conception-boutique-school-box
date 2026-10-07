import SchoolBoxStorefront from '@/components/school-box-storefront'
import { getSchoolBoxProducts } from '@/lib/shopify'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const products = await getSchoolBoxProducts()
  return <SchoolBoxStorefront products={products} />
}
