const { describe, test, expect, beforeEach } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await page.goto('/')
    await request.post('/api/users', {
      data: {
        name: 'Test User',
        username: 'testuser',
        password: 'testpassword'
      }
    })
  })

  test('login form is shown', async ({ page }) => {
    const usernameInput = await page.getByTestId('username')
    const passwordInput = await page.getByTestId('password')
    const button = await page.getByRole('button', { name: 'Login' })
    await expect(usernameInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(button).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByTestId('username').fill('testuser')
      await page.getByTestId('password').fill('testpassword')
      await page.getByRole('button', { name: 'Login' }).click()

      await expect(page.getByText('Test User logged in')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByTestId('username').fill('testuser')
      await page.getByTestId('password').fill('wrongpass')
      await page.getByRole('button', { name: 'Login' }).click()

      await expect(page.getByText('Wrong username or password')).toBeVisible()
      await expect(page.getByText('Test User logged in')).not.toBeVisible()
    })
  })
})