import { test, expect } from '@playwright/test'
import { normalizeFinancialCategories } from '../src/utils/normalizeFinancialCategories.js'

test.describe('normalizeFinancialCategories helper', () => {
  test('supports array payloads with different value keys', () => {
    const categories = [
      { name: 'Receitas', total: 1500 },
      { name: 'Despesas', value: -500 },
      { name: 'Investimentos', amount: 250 }
    ]

    expect(normalizeFinancialCategories(categories)).toEqual([
      { name: 'Receitas', value: 1500 },
      { name: 'Despesas', value: 500 },
      { name: 'Investimentos', value: 250 }
    ])
  })

  test('supports keyed object payloads with numeric values or objects', () => {
    const categories = {
      receitas: { total_amount: 2000 },
      despesas: { total: -750 },
      impostos: { value: 300 },
      investimentos: { amount: 125 },
      outros: 100
    }

    expect(normalizeFinancialCategories(categories)).toEqual([
      { name: 'receitas', value: 2000 },
      { name: 'despesas', value: 750 },
      { name: 'impostos', value: 300 },
      { name: 'investimentos', value: 125 },
      { name: 'outros', value: 100 }
    ])
  })

  test('filters out invalid entries', () => {
    const categories = [
      null,
      { name: 'Sem Valor' },
      { total: 200 },
      { name: 'Com Texto', value: 'invalid' }
    ]

    expect(normalizeFinancialCategories(categories)).toEqual([])
  })
})
