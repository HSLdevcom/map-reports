import * as React from 'react'
import { Mutation as ApolloMutation } from 'react-apollo'
import { get } from 'lodash'
import { observer } from 'mobx-react'
import { AnyFunction } from '../../shared/types/AnyFunction'

type Props = {
  onCompleted?: any
  mutation: any
  update?: AnyFunction
  component: any
  variables?: object
  refetchQueries?: any[] | AnyFunction
}

export const Mutation = observer(
  ({
    mutation,
    update,
    component: Component,
    variables,
    refetchQueries,
    onCompleted,
    ...rest
  }: Props) => (
    <ApolloMutation
      refetchQueries={
        typeof refetchQueries === 'function' ? refetchQueries(rest) : refetchQueries
      }
      onCompleted={onCompleted}
      mutation={mutation}
      // If update is a function of length 1, assume that it takes props as args and returns the update function.
      update={typeof update === 'function' ? update(rest) : undefined}
      variables={variables}>
      {(mutate, { loading, error, data = {} }): React.ReactNode => {
        const queryName = Object.keys(data)[0]
        const mutationResult = get(data, queryName, data)

        return (
          <Component
            onCompleted={onCompleted}
            mutationLoading={loading}
            mutationError={error}
            mutationResult={mutationResult}
            mutate={mutate}
            {...rest}
          />
        )
      }}
    </ApolloMutation>
  )
)

type MutateProps = {
  mutation: any
  update?: AnyFunction
  refetchQueries?: Array<{ query: any; variables?: any }> | AnyFunction
}

export const mutate = ({
  mutation: staticMutation,
  update: staticUpdate,
  refetchQueries: staticRefetchQueries,
}: MutateProps): Function => Component => ({
  mutation = staticMutation,
  update = staticUpdate,
  refetchQueries = staticRefetchQueries,
  ...rest
}: MutateProps) => (
  <Mutation
    mutation={mutation}
    update={update}
    component={Component}
    refetchQueries={refetchQueries}
    {...rest}
  />
)
