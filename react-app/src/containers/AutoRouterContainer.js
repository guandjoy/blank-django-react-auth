import React from 'react'
import {Route, Switch, Prompt} from 'react-router-dom'
import Main from './MainContainer'
import Login from './auth/LoginContainer'
import Registration from './auth/RegistrationContainer'
import Profile from './auth/ProfileContainer'
import PasswordReset from './auth/PasswordResetContainer'
import PasswordResetConfirm from './auth/PasswordResetConfirmContainer'
import {withRouter} from 'react-router'
import {connect} from 'react-redux'
import history from '../history'

import Application from './ApplicationContainer'

const authEndpoints = [
	'/profile',
	'/app',
]

const notAuthEndpoints = [
	'/',
	'/login',
	'/registration',
	'/password-reset',
]


class AutoRouter extends React.Component {
	constructor(props) {
		super(props)
		this.checkPermission()
	}
	componentDidUpdate() {
		this.checkPermission()
	}
	checkPermission() {
		if (this.props.isAuth) {
			for (var i in notAuthEndpoints) {
				if (this.props.location.pathname === notAuthEndpoints[i]) {
					console.log('you already logged in')
					history.push('/app')
				}
			}	
		} else {
			for (var i in authEndpoints) {
				if (this.props.location.pathname === authEndpoints[i]) {
					history.push('/login')
				}
			}
		}	
	}
	render() {
		return (
			<React.Fragment>
				<Switch>
				{/* for not loged in users */}
					<Route exact path="/" component={Main}/>
					<Route path="/login" component={Login}/>
					<Route path="/registration" component={Registration}/>
					<Route exact path="/password-reset" component={PasswordReset}/>
					<Route path="/password-reset/confirm/:uid/:token" component={PasswordResetConfirm}/>
				{/* auth required */}
					<Route path="/profile" component={Profile}/>
					<Route path="/app" component={Application}/>
				{/* neutral */}
					<Route path="/product" component={Main}/>
				</Switch>
			</React.Fragment>
		)
	}
}

const mapStateToProps = state => {
	return {
		token: localStorage.getItem('token'),
		isAuth: state.restAuth.isAuth,
	}
}

export default withRouter(connect(mapStateToProps, undefined)(AutoRouter))