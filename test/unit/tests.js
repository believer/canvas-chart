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
  var chart;
  var opts;
  var data;

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
      height: 450,
      width: 800
    });

    deepmerge = sinon.stub();

    fs = {
      createWriteStream: sinon.spy()
    };
    
    data = [1];

    opts = {
      filename: 'public/out',
      grid: true,
      height: 450,
      points: true,
      stroke: true,
      type: 'line',
      width: 800
    };

    deepmerge.withArgs(opts, {}).returns({
      filename: 'public/out',
      grid: true,
      height: 450,
      points: true,
      stroke: true,
      type: 'line',
      width: 800
    });

    deepmerge.withArgs(opts, { height: 1000, width: 337 })
    .returns({
      filename: 'public/out',
      grid: true,
      height: 1000,
      max: Math.max.apply(null, data),
      points: true,
      stroke: true,
      type: 'line',
      width: 337
    });

    deepmerge.withArgs(opts, { filename: 'years' }).returns({
      filename: 'public/years',
      grid: true,
      height: 450,
      max: Math.max.apply(null, data),
      points: true,
      stroke: true,
      type: 'line',
      width: 800
    });

    var mocks = {
      'deepmerge': deepmerge,
      'canvas': canvas,
      'fs': fs
    };

    chart = proxyquire(process.cwd() + '/index.js', mocks);
  });
  
  describe("#setup", function() {
    it("should call deepmerge with an empty object and standards if no options are provided", function() {
      chart.graph(data);

      expect(deepmerge).calledOnce.and.calledWith(opts, {});
    });

    it("should call deepmerge with options if provided", function() {
      chart.graph(data, { filename: 'years' });

      expect(deepmerge).calledOnce.and.calledWith(opts, { filename: 'years' });    
    });
  });

  describe("#graph.line", function() {
    it("should call Canvas with standard size", function() {
      chart.graph(data);
      
      expect(canvas).calledOnce.and.calledWith(800, opts.height);
    });

    it("should call Canvas with corrected size", function() {
      chart.graph(data, { height: 1000, width: 337 });
      
      expect(canvas).calledOnce.and.calledWith(337, 1000);
    });

    it("should call Canvas with the right context", function() {
      chart.graph(data);
      
      expect(canvas.defaultBehavior.returnValue.getContext).calledOnce.and.calledWith('2d');
    });

    it("should call context to translate graph origin", function() {
      chart.graph(data);
      
      expect(canvas.defaultBehavior.returnValue.getContext.defaultBehavior.returnValue.translate).calledOnce.and.calledWith(0, opts.height);
    });

    it("should set the correct font", function() {
      chart.graph(data);
      
      expect(canvas.defaultBehavior.returnValue.getContext.defaultBehavior.returnValue.font).to.eql('bold 14px Liberator');
    });

    it("should output the image with a standard name", function() {
      chart.graph(data);

      var gulp = '/usr/local/lib/node_modules/gulp/bin/';

      expect(fs.createWriteStream).calledOnce.and.calledWith(gulp + 'public/out.png');
      expect(canvas.defaultBehavior.returnValue.pngStream).calledOnce;
    });

    it("should output the image with a given name", function() {
      chart.graph(data, { filename: 'years' });

      var gulp = '/usr/local/lib/node_modules/gulp/bin/';

      expect(fs.createWriteStream).calledOnce.and.calledWith(gulp + 'public/years.png');
      expect(canvas.defaultBehavior.returnValue.pngStream).calledOnce;
    });
  });
});
