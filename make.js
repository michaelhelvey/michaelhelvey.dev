const fs = require('fs')

const posts = require('./old_posts.json')

const main = async () => {
  for await (const post of posts) {
    fs.mkdirSync(`./content/blog/${post.slug}`)
    const file = `./content/blog/${post.slug}/index.md`
    fs.appendFileSync(file, '---')
    fs.appendFileSync(file, '\n')
    fs.appendFileSync(file, `title: "${post.title.replace(/"/g, `'`)}"`)
    fs.appendFileSync(file, '\n')
    fs.appendFileSync(
      file,
      `date: "${new Date(post.created_at).toISOString()}"`
    )
    fs.appendFileSync(file, '\n')
    fs.appendFileSync(file, '---')
    fs.appendFileSync(file, '\n')
    fs.appendFileSync(file, post.body)
  }
}

main().then(process.exit)
