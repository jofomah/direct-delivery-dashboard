'use strict';

describe('ScheduleRoundController', function () {

	beforeEach(module('planning', 'deliveryMock'));

	var $controller;
	var $state;
	var dailyDeliveries;
	var scheduleService;
	var planningService;
	var log;
	var ScheduleRoundCtrl;
	var deliveryRound;


	beforeEach(inject(function (_$controller_, _$state_, _scheduleService_, _planningService_, _log_, _deliveryRoundMock_, _dailyDeliveriesMock_) {
		$controller = _$controller_;
		$state = _$state_;
		scheduleService = _scheduleService_;
		planningService = _planningService_;
		log = _log_;
		deliveryRound = _deliveryRoundMock_;
		dailyDeliveries = _dailyDeliveriesMock_;

		ScheduleRoundCtrl = $controller('ScheduleRoundCtrl', {
			deliveryRound: deliveryRound,
			$state: $state,
			dailyDeliveries: dailyDeliveries,
			scheduleService: scheduleService,
			planningService: planningService,
			log: log
		});

		spyOn(planningService, 'completePlanning').and.callThrough();

	}));

	describe('ScheduleRoundCtrl', function () {
		it('Should be defined or instantiated', function () {
			expect(ScheduleRoundCtrl).toBeDefined();
		});
	});

	describe('ScheduleRoundCtrl.deliveryRound', function () {
		it('Should be defined', function () {
			expect(ScheduleRoundCtrl.deliveryRound).toBeDefined();
		});

		it('Should equal injected object', function () {
			expect(ScheduleRoundCtrl.deliveryRound).toEqual(deliveryRound);
		});

		it('Should have _id property', function () {
			expect(ScheduleRoundCtrl.deliveryRound._id).toBeDefined();
		});
	});

	describe('ScheduleRoundCtrl.dailyDeliveries', function () {
		it('Should be defined', function () {
			expect(ScheduleRoundCtrl.dailyDeliveries).toBeDefined();
		});

		it('Should equal result of scheduleService.flatten', function () {
			var expected = scheduleService.flatten(dailyDeliveries);
			expect(ScheduleRoundCtrl.dailyDeliveries).toEqual(expected);
		});
	});


	describe('ScheduleRoundCtrl.exportForRouting', function () {
		it('Should be defined', function () {
			expect(ScheduleRoundCtrl.exportForRouting).toBeDefined();
		});

		it('Should set ScheduleRoundCtrl.exportForRouting to expected array', function () {
			var exportData = scheduleService.prepareExport(deliveryRound._id, dailyDeliveries);
			expect(ScheduleRoundCtrl.exportForRouting).toEqual(exportData.rows);
		});
	});

	describe('ScheduleRoundCtrl.exportHeader', function () {
		it('Should match expected array in given order', function () {
			var exportData = scheduleService.prepareExport(deliveryRound._id, dailyDeliveries);
			expect(ScheduleRoundCtrl.exportHeader).toEqual(exportData.headers);
		});
	});

	describe('ScheduleRoundCtrl.completePlanning', function () {
		it('Should call planningService.completePlanning with expected parameter', function () {
			expect(planningService.completePlanning).not.toHaveBeenCalled();
			ScheduleRoundCtrl.completePlanning(deliveryRound);
			expect(planningService.completePlanning).toHaveBeenCalledWith(deliveryRound);
		});
	});

});