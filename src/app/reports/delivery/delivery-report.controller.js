'use strict'

angular.module('reports')
  .controller('DeliveryReportCtrl', function ($window, config, reportsService, log, $timeout) {
    var vm = this // viewModel

    vm.dateFormat = config.dateFormat
    vm.stopOn = new Date()
    var ONE_MONTH = 2.62974e9 // milli secs
    var ONE_MONTH_BEFORE = vm.stopOn.getTime() - ONE_MONTH
    vm.startFrom = new Date(ONE_MONTH_BEFORE)

    function openDatePicker ($event) {
      $event.preventDefault()
      $event.stopPropagation()
      this.opened = !this.opened
    }

    vm.start = {
      opened: false,
      open: openDatePicker
    }

    vm.stop = {
      opened: false,
      open: openDatePicker
    }

    vm.formatXAxis = function () {
      return function (d) {
        return d
      }
    }

    vm.zoneReport = []
    vm.statusReport = {}

    vm.getReport = function () {
      reportsService.getByWithin('Kano', vm.startFrom, vm.stopOn)
        .then(function (res) {
          vm.zoneReport = res.zones
          vm.statusReport = res.status
          vm.exampleData = vm.getChartData(res.zones)
        })
        .catch(function (err) {
          log.error('cumulativeReportErr', err)
        })
    }

    vm.getReport() // call on init

    vm.getChartData = function (zoneData) {
      var graphData = [
        {
          'key': 'Success',
          'color': 'green',
          'values': []
        },
        {
          'key': 'Failed',
          'color': 'red',
          'values': []
        },
        {
          'key': 'Canceled',
          'color': 'orange',
          'values': []
        }
      ]
      var length = zoneData.length

      for (var i = 0; i < length; i++) {
        var row = zoneData[i]
        var total = row.success + row.failed + row.canceled
        graphData[0].values.push([row.zone, getPercentile(total, row.success)])
        graphData[1].values.push([row.zone, getPercentile(total, row.failed)])
        graphData[2].values.push([row.zone, getPercentile(total, row.canceled)])
      }
      return graphData
    }

    function getPercentile (total, value) {
      var percent = 0
      if (total > 0) {
        percent = (value / total) * 100
      }
      return percent
    }
  })
  .controller('DeliveryReportByZonesCtrl', function (config, reportsService, log, deliveryReportService) {
    var vm = this // viewModel

    function openDatePicker ($event) {
      $event.preventDefault()
      $event.stopPropagation()
      this.opened = !this.opened
    }

    vm.filteredReport = {
      start: {
        opened: false,
        open: openDatePicker
      },
      stop: {
        opened: false,
        open: openDatePicker
      }
    }

    vm.dateFormat = config.dateFormat
    var ONE_MONTH = 2.62974e9 // milli secs
    vm.stopDateOn = new Date()
    var TWO_MONTHS_BEFORE = vm.stopDateOn.getTime() - (ONE_MONTH * 2)
    vm.startDate = new Date(TWO_MONTHS_BEFORE)

    vm.loadReport = function () {
      deliveryReportService.getDailyDeliveryReport(vm.startDate, vm.stopDateOn)
        .then(function (deliveryStatusReport) {
          vm.byZoneByLGA = deliveryStatusReport.byZoneByLGA
          vm.byZoneByDriver = deliveryStatusReport.byZoneByDriver
          vm.byZoneByDriverKeys = Object.keys(deliveryStatusReport.byZoneByDriver).sort()
          vm.capturedZones = Object.keys(deliveryStatusReport.byZoneByLGA).sort()
          vm.selectedZone = vm.capturedZones[0] || ''
        })
        .catch(function (reason) {
          console.log(reason)
        })
    }

    vm.splitResult = function (string, type) {
      var stringArr = string.split('-')
      return type === 'zone' ? stringArr[1] : stringArr[0]
    }

    vm.sum = function (row) {
      var success = row.success || 0
      var failed = row.failed || 0
      var cancelled = row.canceled || 0
      return success + failed + cancelled
    }

    vm.loadReport()
  })
