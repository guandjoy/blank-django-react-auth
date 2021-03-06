import React, { useState, useEffect } from 'react'
import { useMutation, useApolloClient } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import GitHubLogin from 'react-github-login'

const AUTH_WITH_GITHUB = gql`
  mutation authWithGithub($code: String!) {
    authWithGithub(input: { code: $code }) {
      key
    }
  }
`

function AuthWithGitHub(props) {
  const [isAuth, setIsAuth] = useState()
  const [code, setCode] = useState()
  const [
    authWithGitHub,
    { loading: mutationLoading, error, data },
  ] = useMutation(AUTH_WITH_GITHUB)

  // Turn on spinner
  const client = useApolloClient()
  useEffect(() => {
    client.writeData({ data: { sending: mutationLoading || isAuth || false } })
  }, [mutationLoading, isAuth])

  useEffect(() => {
    code && !data && sendAuthRequest()
    isAuth && redirectToAppPage()
  }, [code, isAuth])

  useEffect(() => {
    if (error) {
      alert(
        `Error message from a redfish server:\n ${error.graphQLErrors.map(
          ({ message }, i) => `${message}\n`
        )}`
      )
    }
    data && handleResponse()
  }, [data, error])

  const sendAuthRequest = () => authWithGitHub({ variables: { code } })

  const redirectToAppPage = () =>
    window.location.replace(process.env.GATSBY_APP_URL)

  const handleResponse = () => {
    localStorage.setItem('token', data.authWithGithub.key)
    setIsAuth(true)
  }

  const responseGitHub = response => {
    console.log('GitHub response', response)
    setCode(response.code)
  }

  const onFailure = response => alert(`GitHub failure response\n${response}`)

  return (
    <div>
      <GitHubLogin
        clientId={process.env.GATSBY_OAUTH_GITHUB_CLIENT_ID}
        onSuccess={responseGitHub}
        onFailure={onFailure}
        redirectUri=""
        buttonText={props.children || ''}
        className={props.densed ? 'github-button-densed' : 'github-button'}
      />
    </div>
  )
}

export default AuthWithGitHub
