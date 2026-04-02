// Run with: node js/calculator.test.js
// No test framework needed — pure Node.js assertions

var calc = require('./calculator.js');
var calculate = calc.calculate;

var passed = 0;
var failed = 0;

function assert(description, actual, expected) {
  var ok = typeof expected === 'number'
    ? Math.abs(actual - expected) < 0.01
    : actual === expected;
  if (ok) {
    console.log('  OK ' + description);
    passed++;
  } else {
    console.error('  FAIL ' + description + ': expected ' + expected + ', got ' + actual);
    failed++;
  }
}

// Test 1: Basic apartment, medium insulation, radiators only
var r1 = calculate({ area: 50, height: 2.7, housingType: 0, insulation: 1,
  wallType: 0, floorType: 0, radiatorPower: 180, systemType: 0, floorArea: 0, dhwPoints: 1 });
console.log('Test 1: Basic apartment 50m2');
assert('boilerKw is positive number', r1.boilerKw > 0 ? 1 : 0, 1);
assert('radiatorSections is positive', r1.radiatorSections > 0 ? 1 : 0, 1);
assert('recommendedBoilerKw in standard sizes',
  [24, 28, 32, 40, 50].indexOf(r1.recommendedBoilerKw) >= 0 ? 1 : 0, 1);

// Test 2: Underfloor-only — radiatorSections must be 0
var r2 = calculate({ area: 40, height: 2.5, housingType: 0, insulation: 0,
  wallType: 0, floorType: 0, radiatorPower: 180, systemType: 1, floorArea: 40, dhwPoints: 1 });
console.log('Test 2: Underfloor-only');
assert('radiatorSections is 0', r2.radiatorSections, 0);
assert('boilerKw is positive', r2.boilerKw > 0 ? 1 : 0, 1);

// Test 3: Poor insulation gives higher boilerKw than good insulation
var base = { area: 50, height: 2.7, housingType: 0, wallType: 0, floorType: 0,
  radiatorPower: 180, systemType: 0, floorArea: 0, dhwPoints: 1 };
var rGood = calculate(Object.assign({}, base, { insulation: 0 }));
var rPoor = calculate(Object.assign({}, base, { insulation: 2 }));
console.log('Test 3: Insulation effect');
assert('poor insulation > good insulation', rPoor.boilerKw > rGood.boilerKw ? 1 : 0, 1);

// Test 4: More DHW points = higher boilerKw
var r4a = calculate(Object.assign({}, base, { dhwPoints: 1 }));
var r4b = calculate(Object.assign({}, base, { dhwPoints: 5 }));
console.log('Test 4: DHW points');
assert('5 dhw points > 1 dhw point', r4b.boilerKw > r4a.boilerKw ? 1 : 0, 1);

// Test 5: House type gives higher boilerKw than apartment
var r5apt   = calculate(Object.assign({}, base, { housingType: 0 }));
var r5house = calculate(Object.assign({}, base, { housingType: 1 }));
console.log('Test 5: House vs apartment');
assert('house boilerKw >= apartment', r5house.boilerKw >= r5apt.boilerKw ? 1 : 0, 1);

console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);
