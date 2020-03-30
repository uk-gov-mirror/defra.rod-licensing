import cacheManager from 'cache-manager'
import redisStore from 'cache-manager-ioredis'
const cache = cacheManager.caching({
  store: 'memory',
  ttl: process.env.DYNAMICS_CACHE_TTL || 60 * 60 * 12,
  ...(process.env.REDIS_HOST && { store: redisStore, host: process.env.REDIS_HOST, port: process.env.REDIS_PORT || 6379 })
})

process.env.REDIS_HOST && cache.store.getClient().on('error', console.error)

export class CacheableOperation {
  constructor (cacheKey, fetchOp, resultProcessor) {
    this._cacheKey = cacheKey
    this._fetchOp = fetchOp
    this._resultProcessor = resultProcessor
  }

  async execute () {
    return this._resultProcessor(await this._fetchOp())
  }

  async cached () {
    const data = await cache.wrap(this._cacheKey, this._fetchOp)
    return this._resultProcessor(data)
  }
}

export default cache
