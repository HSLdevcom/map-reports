const handler = require('serve-handler')

module.exports = async (request, response) => {
  await handler(request, response, {
    public: "dist",
    directoryListing: false,
    trailingSlash: false,
    renderSingle: true,
    rewrites: [
      { source: "/map-reports/**", destination: "/index.html" }
    ]
  })
}
