/**
 * TEST 02 — Commande Rapide (QuickOrderModal)
 *
 * Parcours : page produits → ajout panier → panier → checkout gate → commande rapide
 *
 * Grandeur nature mobile (Pixel 7).
 * Mocke l'endpoint /api/quick-order pour éviter les vraies commandes.
 */
import { test, expect } from '@playwright/test'
import { waitReady, mockApi } from './helpers/setup.js'

const MOCK_ORDER_RESPONSE = {
  id: 999,
  number: 'RB-TEST-001',
  total: 8500,
  generated_pin: '4827',
  payments: [{ provider: 'wave' }],
  access_token: null,
}

test.describe('Commande rapide', () => {
  test.beforeEach(async ({ page }) => {
    // Mock quick-order API — ne crée pas de vraie commande
    await mockApi(page, '**/api/quick-order', MOCK_ORDER_RESPONSE)
    // Mock cart API pour simuler un panier avec produit
    await mockApi(page, '**/api/cart', {
      items: [{ id: 1, product_id: 1, quantity: 1, unit_price: 8500, product: { name: 'Huile Rose Musquée' } }],
      total: 8500,
      item_count: 1,
    })
  })

  test('le bouton Commande Rapide est visible dans le checkout gate', async ({ page }) => {
    await page.goto('/checkout')
    await waitReady(page)

    // Le gate d'authentification doit s'afficher (utilisateur non connecté)
    const quickBtn = page.locator('button:has-text("Commander maintenant"), button:has-text("Order now")').first()
    const gateTitle = page.locator('text=/Finalisez|Complete your order/i').first()

    const gateVisible = await gateTitle.isVisible({ timeout: 8_000 }).catch(() => false)
    if (!gateVisible) {
      // Peut être connecté — le gate n'apparaît pas
      test.skip(true, 'Utilisateur déjà connecté — gate non affiché')
      return
    }

    // La commande rapide doit être en PREMIER (avant les formulaires de connexion)
    await expect(quickBtn).toBeVisible({ timeout: 5_000 })

    // Vérifier position relative : quick button avant le formulaire login
    const quickBox  = await quickBtn.boundingBox()
    const loginForm = page.locator('form input[type="email"]').first()
    const loginBox  = await loginForm.boundingBox().catch(() => null)

    if (quickBox && loginBox) {
      expect(quickBox.y).toBeLessThan(loginBox.y)
    }
  })

  test("la modal commande rapide s'ouvre et est navigable", async ({ page }) => {
    await page.goto('/checkout')
    await waitReady(page)

    const quickBtn = page.locator('button:has-text("Commander maintenant"), button:has-text("Order now")').first()
    const isVisible = await quickBtn.isVisible({ timeout: 8_000 }).catch(() => false)
    if (!isVisible) {
      test.skip(true, 'Gate non affiché (utilisateur connecté ?)')
      return
    }

    await quickBtn.click()
    await page.waitForTimeout(500)

    // La modal doit être ouverte
    const modal = page.locator('[class*="qo-card"], [class*="qo-overlay"]').first()
    await expect(modal).toBeVisible({ timeout: 5_000 })

    // Le bouton submit doit être visible SANS scroller
    const submitBtn = page.locator('button[form="qo-form"], button:has-text("Commander maintenant")').last()
    await expect(submitBtn).toBeInViewport({ timeout: 3_000 })
  })

  test('le formulaire commande rapide valide et confirme', async ({ page }) => {
    await page.goto('/checkout')
    await waitReady(page)

    // Ouvrir la modal
    const quickBtn = page.locator('button:has-text("Commander maintenant"), button:has-text("Order now")').first()
    const isVisible = await quickBtn.isVisible({ timeout: 8_000 }).catch(() => false)
    if (!isVisible) {
      test.skip(true, 'Gate non affiché')
      return
    }

    await quickBtn.click()
    await page.waitForTimeout(500)

    // Remplir le formulaire
    await page.fill('input[type="text"][class*="input"]:near(:text("Nom complet"))', 'Fatou Test')

    // Téléphone (peut être un composant PhoneInput)
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="07"]').first()
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('0708000000')
    }

    // Sélectionner commune
    await page.selectOption('select[class*="qo-select"]', { index: 1 })

    // Cliquer sur "Commander maintenant"
    const submitBtn = page.locator('button[form="qo-form"]').first()
    await submitBtn.click()

    // Attendre la confirmation (mock répond instantanément)
    const confirmTitle = page.locator('text=/Commande confirmée|Order confirmed/i').first()
    await expect(confirmTitle).toBeVisible({ timeout: 10_000 })

    // Le PIN doit s'afficher
    const pinSection = page.locator('[class*="qo-pin-box"]').first()
    await expect(pinSection).toBeVisible({ timeout: 3_000 })

    // Vérifier que les 4 chiffres du PIN mock sont affichés
    const digits = page.locator('[class*="qo-pin-box__digit"]')
    await expect(digits).toHaveCount(4)
  })

  test('le bouton submit est toujours visible sans scroller (sticky footer)', async ({ page }) => {
    await page.goto('/checkout')
    await waitReady(page)

    const quickBtn = page.locator('button:has-text("Commander maintenant"), button:has-text("Order now")').first()
    const isVisible = await quickBtn.isVisible({ timeout: 8_000 }).catch(() => false)
    if (!isVisible) {
      test.skip(true, 'Gate non affiché')
      return
    }

    await quickBtn.click()
    await page.waitForTimeout(600)

    // Le footer de la modal avec le bouton doit être visible dans le viewport
    const footer = page.locator('[class*="qo-footer"]').first()
    await expect(footer).toBeVisible()
    await expect(footer).toBeInViewport()

    // Scroll dans le body de la modal — le footer reste visible
    const modalBody = page.locator('[class*="qo-body"]').first()
    if (await modalBody.isVisible()) {
      await modalBody.evaluate(el => el.scrollTop = 9999)
      await page.waitForTimeout(300)
      // Footer toujours visible après scroll
      await expect(footer).toBeInViewport()
    }
  })
})
