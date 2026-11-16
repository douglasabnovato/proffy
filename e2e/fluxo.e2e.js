/* Fluxo principal na tela: cadastro com 2 horários, busca só pela matéria, busca com dia e hora, contato e conexão contada */
const { test, expect } = require("@playwright/test");
const { default: AxeBuilder } = require("@axe-core/playwright");

/* PNG de 1 × 1 px para o avatar e resposta vazia para as fontes: nada sai para a internet */
const PIXEL = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");

test.beforeEach(async ({ context }) => {
  await context.route(/^https?:\/\/(?!localhost[:/])/, (route) => {
    const type = route.request().resourceType();
    if (type === "image") return route.fulfill({ contentType: "image/png", body: PIXEL });
    if (type === "stylesheet") return route.fulfill({ contentType: "text/css", body: "" });
    return route.fulfill({ status: 204, body: "" });
  });
});

/* axe sem violações nas regras WCAG A e AA */
async function semViolacoes(page) {
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
}

test("cadastra com 2 horários, acha pela matéria, filtra por dia e hora e abre o contato", async ({ page }, testInfo) => {
  const nome = `Ana Teste ${testInfo.project.name}`;

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sua plataforma de estudos online" })).toBeVisible();
  await semViolacoes(page);

  await page.getByRole("link", { name: "Dar aulas" }).click();
  await page.getByRole("button", { name: "Salvar cadastro" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Revise os campos destacados." })).toBeVisible();
  await expect(page.locator(".field-error").filter({ hasText: /\S/ })).toHaveCount(7);
  await semViolacoes(page);

  await page.getByLabel("Nome completo").fill(nome);
  await page.getByLabel("Link da sua foto").fill("https://imagens.empresa.test/ana.png");
  await page.getByLabel("WhatsApp").fill("(11) 90000-0001");
  await page.getByLabel("Biografia").fill("Professora fictícia de matemática para o teste de tela.");
  await page.getByLabel("Matéria").selectOption({ label: "Matemática" });
  await page.getByLabel("Custo da sua hora/aula").fill("80,50");
  await page.locator("#weekday-0").selectOption({ label: "Segunda-feira" });
  await page.locator("#time_from-0").fill("08:30");
  await page.locator("#time_to-0").fill("12:00");
  await page.getByRole("button", { name: "+ Novo horário" }).click();
  await expect(page.locator("#weekday-1")).toBeFocused();
  await page.locator("#weekday-1").selectOption({ label: "Quarta-feira" });
  await page.locator("#time_from-1").fill("14:00");
  await page.locator("#time_to-1").fill("18:00");
  await page.getByRole("button", { name: "Salvar cadastro" }).click();

  await expect(page).toHaveURL(/\/success$/);
  await expect(page.getByRole("heading", { name: "Cadastro concluído!" })).toBeVisible();
  await semViolacoes(page);

  await page.getByRole("link", { name: "Ver aulas" }).click();
  await page.getByLabel("Matéria").selectOption({ label: "Matemática" });
  await page.getByRole("button", { name: "Filtrar" }).click();
  const cartao = page.locator("article.teacher-item").filter({ has: page.getByRole("heading", { name: nome }) });
  await expect(cartao).toContainText("Segunda-feira 08:30 às 12:00");
  await expect(cartao).toContainText("Quarta-feira 14:00 às 18:00");
  await expect(cartao).toContainText(/R\$\s80,50/);
  await semViolacoes(page);

  await page.getByLabel("Dia da semana").selectOption({ label: "Quarta-feira" });
  await page.getByLabel("Hora").fill("15:00");
  await page.getByRole("button", { name: "Filtrar" }).click();
  await expect(cartao).toBeVisible();

  await page.getByLabel("Hora").fill("18:00");
  await page.getByRole("button", { name: "Filtrar" }).click();
  await expect(page.getByText("Nenhum professor encontrado")).toBeVisible();
  await semViolacoes(page);

  await page.getByLabel("Hora").fill("");
  await page.getByRole("button", { name: "Filtrar" }).click();
  const contato = cartao.getByRole("link", { name: /Entrar em contato/ });
  await expect(contato).toHaveAttribute("target", "_blank");
  const href = await contato.getAttribute("href");
  const resposta = await page.request.get(href, { maxRedirects: 0 });
  expect(resposta.status()).toBe(302);
  const destino = new URL(resposta.headers()["location"]);
  expect(destino.origin + destino.pathname).toBe("https://wa.me/5511900000001");
  expect(destino.searchParams.get("text")).toBe(`Olá, ${nome}! Tenho interesse na sua aula de Matemática.`);

  await page.goto("/");
  await expect(page.locator(".total-connections")).toContainText(/Total de \d+ conex(ão realizada|ões realizadas)/);
  await semViolacoes(page);
});

test("Tab na busca mostra o contorno de foco em cada campo", async ({ page }) => {
  await page.goto("/study");
  for (const id of ["subject", "weekday", "time"]) {
    await page.locator(`#${id}`).focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(page.locator(`#${id}`)).toBeFocused();
    const contorno = await page.locator(`#${id}`).evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(contorno).toBe("solid");
  }
});

test("em 375 px as telas não rolam na horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const rota of ["/", "/study", "/give-classes"]) {
    await page.goto(rota);
    const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(sobra, rota).toBeLessThanOrEqual(0);
    await semViolacoes(page);
  }
});
