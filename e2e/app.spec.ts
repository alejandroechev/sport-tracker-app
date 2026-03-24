import { test, expect } from '@playwright/test'

test.describe('Live Page', () => {
  test('shows heading and events', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Live Events')).toBeVisible()
  })
})

test.describe('Bottom Navigation', () => {
  test('navigates between all tabs', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: /sports/i }).click()
    await expect(page).toHaveURL(/\/sports/)

    await page.getByRole('link', { name: /settings/i }).click()
    await expect(page).toHaveURL(/\/settings/)

    await page.getByRole('link', { name: /live/i }).click()
    await expect(page).toHaveURL('/')
  })
})

test.describe('Sports Categories', () => {
  test('shows sport categories', async ({ page }) => {
    await page.goto('/sports')
    await expect(page.getByText('Football')).toBeVisible()
    await expect(page.getByText('Formula 1')).toBeVisible()
    await expect(page.getByText('Tennis')).toBeVisible()
  })

  test('expands a sport to show competitions', async ({ page }) => {
    await page.goto('/sports')
    await page.getByText('Football').click()
    await expect(page.getByText('Premier League')).toBeVisible()
  })
})

test.describe('Competition Detail', () => {
  test('navigates to a competition from categories', async ({ page }) => {
    await page.goto('/sports')
    await page.getByText('Football').click()
    await page.getByText('Premier League').click()
    await expect(page).toHaveURL(/\/sports\/premier-league/)
    await expect(page.getByRole('button', { name: 'Standings' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Upcoming' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Live' })).toBeVisible()
  })

  test('tabs switch content', async ({ page }) => {
    await page.goto('/sports/premier-league')
    // Default tab is Standings
    await expect(page.getByText('Standings')).toBeVisible()

    await page.getByRole('button', { name: /upcoming/i }).click()
    await expect(page.getByText('Upcoming')).toBeVisible()

    await page.getByRole('button', { name: /^live$/i }).click()
    await expect(page.getByRole('button', { name: /^live$/i })).toBeVisible()
  })
})

test.describe('Settings Page', () => {
  test('shows API configuration section', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByText('API Configuration')).toBeVisible()
  })

  test('allows saving an API key', async ({ page }) => {
    await page.goto('/settings')
    const input = page.getByPlaceholder(/api key/i)
    await input.fill('test-api-key-123')
    await page.getByRole('button', { name: /save/i }).click()
    // Verify save confirmation
    await expect(page.getByText(/saved/i)).toBeVisible()
  })
})
