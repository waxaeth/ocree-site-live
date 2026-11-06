const SANITY_PROJECT_ID = 'tgwzqc0t'
const SANITY_DATASET = 'production'
const SANITY_API_VERSION = '2025-02-19'

const sanityQuery = encodeURIComponent(`*[_type == "article" && defined(publishedAt)] | order(publishedAt desc){_id,title,articleType,"slug":slug.current,excerpt,publishedAt,externalUrl}`)
const sanityUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${sanityQuery}`

function formatArticleDate(value) {
  return new Intl.DateTimeFormat('en-CA', {year: 'numeric', month: 'short', day: 'numeric'}).format(new Date(value))
}

function renderArticleCard(article) {
  const isExternal = article.articleType === 'externalNews'
  const card = document.createElement('a')
  card.className = `resource-card ${isExternal ? 'resource-card-news' : 'resource-card-owned'} reveal`
  card.dataset.articleType = article.articleType
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
  link.textContent = isExternal ? 'Read article' : `Read article · ${formatArticleDate(article.publishedAt)}`
  card.append(details, link)
  return card
}

async function loadSanityResources() {
  const grid = document.querySelector('[data-sanity-feed="resources"]')
  if (!grid) return
  try {
    const response = await fetch(sanityUrl)
    if (!response.ok) throw new Error(`Sanity request failed: ${response.status}`)
    const payload = await response.json()
    const articles = payload.result || []
    if (!articles.length) return
    const staticCards = [...grid.children].slice(3)
    grid.replaceChildren(...articles.map(renderArticleCard), ...staticCards)
  } catch (error) {
    console.warn('Sanity resources unavailable; retaining static resource cards.', error)
  }
}

loadSanityResources()
