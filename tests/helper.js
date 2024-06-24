const loginWith = async (page, username, password) => {
  await page.getByTestId('username').fill(username)
  await page.getByTestId('password').fill(password)
  await page.getByRole('button', { name: 'Login' }).click()
}

const createBlog = async (page, data) => {
  await page.getByRole('button', { name: 'New blog' }).click()
  await page.getByTestId('title').fill(data.title)
  await page.getByTestId('author').fill(data.author)
  await page.getByTestId('url').fill(data.url)
  await page.getByRole('button', { name: 'Create' }).click()
  await page.getByText(`${data.title} - ${data.author}`).waitFor()
}

const likeBlog = async (page, title, numOfLikes) => {
  for (let i = 0; i < numOfLikes; i++) {
    const blog = await page.getByText(title)
    await blog.getByRole('button', { name: 'Like' }).click()
    await blog.getByText(`Likes ${i + 1}`).waitFor()
  }
}

export {
  loginWith,
  createBlog,
  likeBlog
}