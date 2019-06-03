import React, { useState, useEffect } from "react";
import { withApollo } from "react-apollo";
import appState from "../graphql/appState";
import gql from "graphql-tag";

const tokenIsValidQuery = gql`
  query {
    tokenIsValid
  }
`;

function Authentication(props) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [tokenIsValid, setTokenIsValid] = useState();
  const [iframeLandingIsMounted, setIframeLandingIsMounted] = useState();
  const [
    iframeLandingIsUnavailable,
    setIframeLandingIsUnavailable
  ] = useState();

  useEffect(() => {
    // Add key receiver
    window.addEventListener("message", receiveKey, false);
    return () => window.removeEventListener("message", receiveKey, false);
  }, []);

  const receiveKey = e => {
    // Key receiver from the landing's Iframe
    var payload = JSON.parse(e.data); // Prepare data
    if (payload.key) {
      // Landing page has a key.
      setToken(payload.key);
    } else {
      // Landing page has no key
      // Redirect to the login page
      window.location.replace("http://localhost:8000/login");
    }
  };

  useEffect(() => {
    // Check if token is valid
    if (token) {
      localStorage.setItem("token", token);
      props.client.query({ query: tokenIsValidQuery }).then(res => {
        setTokenIsValid(res.data.tokenIsValid);
      });
    }
  }, [token, props.client]);

  useEffect(() => {
    // Make actions depends on token validity
    if (tokenIsValid === true) {
      // Provided token is valid. Allow access
      localStorage.setItem("token", token);
      console.log("token: " + localStorage.getItem("token"));
      props.client.writeData({ data: { isAuthenticated: true } });
    } else if (tokenIsValid === false) {
      // Provided token is not valid
      // Redirect to the login page
      window.location.replace("http://localhost:8000/login");
    }
  }, [tokenIsValid, token, props.client]);

  const landingFrameOnError = () => {
    setIframeLandingIsUnavailable(true);
    window.location.replace("http://localhost:8000/login");
  };

  if (token) {
    // We have already have a key and there is no need to mount landing's localstorage
    return null;
  } else {
    return (
      // Render iframe with a landing page to get a key from a localstorage
      <iframe
        style={{ visibility: "hidden" }}
        id="landingFrame"
        onError={landingFrameOnError}
        src="http://localhost:8000/iframe-key"
      />
    );
  }
}

export default withApollo(Authentication);