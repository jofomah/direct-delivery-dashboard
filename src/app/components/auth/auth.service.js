'use strict'

angular.module('auth')
  .service('authService', function (
    $q,
    $state,
    log,
    config,
    navbarService,
    ehaCouchDbAuthService
  ) {
    this.requireRoles = function (roles) {
      roles = roles || []
      // Always authorise admins
      // TODO: remove depending on
      //       https://github.com/eHealthAfrica/angular-eha.couchdb-auth/issues/28
      roles = roles.concat(config.roles.admin.roles)

      function hasRoles (user) {
        return user.hasRole(roles) ? true : $q.reject('unauthorized')
      }

      return ehaCouchDbAuthService.getCurrentUser()
        .then(hasRoles)
    }

    this.login = function (username, password) {
      var params = {
        username: username,
        password: password
      }

      return ehaCouchDbAuthService.signIn(params)
        .then(navbarService.updateItems.bind(null))
        .then(log.success.bind(log, 'authSuccess'))
        .then($state.go.bind($state, 'home'))
        .catch(log.error.bind(log))
    }

    this.logout = function () {
      return ehaCouchDbAuthService.signOut()
        .then(navbarService.updateItems.bind())
        .then($state.go.bind($state, 'login'))
        .catch(log.error.bind(log, 'logoutFailed'))
    }

    this.authorisedStates = function (user) {
      // TODO: get this from role lib
      var prefix = 'direct_delivery_dashboard_state_'

      function isState (role) {
        return role.indexOf(prefix) !== -1
      }

      function format (role) {
        var state = role.split(prefix)[1]
        return state.toUpperCase()
      }

      return user.roles
        .filter(isState)
        .map(format)
    }
  })
