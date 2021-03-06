'use strict'

angular.module('allocations')
  .controller('CalculationsController', function (products, locations, locationService, calculationService, pouchUtil, assumptionList, log, assumptionAddService) {
    var vm = this
    var viewMap = {
      coverage: 'getAllocations',
      wastage: 'getAllocations',
      schedule: 'getAllocations',
      buffer: 'getAllocations',
      BWMax: 'getBiWeekly',
      BWMin: 'getBiWeekly',
      MMax: 'getMonthlyMax',
      MR: 'getMonthlyRequirement'
    }
    vm.productList = products || []
    vm.renderedPartial = 'tp'
    vm.renderedViewLabel = 'Coverage'
    vm.activeView = 'coverage'
    vm.renderedData = []
    vm.locationStates = ['KN', 'BA']
    vm.selectedState = 'KN'
    vm.selectedLga = ''
    vm.lgas = []
    vm.wards = []

    vm.assumptionList = assumptionList
    vm.selectedTemplate = assumptionList[0]
    calculationService.setTemplate(vm.selectedTemplate)

    vm.switchTemplate = function (template) {
      vm.selectedTemplate = template

      calculationService.setTemplate(vm.selectedTemplate)
      vm.switchLocationLga()
    }

    function findLga (state) {
      var keys = []
      keys.push(['4', state])
      return locationService.getByLevelAndAncestor(keys)
        .then(function (response) {
          vm.lgas = response
          vm.selectedLga = response[0]
          return vm.selectedLga
        })
        .catch(function (err) {
          log.error('', err, 'could not fetch lga list, please try again. contact admin if this persists.')
        })
    }
    function resetView (facilities) {
      return calculationService[viewMap[vm.activeView]](facilities)
        .then(function (response) {
          console.log(response)
          vm.renderedData = response
          return response
        })
    }

    function getFacilities (lgs) {
      var level = '6'
      var keys = []
      var lgas = lgs || vm.selectedLga
      if (!lgas) {
        vm.rederedData = []
        return
      }
      if (angular.isArray(lgas)) {
        for (var i in lgas) {
          keys.push([level, lgas[i]._id])
        }
      } else {
        keys.push([level, lgas._id])
      }
      return locationService.getByLevelAndAncestor(keys)
        .then(function (response) {
          return response
        })
        .catch(function () {
          log.error('', '', 'could not retrieve facilities, please reload and try again')
        })
    }
    function switchRenderedPartial (partial) {
      vm.renderedPartial = partial
      return getFacilities()
        .then(resetView)
    }
    vm.switchLocationState = function (stateID) {
      var state = stateID || vm.selectedState
      return findLga(state)
        .then(getFacilities)
        .then(resetView)
        .catch(function (err) {
          log.error('', err, 'switching LGA failed')
          return []
        })
    }
    // TODO: accomodate more than one lga at a time; input to single lga or array of lgas
    vm.switchLocationLga = function (lgas) {
      if (lgas) {
        vm.selectedLga = lgas
      }
      return getFacilities(vm.selectedLga)
        .then(resetView)
        .catch(function () {
          log.error('', '', 'switching LGA failed please reload page and try again')
        })
    }

    vm.switchLocationState(vm.selectedState)

    vm.changeDataView = function (partial, viewLabel, suffix) {
      var view = viewLabel.replace(' ', '')
      vm.renderedViewLabel = view
      vm.activeView = view
      vm.suffix = suffix || ''
      switchRenderedPartial(partial)
    }
    vm.addCustomAssumption = function (data) {
      var product
      var emptyTemplate = {
        name: data.name,
        products: {},
        primary: {
          facility: data._id
        },
        description: '',
        custom: true,
        doc_type: 'allocation_template'
      }
      if (data.customTemplateRev) {
        emptyTemplate._rev = data.customTemplateRev
      }
      for (product in data.buffer) {
        if (!emptyTemplate.products[product]) {
          emptyTemplate.products[product] = {}
        }

        emptyTemplate.products[product]['buffer'] = data.buffer[product]
      }
      for (product in data.coverage) {
        if (!emptyTemplate.products[product]) {
          emptyTemplate.products[product] = {}
        }

        emptyTemplate.products[product]['coverage'] = data.coverage[product]
      }
      for (product in data.schedule) {
        if (!emptyTemplate.products[product]) {
          emptyTemplate.products[product] = {}
        }

        emptyTemplate.products[product]['schedule'] = data.schedule[product]
      }
      for (product in data.wastage) {
        if (!emptyTemplate.products[product]) {
          emptyTemplate.products[product] = {}
        }

        emptyTemplate.products[product]['wastage'] = data.wastage[product]
      }
      assumptionAddService.openForm(emptyTemplate)
    }
  })
