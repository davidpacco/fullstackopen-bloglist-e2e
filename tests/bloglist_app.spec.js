const { describe, test, expect, beforeEach } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

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
      await loginWith(page, 'testuser', 'testpassword')

      await expect(page.getByText('Test User logged in')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'testuser', 'wrongpass')

      await expect(page.getByText('Wrong username or password')).toBeVisible()
      await expect(page.getByText('Test User logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'testuser', 'testpassword')
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, {
        title: 'Testing from playwright',
        author: 'Some Author',
        url: 'www.testing.com'
      })

      const notification = await page.locator('.notification')

      await expect(notification).toContainText('Testing from playwright by Some Author added')
      await expect(page.getByText('Testing from playwright - Some Author')).toBeVisible()
      await expect(page.getByRole('button', { name: 'View' })).toBeVisible()
    })
  })
})