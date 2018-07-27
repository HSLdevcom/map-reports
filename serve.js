const micro = require('micro')
const handler = require('serve-handler')

const server = micro(async (request, response) => {
  await handler(request, response, {
    public: "dist",
    directoryListing: false,
    trailingSlash: false,
    renderSingle: true,
    rewrites: [
      { source: "/map-reports/**", destination: "/index.html" },
      { source: "**", destination: "/index.html" },
    ]
  })
})

server.listen(1234)
