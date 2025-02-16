import { test, expect } from '@playwright/test';

test("Probando los test",async({page})=>{
    await page.goto("/login");
    await expect(page.getByRole("button",{name: /log in/i })).toBeVisible();
});
