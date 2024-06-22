const { describe, test, expect, beforeEach } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('login form is shown', async ({ page }) => {
    const usernameInput = await page.getByTestId('username')
    const passwordInput = await page.getByTestId('password')
    const button = await page.getByRole('button', { name: 'Login' })
    await expect(usernameInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(button).toBeVisible()
  })
})