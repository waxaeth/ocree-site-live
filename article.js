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
    if (block._type === 'articleTable') {
      const wrap = document.createElement('div')
      wrap.className = 'article-table-wrap'
      const table = document.createElement('table')
      const head = document.createElement('thead')
      const headRow = document.createElement('tr')
      ;(block.columns || []).forEach((column) => {
        const cell = document.createElement('th')
        cell.textContent = column
        headRow.append(cell)
      })
      head.append(headRow)
      table.append(head)
      const tableBody = document.createElement('tbody')
      ;(block.rows || []).forEach((entry) => {
        const row = document.createElement('tr')
        ;(entry.cells || []).forEach((value) => {
          const cell = document.createElement('td')
          cell.textContent = value
          row.append(cell)
        })
        tableBody.append(row)
      })
      table.append(tableBody)
      wrap.append(table)
      if (block.note) {
        const note = document.createElement('p')
        note.className = 'article-table-note'
        note.textContent = block.note
        wrap.append(note)
      }
      target.append(wrap)
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
    let article
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Sanity article request failed: ${response.status}`)
      article = (await response.json()).result
    } catch (error) {
      console.warn('Sanity article unavailable; loading local article.', error)
    }
    if (!article) {
      const fallback = await fetch(`assets/${encodeURIComponent(slug)}.json?v=2`)
      if (!fallback.ok) throw new Error(`Article not found: ${slug}`)
      article = await fallback.json()
    }
    document.title = `${article.title} | Ocree`
    page.querySelector('.article-title').textContent = article.title
    page.querySelector('.article-dek').textContent = article.excerpt || ''
    const published = new Intl.DateTimeFormat('en-CA', {year: 'numeric', month: 'long', day: 'numeric'}).format(new Date(article.publishedAt))
    page.querySelector('.article-meta span:nth-child(2)').textContent = 'Article'
    page.querySelector('.article-meta span:last-child').textContent = published
    const details = page.querySelectorAll('.article-aside dd')
    if (details[1]) details[1].textContent = published
    if (details[2]) details[2].textContent = 'Private market infrastructure'
    const placeholder = page.querySelector('.article-image-placeholder')
    if (article.heroImage?.url) {
      placeholder.replaceChildren(Object.assign(document.createElement('img'), {src: article.heroImage.url, alt: article.title}))
      placeholder.classList.add('has-image')
    } else {
      placeholder.remove()
    }
    renderPortableText(article.body || [], page.querySelector('.article-body'))
  } catch (error) {
    console.warn('Sanity article unavailable; retaining static article content.', error)
  }
}

loadSanityArticle()
