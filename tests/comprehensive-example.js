import http from 'k6/http';
import { describe, expect, chai } from '../build/k6chaijs.min.js';
import {sleep} from 'k6';

chai.config.aggregateChecks = false;

export default function testSuite() {
  var someArray = Array.apply(null, {length: 1}).map(Function.call, Math.random);

  describe('Testing different values for expect', () => {
    expect(someArray).to.not.have.lengthOf.at.least(2);
  })

  describe('1', () => {
    // Target object deeply (but not strictly) equals `{a: 1}`
    expect({a: 1}, 'my array').to.deep.equal({a: 1});
    expect({a: 1}).to.not.equal({a: 1});

    // Target array deeply (but not strictly) includes `{a: 1}`
    expect([{a: 1}]).to.deep.include({a: 1});
    expect([{a: 1}]).to.not.include({a: 1});

    // Target object deeply (but not strictly) includes `x: {a: 1}`
    expect({x: {a: 1}}).to.deep.include({x: {a: 1}});
    expect({x: {a: 1}}).to.not.include({x: {a: 1}});

    // Target array deeply (but not strictly) has member `{a: 1}`
    expect([{a: 1}]).to.have.deep.members([{a: 1}]);
    expect([{a: 1}]).to.not.have.members([{a: 1}]);

    // Target set deeply (but not strictly) has key `{a: 1}`
    expect(new Set([{a: 1}])).to.have.deep.keys([{a: 1}]);
    expect(new Set([{a: 1}])).to.not.have.keys([{a: 1}]);

    // Target object deeply (but not strictly) has property `x: {a: 1}`
    expect({x: {a: 1}}).to.have.deep.property('x', {a: 1});
    expect({x: {a: 1}}).to.not.have.property('x', {a: 1});

  })

  describe('2', () => {
    expect({a: {b: ['x', 'y']}}).to.have.nested.property('a.b[1]');
    expect({a: {b: ['x', 'y']}}).to.nested.include({'a.b[1]': 'y'});
  })

  describe('3', () => {
    expect({'.a': {'[b]': 'x'}}).to.have.nested.property('\\.a.\\[b\\]');
    expect({'.a': {'[b]': 'x'}}).to.nested.include({'\\.a.\\[b\\]': 'x'});
  })

  describe('4', () => {
    Object.prototype.b = 2;

    expect({a: 1}).to.have.own.property('a');
    expect({a: 1}).to.have.property('b');
    expect({a: 1}).to.not.have.own.property('b');

    expect({a: 1}).to.own.include({a: 1});
    expect({a: 1}).to.include({b: 2}).but.not.own.include({b: 2});

  })

  describe('5', () => {
    expect([1, 2]).to.have.ordered.members([1, 2])
      .but.not.have.ordered.members([2, 1]);

    expect([1, 2, 3]).to.include.ordered.members([1, 2])
      .but.not.include.ordered.members([2, 3]);


  })

  describe('any', () => {
    expect({a: 1, b: 2}).to.not.have.any.keys('c', 'd');
  })

  describe('.a', () => {
    expect('foo').to.be.a('string');
    expect({a: 1}).to.be.an('object');
    expect(null).to.be.a('null');
    expect(undefined).to.be.an('undefined');
    expect(new Error).to.be.an('error');
    expect(new Float32Array).to.be.a('float32array');
    expect(Symbol()).to.be.a('symbol');
  })


  describe('6', () => {
    var myObj = {
      [Symbol.toStringTag]: 'myCustomType'
    };

    expect(myObj).to.be.a('myCustomType').but.not.an('object');

  })

  describe('7', () => {
    expect([1, 2, 3]).to.be.an('array').that.includes(2);
    expect([]).to.be.an('array').that.is.empty;
    expect('foo').to.be.a('string'); // Recommended
    expect('foo').to.not.be.an('array'); // Not recommended
    expect(1).to.be.a('string', 'number');
    expect(1, 'number').to.be.a('string');
    expect({b: 2}).to.have.a.property('b');

  })

  describe('8', () => {
    expect('foobar').to.include('foo');
    expect([1, 2, 3]).to.include(2);
    expect({a: 1, b: 2, c: 3}).to.include({a: 1, b: 2});
    expect(new Set([1, 2])).to.include(2);
  })





  sleep(1)
}
