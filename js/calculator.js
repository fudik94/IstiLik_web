// js/calculator.js
// Pure heating calculation functions.
// No DOM dependencies — safe to require() in Node.js for testing.

(function (global) {
  'use strict';

  // Base heat load per m2 (W/m2) by housing type
  var BASE_LOAD = [80, 100]; // 0=apartment, 1=house

  // Insulation multipliers: 0=good, 1=medium, 2=poor
  var INSULATION_FACTOR = [0.85, 1.0, 1.2];

  // Floor type multipliers: 0=standard, 1=attic
  var FLOOR_FACTOR = [1.0, 1.1];

  // Standard boiler sizes in kW
  var BOILER_SIZES = [
    { max: 12,       size: 24 },
    { max: 20,       size: 28 },
    { max: 28,       size: 32 },
    { max: 35,       size: 40 },
    { max: Infinity, size: 50 }
  ];

  /**
   * Calculate heating requirements for a room.
   *
   * @param {Object} p
   * @param {number} p.area          Room area in m2 (5-1000)
   * @param {number} p.height        Ceiling height in m (2-6)
   * @param {number} p.housingType   0 = apartment, 1 = house
   * @param {number} p.insulation    0 = good, 1 = medium, 2 = poor
   * @param {number} p.wallType      External wall count minus 1 (0-3)
   * @param {number} p.floorType     0 = standard, 1 = attic
   * @param {number} p.radiatorPower Watts per section (default 180)
   * @param {number} p.systemType    0 = radiators, 1 = underfloor, 2 = mixed
   * @param {number} p.floorArea     m2 covered by underfloor heating
   * @param {number} p.dhwPoints     Domestic hot water points (1-9)
   *
   * @returns {{ boilerKw: number, radiatorSections: number, recommendedBoilerKw: number }}
   */
  function calculate(p) {
    var baseLoad         = BASE_LOAD[p.housingType] || BASE_LOAD[0];
    var heightFactor     = p.height / 2.7;
    var insulationFactor = INSULATION_FACTOR[p.insulation] || 1.0;
    var wallCount        = (p.wallType || 0) + 1;
    var wallFactor       = 1.0 + 0.1 * Math.max(0, wallCount - 1);
    var floorFactor      = FLOOR_FACTOR[p.floorType] || 1.0;

    var heatLossWatts  = p.area * baseLoad * heightFactor * insulationFactor * wallFactor * floorFactor;

    var floorOffset    = (p.floorArea || 0) * 75;
    var minLoad        = baseLoad * p.area * 0.4;
    var adjustedWatts  = Math.max(heatLossWatts - floorOffset, minLoad);

    var radiatorSections = 0;
    if (p.systemType !== 1) {
      radiatorSections = Math.ceil(adjustedWatts * 1.1 / (p.radiatorPower || 180));
    }

    var requiredKw = adjustedWatts / 1000;
    var boilerKw   = requiredKw * 1.15;
    if (p.systemType === 1) { boilerKw *= 1.05; }
    boilerKw += (p.dhwPoints || 1) * 1.0;
    boilerKw = Math.round(boilerKw * 10) / 10;

    var recommendedBoilerKw = 50;
    for (var i = 0; i < BOILER_SIZES.length; i++) {
      if (boilerKw <= BOILER_SIZES[i].max) {
        recommendedBoilerKw = BOILER_SIZES[i].size;
        break;
      }
    }

    return { boilerKw: boilerKw, heatLoadKw: Math.round(requiredKw * 10) / 10, radiatorSections: radiatorSections, recommendedBoilerKw: recommendedBoilerKw };
  }

  // CommonJS export for Node.js testing; browser accesses via window.IstiLikCalc
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculate: calculate };
  } else {
    global.IstiLikCalc = { calculate: calculate };
  }

}(typeof window !== 'undefined' ? window : global));