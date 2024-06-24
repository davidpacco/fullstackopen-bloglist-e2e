const { describe, test, expect, beforeEach } = require('@playwright/test')
const { loginWith, createBlog, likeBlog } = require('./helper')

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

    describe('and a blog is created', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, {
          title: 'Testing from playwright',
          author: 'Some Author',
          url: 'www.testing.com'
        })
      })

      test('the blog can be liked', async ({ page }) => {
        await page.getByRole('button', { name: 'View' }).click()
        await expect(page.getByText('Likes 0')).toBeVisible()
        await page.getByRole('button', { name: 'Like' }).click()
        await expect(page.getByText('Likes 1')).toBeVisible()
      })

      test('the blog can be deleted', async ({ page }) => {
        await page.getByRole('button', { name: 'View' }).click()
        page.on('dialog', dialog => dialog.accept())
        await page.getByRole('button', { name: 'Remove' }).click()
        await expect(page.getByText('Testing from playwright - Some Author')).not.toBeVisible()
      })
    })
  })

  describe('When there exist multiple blogs', () => {
    beforeEach(async ({ page, request }) => {
      await request.post('/api/users', {
        data: {
          name: 'Other User',
          username: 'otheruser',
          password: 'otherpassword'
        }
      })

      await loginWith(page, 'otheruser', 'otherpassword')
      await createBlog(page, {
        title: 'Other blog #1',
        author: 'Other Author',
        url: 'www.testing.com',
      })
      await createBlog(page, {
        title: 'Other blog #2',
        author: 'Other Author',
        url: 'www.testing.com',
      })

      await page.getByRole('button', { name: 'Logout' }).click()

      await loginWith(page, 'testuser', 'testpassword')
      await createBlog(page, {
        title: 'Testing from playwright',
        author: 'Some Author',
        url: 'www.testing.com',
      })
    })

    test('only the user who added the blog sees the Remove button', async ({ page }) => {
      const notOwnBlog = await page.getByText('Other blog #1')
      await notOwnBlog.getByRole('button', { name: 'View' }).click()
      const notOwnBlogBtn = await notOwnBlog.getByRole('button', { name: 'Remove' })
      await expect(notOwnBlogBtn).not.toBeVisible()

      const ownBlog = await page.getByText('Testing from playwright')
      await ownBlog.getByRole('button', { name: 'View' }).click()
      const ownBlogBtn = await ownBlog.getByRole('button', { name: 'Remove' })
      await expect(ownBlogBtn).toBeVisible()
    })

    test('blogs are arranged in order according to likes', async ({ page }) => {
      const blogs = await page.locator('.blog').all()

      for (let blog of blogs) {
        await blog.getByRole('button', { name: 'View' }).click()
      }

      await likeBlog(page, 'Other blog #1', 1)
      await likeBlog(page, 'Other blog #2', 3)
      await likeBlog(page, 'Testing from playwright', 2)

      await expect(blogs[0].getByText('Likes 3')).toBeVisible()
      await expect(blogs[1].getByText('Likes 2')).toBeVisible()
      await expect(blogs[2].getByText('Likes 1')).toBeVisible()
    })
  })
})

