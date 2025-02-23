// Error: zone-testing.js is needed for the fakeAsync()
import 'cross-fetch/polyfill';
import 'zone.js';
import 'zone.js/testing';

// Error:  ReferenceError: TextDecoder is not defined for angular/fire
const { TextEncoder, TextDecoder, ReadableStream } = require('node:util');
Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
  ReadableStream: { value: ReadableStream },
});

console.log('Jest setup file is loaded!');

// Error: Need to call TestBed.initTestEnvironment() first
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// auto spy - https://ng-mocks.sudo.eu/extra/auto-spy
import { ngMocks } from 'ng-mocks';
ngMocks.autoSpy('jest');

global.console = {
  ...console,
  // uncomment to ignore a specific log level
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
