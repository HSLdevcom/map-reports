// Explicitly require the buffer package from npm, not the built-in Buffer.
// This module is used on the client too.
const Buffer = require('buffer/')

function createCursor(node, params) {
  return Buffer.from(JSON.stringify({ id: node.id, ...params })).toString('base64')
}

export default createCursor
