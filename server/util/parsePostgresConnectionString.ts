import url from 'url'

// Stolen from https://github.com/iceddev/pg-connection-string/blob/master/index.js
// -DD

// Parse method copied from https://github.com/brianc/node-postgres
// Copyright (c) 2010-2014 Brian Carlson (brian.m.carlson@gmail.com)
// MIT License

type PgConfig = {
  host?: string
  port?: number
  username?: string
  password?: string
  database?: string
}

// parses a connection string
export function parse(str) {
  let config: PgConfig = {}

  // unix socket
  if (str.charAt(0) === '/') {
    config = str.split(' ')
    return { host: config[0], database: config[1] }
  }

  // url parse expects spaces encoded as %20
  const result = url.parse(
    / |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(str)
      ? encodeURI(str).replace(/\%25(\d\d)/g, '%$1')
      : str,
    true
  )

  config = result.query
  for (const k in config) {
    if (Array.isArray(config[k])) {
      config[k] = config[k][config[k].length - 1]
    }
  }

  config.port = parseInt(result.port)

  if (result.protocol == 'socket:') {
    config.host = decodeURI(result.pathname)
    const db = result.query.db
    config.database = Array.isArray(db) ? db[0] : db
    return config
  }
  config.host = result.hostname

  // result.pathname is not always guaranteed to have a '/' prefix (e.g. relative urls)
  // only strip the slash if it is present.
  let pathname = result.pathname
  if (pathname && pathname.charAt(0) === '/') {
    pathname = result.pathname.slice(1) || null
  }
  config.database = pathname && decodeURI(pathname)

  const auth = (result.auth || ':').split(':')
  config.username = auth[0]
  config.password = auth.splice(1).join(':')

  return config
}
