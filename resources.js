const SANITY_PROJECT_ID = 'tgwzqc0t'
const SANITY_DATASET = 'production'
const SANITY_API_VERSION = '2025-02-19'

const sanityQuery = encodeURIComponent(`*[_type == "article" && defined(publishedAt)] | order(publishedAt desc){_id,title,articleType,"slug":slug.current,excerpt,publishedAt,externalUrl}`)
const sanityUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${sanityQuery}`
const staticDates = new Map([
  ['media.html', '2024-09-17'],
  ['renx.ca/ocree-capital-uses-blockchain', '2025-04-22'],
  ['businesswire.com/news/home/20250324', '2025-03-24'],
  ['media.html?slug=private-market-infrastructure', '2026-11-06'],
])

function formatArticleDate(value) {
  return new Intl.DateTimeFormat(window.ocreeLanguage === 'fr' ? 'fr-CA' : 'en-CA', {year: 'numeric', month: 'short', day: 'numeric'}).format(new Date(value))
}

window.addEventListener('ocree:languagechange', () => {
  document.querySelectorAll('.resource-date[datetime]').forEach((date) => {
    date.textContent = formatArticleDate(`${date.dateTime}T12:00:00Z`)
  })
})

function renderArticleCard(article) {
  const isExternal = article.articleType === 'externalNews'
  const card = document.createElement('a')
  card.className = `resource-card ${isExternal ? 'resource-card-news' : 'resource-card-owned'} reveal`
  card.dataset.articleType = article.articleType
  card.dataset.publishedAt = article.publishedAt
  card.href = isExternal ? article.externalUrl : `media.html?slug=${encodeURIComponent(article.slug)}`
  if (isExternal) {
    card.target = '_blank'
    card.rel = 'noopener noreferrer'
  }
  const details = document.createElement('div')
  const label = document.createElement('p')
  label.className = 'label'
  label.textContent = isExternal ? 'External news' : 'Ocree media'
  const title = document.createElement('h3')
  title.textContent = article.title
  const excerpt = document.createElement('p')
  excerpt.textContent = article.excerpt || ''
  details.append(label, title, excerpt)
  const link = document.createElement('span')
  link.className = 'arrow-link'
  link.textContent = 'Read article'
  const date = document.createElement('time')
  date.className = 'resource-date'
  date.dateTime = article.publishedAt.slice(0, 10)
  date.textContent = formatArticleDate(article.publishedAt)
  details.append(date)
  card.append(details, link)
  return card
}

async function loadSanityResources() {
  const grid = document.querySelector('[data-sanity-feed="resources"]')
  if (!grid) return
  const staticCards = [...grid.children]
  for (const card of staticCards) {
    const entry = [...staticDates].find(([href]) => href.startsWith('media.html')
      ? card.getAttribute('href') === href
      : card.getAttribute('href')?.includes(href))
    if (!entry) continue
    card.dataset.publishedAt = entry[1]
    const date = document.createElement('time')
    date.className = 'resource-date'
    date.dateTime = entry[1]
    date.textContent = formatArticleDate(`${entry[1]}T12:00:00Z`)
    card.querySelector('div')?.append(date)
  }
  const sortCards = (cards) => cards.sort((a, b) =>
    (b.dataset.publishedAt || '').localeCompare(a.dataset.publishedAt || ''))
  grid.replaceChildren(...sortCards(staticCards))
  try {
    const response = await fetch(sanityUrl)
    if (!response.ok) throw new Error(`Sanity request failed: ${response.status}`)
    const payload = await response.json()
    const articles = payload.result || []
    if (!articles.length) return
    const cmsCards = articles.map(renderArticleCard)
    const remaining = staticCards.filter((card) => !cmsCards.some((cmsCard) =>
      cmsCard.getAttribute('href') === card.getAttribute('href')))
    grid.replaceChildren(...sortCards([...cmsCards, ...remaining]))
  } catch (error) {
    console.warn('Sanity resources unavailable; retaining static resource cards.', error)
  }
}

loadSanityResources()
