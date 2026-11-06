const ARTICLE_PROJECT_ID = 'tgwzqc0t'
const ARTICLE_DATASET = 'production'
const ARTICLE_API_VERSION = '2025-02-19'
const ARTICLE_QUERY = encodeURIComponent(`*[_type == "article" && slug.current == $slug][0]{title,articleType,excerpt,publishedAt,externalUrl,heroImage{"url":asset->url},body[]{...,"imageUrl":asset->url}}`)

function articleText(block) {
  return (block.children || []).map((child) => child.text || '').join('')
}

function renderPortableText(body, target) {
  target.replaceChildren()
  body.forEach((block) => {
    if (block._type === 'image' && block.imageUrl) {
      const figure = document.createElement('figure')
      const image = document.createElement('img')
      image.src = block.imageUrl
      image.alt = block.alt || ''
      figure.append(image)
      target.append(figure)
      return
    }
    if (block._type !== 'block') return
    const element = document.createElement(block.style === 'h2' ? 'h2' : block.style === 'blockquote' ? 'blockquote' : 'p')
    element.textContent = articleText(block)
    target.append(element)
  })
}

async function loadSanityArticle() {
  const slug = new URLSearchParams(window.location.search).get('slug')
  const page = document.querySelector('[data-article-type="ocree-media"]')
  if (!slug || !page) return
  const url = `https://${ARTICLE_PROJECT_ID}.api.sanity.io/v${ARTICLE_API_VERSION}/data/query/${ARTICLE_DATASET}?query=${ARTICLE_QUERY}&$slug=${encodeURIComponent(JSON.stringify(slug))}`
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Sanity article request failed: ${response.status}`)
    const article = (await response.json()).result
    if (!article) return
    document.title = `${article.title} | Ocree`
    page.querySelector('.article-title').textContent = article.title
    page.querySelector('.article-dek').textContent = article.excerpt || ''
    page.querySelector('.article-meta span:last-child').textContent = new Intl.DateTimeFormat('en-CA', {year: 'numeric', month: 'long', day: 'numeric'}).format(new Date(article.publishedAt))
    if (article.heroImage?.url) {
      const placeholder = page.querySelector('.article-image-placeholder')
      placeholder.replaceChildren(Object.assign(document.createElement('img'), {src: article.heroImage.url, alt: article.title}))
      placeholder.classList.add('has-image')
    }
    renderPortableText(article.body || [], page.querySelector('.article-body'))
  } catch (error) {
    console.warn('Sanity article unavailable; retaining static article content.', error)
  }
}

loadSanityArticle()
