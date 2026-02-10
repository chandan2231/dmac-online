// services/product.service.js
export const getProductById = async (productId, db) => {
  const [rows] = await db
    .promise()
    .query(`SELECT * FROM dmac_webapp_products WHERE id = ? LIMIT 1`, [
      productId
    ])

  return rows.length ? rows[0] : null
}

export const getUserLatestCompletedProduct = async (userId, db) => {
  const [rows] = await db.promise().query(
    `
      SELECT
        t.product_id,
        p.product_amount,
        p.upgrade_priority
      FROM dmac_webapp_users_transaction t
      INNER JOIN dmac_webapp_products p
        ON p.id = t.product_id
      WHERE t.user_id = ?
        AND t.status = 'COMPLETED'
      ORDER BY t.created_date DESC
      LIMIT 1
      `,
    [userId]
  )

  return rows.length ? rows[0] : null
}

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export const computeUpgradeCharge = ({ currentProduct, targetProduct }) => {
  const currentAmount = toNumberOrNull(currentProduct?.product_amount) ?? 0
  const targetAmount = toNumberOrNull(targetProduct?.product_amount) ?? 0

  const currentPriority = toNumberOrNull(currentProduct?.upgrade_priority)
  const targetPriority = toNumberOrNull(targetProduct?.upgrade_priority)

  const hasPriority =
    currentPriority !== null &&
    targetPriority !== null &&
    Number.isFinite(currentPriority) &&
    Number.isFinite(targetPriority)

  // Convention: smaller upgrade_priority = higher tier.
  // Fallback: higher product_amount = higher tier.
  const isHigherTier = hasPriority
    ? targetPriority < currentPriority
    : targetAmount > currentAmount

  if (!isHigherTier) {
    return {
      allowed: false,
      reason: 'UPGRADE_NOT_ALLOWED',
      amountToCharge: null,
      isUpgrade: Boolean(currentProduct)
    }
  }

  const amountToCharge = Number((targetAmount - currentAmount).toFixed(2))
  if (!Number.isFinite(amountToCharge) || amountToCharge <= 0) {
    return {
      allowed: false,
      reason: 'INVALID_UPGRADE_AMOUNT',
      amountToCharge: null,
      isUpgrade: Boolean(currentProduct)
    }
  }

  return {
    allowed: true,
    reason: null,
    amountToCharge,
    isUpgrade: Boolean(currentProduct),
    upgradeFromProductId: currentProduct?.product_id ?? null,
    fullProductAmount: targetAmount,
    currentProductAmount: currentAmount
  }
}

export const hasLiccaSubscription = (subscriptionList) => {
  if (!subscriptionList) return false
  // subscription_list example:
  // "DMAC Online Test, LICCA Subscription, Expert Consultation"
  return subscriptionList
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .includes('licca subscription')
}
