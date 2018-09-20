import { get } from 'lodash'

const overpassEndpoint = 'https://overpass-api.de/api/interpreter'

const aroundQuery = (lat, lon) => `
[out:json][timeout:10];
(
  node(around:15,${lat},${lon})(if:count_tags() > 0);
  way(around:15,${lat},${lon})(if:count_tags() > 0);
);
out geom;
`

export const overpassQuery = async (lat, lon) => {
  const overpassRequestData = new URLSearchParams(
    `data=${aroundQuery(lat, lon).replace(/\r?\n|\r/g, '')}`
  )
  const overpassRequest = await fetch(overpassEndpoint, {
    method: 'post',
    body: overpassRequestData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  const overpassResponse = await overpassRequest.json()
  return get(overpassResponse, 'elements', [])
}
