import { gql } from 'apollo-server-express'

const locationTypeDefs = gql`
  type Location {
    lat: Float!
    lon: Float!
  }

  input InputLocation {
    lat: String!
    lon: String!
  }
`

export default locationTypeDefs
