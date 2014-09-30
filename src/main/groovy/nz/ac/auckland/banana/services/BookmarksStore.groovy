package nz.ac.auckland.banana.services

import nz.ac.auckland.common.stereotypes.UniversityComponent
import com.google.common.cache.Cache
import com.google.common.cache.CacheBuilder
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import redis.clients.jedis.Jedis
import redis.clients.jedis.JedisPool
import redis.clients.jedis.JedisPoolConfig
import redis.clients.jedis.Transaction

import java.security.MessageDigest
import java.util.concurrent.TimeUnit

@UniversityComponent
class BookmarksStore {
	private static final Logger log = LoggerFactory.getLogger(BookmarksStore)

	static final SESSION_CACHE_SIZE_MAX = 10000
	static final SESSION_EXPIRE_AFTER_MINUTES = 15

	//Map<String, List<Map>> bookmarks = [:]

	JedisPool pool = new JedisPool(new JedisPoolConfig(), "localhost");

	ThreadLocal<Transaction> currentTxHolder = new ThreadLocal<Transaction>()
	ThreadLocal<Jedis> currentConnHolder = new ThreadLocal<Jedis>()

	Cache<String, List<Map>> sessionBookmarks = CacheBuilder.newBuilder()
			.concurrencyLevel(4)
			.maximumSize(SESSION_CACHE_SIZE_MAX)
			.expireAfterWrite(SESSION_EXPIRE_AFTER_MINUTES, TimeUnit.MINUTES)
			.build()

	public List getUserBookmarks(String userId, boolean flattened = true){
		return getResult(retrieveBookmarks(userId), flattened)
	}

	public List getSessionBookmarks(String sessionId, boolean flattened = true){
		return getResult(sessionBookmarks.getIfPresent(sessionId), flattened)
	}

	public String deleteBookmark(String userId, String id, String sessionId = null){
		if (userId)
			return persistDeleteBookmark(id, userId)
		else if (sessionId){
			List<Map> list = sessionBookmarks.getIfPresent(sessionId)
			if (list){
				list.remove(list.find{return it.id == id})
			}
			return id
		}
		return null
	}

	public void addBookmarks(String userId, List<Map> data, String sessionId=null){
		if (userId)
			persistBookmarks(userId, data)
		else if (sessionId)
			sessionBookmarks.put(sessionId, data)
	}

	public String saveBookmark(String userId, Map data, String sessionId=null){
		if (userId){
			startTransaction()
			String id = persistBookmark(userId.toString(), data)
			commit()
			return id
		}else if (sessionId){
			def existing = sessionBookmarks.getIfPresent(sessionId.toString())
			if (existing == null){
				existing = []
				sessionBookmarks.put(sessionId.toString(), existing)
			}
			if (!data.id)
				data.id = UUID.randomUUID().toString().replaceAll('-', '')
			existing.add(data)
			return data.id;
		}
		return null

	}

	public static Map prepareBookmark(Map data){
		data.timestamp = System.currentTimeMillis()
		if (!data.title)
			data.title = data.url
		if (data.labels instanceof String){
			data.labels = data.labels.tokenize(',').findResults {it.trim()}
		}
		return data
	}

	/**
	 * Deals with flattened=true: if bookmark belongs to several labels, returns several instances of this bookmark
	 *   - one for each label (or just one if no labels). That's how view prefers it.
	 * @param result
	 * @param flattened
	 * @return
	 */
	protected List getResult(List result, boolean flattened){
		if (flattened){
			return result.collect {b->
				( b.labels ?: [null] ).collect {l -> // make sure we have at least one entry returned
					[id: b.id, title: b.title, url: b.url, timestamp: b.timestamp, label: l, labels: b.labels?:[]]
				}
			}.flatten()
		}else{
			return result
		}
	}

	/**
	 * Gets connection from the poo, starts multi transaction and saved connection and transaction objects
	 *   into thread local currentTxHolder and currentConnHolder
	 */
	void startTransaction(){
		Transaction tx = currentTxHolder.get()
		if (tx){
			log.warn('Rolling back abandoned transaction');
			tx.discard()
		}

		Jedis jedis = pool.getResource()
		currentConnHolder.set(jedis)

		log.debug("Starting transaction on connection $jedis")
		tx = jedis.multi()
		currentTxHolder.set(tx)
	}

	Transaction getCurrentTx(){
		return currentTxHolder.get()
	}

	void commit(){
		log.debug("Commit!")
		def tx = currentTx
		currentTxHolder.remove() // detach from thread
		tx.exec()

		// return connection
		pool.returnResource(currentConnHolder.get())
		currentConnHolder.remove() // detach from thread
	}

	void rollback(){
		log.debug("Rollback!")
		def tx = currentTx
		currentTxHolder.remove() // detach from thread
		tx?.discard()

		pool.returnBrokenResource(currentConnHolder.get())
		currentConnHolder.remove()  // detach from thread
	}

	public List retrieveBookmarks(String userId){
		Jedis jedis = pool.getResource()

		log.debug("Reading bookmarks using ${jedis}")
		def result = []
		def ids = jedis.smembers("user:$userId:bmids")
		ids.each { id ->
			result << [id: id,
					title: jedis.get("bm:$id:title"),
					url: jedis.get("bm:$id:url"),
					timestamp: jedis.get("bm:$id:timestamp"),
					labels: jedis.smembers("bm:$id:labels")]
		}
		pool.returnResource(jedis)

		return result
	}

	Map retrieveBookmark(String id){
		Jedis jedis = pool.getResource()
		Map result= [id: id, title: jedis.get("bm:$id:title"), url: jedis.get("bm:$id:url"),
					timestamp: jedis.get("bm:$id:timestamp"), labels: jedis.smembers("bm:$id:labels")]
		pool.returnResource(jedis)
		return result
	}

	public void persistBookmarks(String userId, List<Map> data){
		startTransaction()
		try{
			data.each { b ->
				persistBookmark(userId, b)
			}
		}catch (Throwable e){
			log.error(e.getMessage(), e)
			rollback()
			return
		}
		commit()  // it may still fail
	}

	public String persistDeleteBookmark(String id, String userId){
		// first look up the bookmark, without transaction
		Map b = retrieveBookmark(id)
		if (!b.title) b.title = b.url // should never happen
		String bookmarkHashCode = getSHA1(b.title + b.url)

		// do the harlem shake
		startTransaction()
		Transaction tx = getCurrentTx()
		tx.del("bm:$id:title")
		tx.del("bm:$id:url")
		tx.del("bm:$id:timestamp")
		tx.del("bm:$id:labels")

		tx.srem("user:$userId:bmids", id)
		tx.srem("user:$userId:$bookmarkHashCode:bmids", id)

	 	commit()
		return id
	}

	/**
	 * Expects to have a transaction attached to thread
	 *
	 * user:$userId:bmids (SET) - bookmarks of the user
	 * user:$userId:$bookmarkHashCode:bmids (SET) - quick access map to query by title + url
	 *
	 * bm:$id:title
	 * bm:$id:url
	 * bm:$id:timestamp
	 * bm:$id:labels  (SET)
	 *
	 *
	 * @param userId
	 * @param b  [id:id, title:title, url:url, timestamp:timestamp, labels: []]
	 */
	String persistBookmark(def userId, def b){

		Transaction tx = currentTx

		if (!b.title) b.title = b.url
		String bookmarkHashCode = getSHA1(b.title+b.url)

		String id = b.id
		if (!b.id)
			id = lookupBookmark(userId, b, bookmarkHashCode)

		if (id){
			// delete labels since we are going to replace them with new set
			tx.del("bm:$id:labels")
			log.debug("${b.id? 'Updating/adding entry' : 'Merging with existing entry'} $id values ${b.title.take(20)}.. -> ${b.url.take(20)}.. ${b.timestamp?.toString()} in ${b.labels}")
		}else{
			id = UUID.randomUUID().toString().replaceAll('-', '')
			log.debug("Adding new entry: $id values ${b.title.take(20)}.. -> ${b.url.take(20)}.. ${b.timestamp?.toString()} in ${b.labels}")
		}

		tx.sadd("user:$userId:bmids", id)
		tx.sadd("user:$userId:$bookmarkHashCode:bmids", id)
		tx.set("bm:$id:title", b.title.toString())
		tx.set("bm:$id:url", b.url.toString())
		tx.set("bm:$id:timestamp", b.timestamp?.toString())
		b.labels?.each{String label ->
			tx.sadd("bm:$id:labels",label)
		}
		return id
	}

	/**
	 * Lookup bookmarks with given title and url
	 *
	 * This is only called once per request therefore we can boldly use new resource from pool just for reading
	 *   (cant use current transaction since reading values only become available after transaction commit)
	 *
	 * @param userId only look in the bookmarks of this user
	 * @param b bookmark to be tried against database
	 * @param bookmarkHashCode a hash of title+url
	 * @return ids of bookmarks with the same title and url as passed b
	 */
	public def lookupBookmark(String userId, def b, String bookmarkHashCode){
		//Transaction tx = currentTx
		Jedis tx = pool.getResource()

		// lookup by url and title using SHA1 of their concatenation
		log.warn("Look up by hash $bookmarkHashCode")
		def bookmarkIds = tx.smembers("user:$userId:$bookmarkHashCode:bmids")
		if (bookmarkIds)
			log.warn("Found similar bookmark${bookmarkIds.size()>1?'s':''} $bookmarkIds")

		def result = bookmarkIds.find{id-> // note: cant use it inside transaction (will cause NullPointer on commit())
			log.warn("Checking candidate $id")
			return tx.get("bm:$id:title")==b.title && tx.get("bm:$id:url")==b.url
		}
		pool.returnResource(tx)
		return result
	}

	public String getSHA1(String source){
		def messageDigest = MessageDigest.getInstance("SHA1")
		messageDigest.update( source.getBytes() );
		def sha1Hex = new BigInteger(1, messageDigest.digest()).toString(16).padLeft( 40, '0' )
		return sha1Hex
	}
}
