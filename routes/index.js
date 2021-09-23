const router = require('koa-router')()

router.get('/', async (ctx, next) => {
  ctx.body='PlaNFT'
})

module.exports = router
