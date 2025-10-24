export const normalizeFinancialCategories = (categories) => {
  if (!categories) return []

  if (Array.isArray(categories)) {
    return categories
      .map((category) => {
        if (!category || typeof category !== 'object') return null
        const { name } = category
        const rawValue =
          typeof category.total === 'number'
            ? category.total
            : typeof category.value === 'number'
              ? category.value
              : typeof category.amount === 'number'
                ? category.amount
                : null

        if (!name || typeof rawValue !== 'number') return null

        return { name, value: Math.abs(rawValue) }
      })
      .filter(Boolean)
  }

  if (typeof categories === 'object' && categories !== null) {
    return Object.entries(categories)
      .map(([name, details]) => {
        if (!name) return null

        const rawValue = (() => {
          if (typeof details === 'number') return details
          if (!details || typeof details !== 'object') return null
          if (typeof details.total_amount === 'number') return details.total_amount
          if (typeof details.total === 'number') return details.total
          if (typeof details.value === 'number') return details.value
          if (typeof details.amount === 'number') return details.amount
          return null
        })()

        if (typeof rawValue !== 'number') return null

        return { name, value: Math.abs(rawValue) }
      })
      .filter(Boolean)
  }

  return []
}
