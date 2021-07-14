const CouchDB = require("../../db")
const { StaticDatabases } = require("@budibase/auth/db")

const GLOBAL_DB = StaticDatabases.GLOBAL.name
const KEYS_DOC = StaticDatabases.GLOBAL.docs.apiKeys

async function getBuilderMainDoc() {
  const db = new CouchDB(GLOBAL_DB)
  try {
    return await db.get(KEYS_DOC)
  } catch (err) {
    // doesn't exist yet, nothing to get
    return {
      _id: KEYS_DOC,
    }
  }
}

async function setBuilderMainDoc(doc) {
  // make sure to override the ID
  doc._id = KEYS_DOC
  const db = new CouchDB(GLOBAL_DB)
  return db.put(doc)
}


exports.fetch = async function (ctx) {
  try {
    const mainDoc = await getBuilderMainDoc()
    ctx.body = mainDoc.apiKeys ? mainDoc.apiKeys : {}
  } catch (err) {
    /* istanbul ignore next */
    ctx.throw(400, err)
  }
}

exports.update = async function (ctx) {
  const key = ctx.params.key
  const value = ctx.request.body.value

  try {
    const mainDoc = await getBuilderMainDoc()
    if (mainDoc.apiKeys == null) {
      mainDoc.apiKeys = {}
    }
    mainDoc.apiKeys[key] = value
    const resp = await setBuilderMainDoc(mainDoc)
    ctx.body = {
      _id: resp.id,
      _rev: resp.rev,
    }
  } catch (err) {
    /* istanbul ignore next */
    ctx.throw(400, err)
  }
}
