// services/product.service.js
export const getProductById = async (productId, db) => {
  const [rows] = await db
    .promise()
    .query(
      `SELECT * FROM dmac_webapp_products WHERE id = ? LIMIT 1`,
      [productId]
    )

  return rows.length ? rows[0] : null
}


export const hasLiccaSubscription = (subscriptionList) => {
  if (!subscriptionList) return false
  // subscription_list example:
  // "DMAC Online Test, LICCA Subscription, Expert Consultation"
  return subscriptionList
    .split(',')
    .map(item => item.trim().toLowerCase())
    .includes('licca subscription')
}