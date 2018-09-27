import { ApolloClient } from 'apollo-client'
import {
  defaultDataIdFromObject,
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { onError } from 'apollo-link-error'
import { ApolloLink, Observable } from 'apollo-link'
import fragmentTypes from '../../fragmentTypes.json'

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: fragmentTypes,
})

const cache = new InMemoryCache({
  fragmentMatcher,
  dataIdFromObject: (obj: any) => {
    switch (obj.__typename) {
      case 'ReportItem':
      case 'Inspection':
        return obj.id
      case 'ReportsEdge':
        return obj.cursor
      default:
        return defaultDataIdFromObject(obj)
    }
  },
})

const request = async operation => {
  operation.setContext({
    headers: {},
  })
}

const requestLink = new ApolloLink(
  (operation, forward) =>
    new Observable(observer => {
      let handle
      Promise.resolve(operation)
        .then(oper => request(oper))
        .then(() => {
          handle = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          })
        })
        .catch(observer.error.bind(observer))

      return () => {
        if (handle) {
          handle.unsubscribe()
        }
      }
    })
)

const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.error(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        )
      }
      if (networkError) {
        console.error(`[Network error]: ${networkError}`)
      }
    }),
    requestLink,
    new HttpLink({ uri: process.env.API_URL || '/graphql' }),
  ]),
  cache,
})

export default client
