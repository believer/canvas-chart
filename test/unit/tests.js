'use strict';

var chai   = require('chai');
var expect = chai.expect;
var sinon  = require('sinon');
var proxyquire = require('proxyquire');

chai.use(require('sinon-chai'));

describe.only("#canvas-chart", function() {
  var canvas;
  var deepmerge;
  var fs;
  var shart;

  beforeEach(function () {
    canvas = sinon.stub().returns({
      getContext: sinon.stub().returns({
        arc: sinon.spy(),
        beginPath: sinon.spy(),
        closePath: sinon.spy(),
        fill: sinon.spy(),
        fillStyle: sinon.spy(),
        fillText: sinon.spy(),
        font: sinon.spy(),
        lineTo: sinon.spy(),
        lineWidth: sinon.spy(),
        moveTo: sinon.spy(),
        restore: sinon.spy(),
        save: sinon.spy(),
        scale: sinon.spy(),
        stroke: sinon.spy(),
        strokeStyle: sinon.spy(),
        translate: sinon.spy()
      }),
      pngStream: sinon.stub().returns({
        on: sinon.spy()
      }),
      height: 400,
      width: 800
    });

    deepmerge = sinon.stub();

    fs = {
      createWriteStream: sinon.spy()
    };

    deepmerge.withArgs({
      height: 400,
      width: 800,
      type: 'line',
      points: true,
      stroke: true,
      grid: true,
      filename: 'out'
    }, {}).returns({
      height: 400,
      width: 800,
      type: 'line',
      filename: 'out',
      grid: true,
      points: true,
      stroke: true
    });

    deepmerge.withArgs({
      height: 400,
      points: true,
      stroke: true,
      grid: true,
      width: 800,
      type: 'line',
      filename: 'out'
    }, { height: 1000, width: 337 }).returns({
      height: 1000,
      width: 337,
      type: 'line',
      filename: 'out',
      grid: true,
      points: true,
      stroke: true
    });

    deepmerge.withArgs({
      height: 400,
      width: 800,
      type: 'line',
      points: true,
      stroke: true,
      grid: true,
      filename: 'out'
    }, { filename: 'years' }).returns({
      height: 400,
      width: 800,
      type: 'line',
      points: true,
      stroke: true,
      grid: true,
      filename: 'years'
    });

    var mocks = {
      'deepmerge': deepmerge,
      'canvas': canvas,
      'fs': fs
    };

    shart = proxyquire(process.cwd() + '/index.js', mocks);
  });
  
  describe("#setup", function() {
    it("should call deepmerge with an empty object and standards if no options are provided", function() {
      shart.graph([1]);

      expect(deepmerge).calledOnce.and.calledWith({
        height: 400,
        width: 800,
        type: 'line',
        points: true,
        stroke: true,
        grid: true,
        filename: 'out'
      }, {});
    });

    it("should call deepmerge with options if provided", function() {
      shart.graph([1], { filename: 'years' });

      expect(deepmerge).calledOnce.and.calledWith({
        height: 400,
        width: 800,
        points: true,
        stroke: true,
        grid: true,
        type: 'line',
        filename: 'out'
      }, { filename: 'years' });    
    });
  });

  describe("#graph.line", function() {
    it("should call Canvas with standard size", function() {
      shart.graph([1]);
      
      expect(canvas).calledOnce.and.calledWith(800, 400);
    });

    it("should call Canvas with corrected size", function() {
      shart.graph([1], { height: 1000, width: 337 });
      
      expect(canvas).calledOnce.and.calledWith(337, 1000);
    });

    it("should call Canvas with the right context", function() {
      shart.graph([1]);
      
      expect(canvas.defaultBehavior.returnValue.getContext).calledOnce.and.calledWith('2d');
    });

    it("should call context to translate graph origin", function() {
      shart.graph([1]);
      
      expect(canvas.defaultBehavior.returnValue.getContext.defaultBehavior.returnValue.translate).calledOnce.and.calledWith(0, 400);
    });

    it("should set the correct font", function() {
      shart.graph([1]);
      
      expect(canvas.defaultBehavior.returnValue.getContext.defaultBehavior.returnValue.font).to.eql('bold 14px Liberator');
    });

    it("should output the image with a standard name", function() {
      shart.graph([1]);

      var gulp = '/usr/local/lib/node_modules/gulp/bin/public/';

      expect(fs.createWriteStream).calledOnce.and.calledWith(gulp + 'out.png');
      expect(canvas.defaultBehavior.returnValue.pngStream).calledOnce;
    });

    it("should output the image with a given name", function() {
      shart.graph([1], { filename: 'years' });

      var gulp = '/usr/local/lib/node_modules/gulp/bin/public/';

      expect(fs.createWriteStream).calledOnce.and.calledWith(gulp + 'years.png');
      expect(canvas.defaultBehavior.returnValue.pngStream).calledOnce;
    });
  });
});
