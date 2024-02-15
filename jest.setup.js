// Error: zone-testing.js is needed for the fakeAsync()
import 'zone.js';
import 'zone.js/testing';

// Error:  ReferenceError: TextDecoder is not defined for angular/fire
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

console.log('Jest setup file is loaded!');

// Error: Need to call TestBed.initTestEnvironment() first
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
