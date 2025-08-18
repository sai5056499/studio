import time
from playwright.sync_api import sync_playwright, expect, Page

def run(page: Page):
    # Sign up
    page.goto("https://studio-sigma-pied.vercel.app/")
    page.get_by_role("button", name="Sign Up").click()

    # Use a unique email for each run
    test_email = f"testuser_{int(time.time())}@example.com"

    expect(page.get_by_label("Email")).to_be_visible()
    page.get_by_label("Email").fill(test_email)
    page.get_by_label("Password").fill("password123")
    # Click the sign up button within the modal
    page.locator('form').get_by_role('button', name='Sign Up').click()

    # Wait for avatar to appear
    avatar = page.locator('button[aria-haspopup="menu"]')
    expect(avatar).to_be_visible(timeout=10000)
    page.screenshot(path="jules-scratch/verification/signed-in.png")

    # Log out
    avatar.click()
    page.get_by_role("menuitem", name="Log out").click()

    # Wait for sign in button to appear
    sign_in_button = page.get_by_role("button", name="Sign In")
    expect(sign_in_button).to_be_visible(timeout=10000)
    page.screenshot(path="jules-scratch/verification/signed-out.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            run(page)
        finally:
            browser.close()

if __name__ == "__main__":
    main()
