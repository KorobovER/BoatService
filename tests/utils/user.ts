import { type Page, expect } from "@playwright/test"

export async function signUpNewUser(
  page: Page,
  firstName: string,
  lastName: string,
  email: string,
  password: string,
) {
  await page.goto("/signup")

  await page.getByPlaceholder("First Name").fill(firstName)
  await page.getByPlaceholder("Last Name").fill(lastName)
  await page.getByPlaceholder("Email").fill(email)
  await page.getByPlaceholder("Password", { exact: true }).fill(password)
  await page.getByPlaceholder("Repeat Password").fill(password)
  await page.getByRole("button", { name: "Sign Up" }).click()
  await expect(
    page.getByText("Your account has been created successfully"),
  ).toBeVisible()
  await page.goto("/login")
}

export async function logInUser(page: Page, email: string, password: string) {
  await page.goto("/login")

  await page.getByPlaceholder("Email").fill(email)
  await page.getByPlaceholder("Password", { exact: true }).fill(password)
  await page.getByRole("button", { name: "Log In" }).click()
  await page.waitForURL("/")
  await expect(
    page.getByText("Scheduling"),
  ).toBeVisible()
}

export async function logOutUser(page: Page) {
  await page.getByTestId("user-menu").click()
  await page.getByRole("menuitem", { name: "Log out" }).click()
  await page.goto("/login")
}
