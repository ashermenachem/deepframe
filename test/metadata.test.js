import test from 'node:test';
import assert from 'node:assert/strict';
import exifr from 'exifr';
import {coordinates,cameraSettings,escapeHTML,flattenGroups} from '../src/metadata.js';
test('GPS handles equator, prime meridian, hemisphere, and invalid coordinates',()=>{
 assert.deepEqual(coordinates({latitude:0,longitude:0}),{latitude:0,longitude:0});
 assert.deepEqual(coordinates({GPSLatitude:[33,30,0],GPSLatitudeRef:'S',GPSLongitude:[70,15,0],GPSLongitudeRef:'W'}),{latitude:-33.5,longitude:-70.25});
 assert.equal(coordinates({latitude:95,longitude:0}),null);assert.equal(coordinates({}),null);
});
test('untrusted metadata is escaped before rendering',()=>assert.equal(escapeHTML('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
test('exposure settings preserve actual values and absence',()=>{assert.equal(cameraSettings({FNumber:2.8,ExposureTime:.002,ISO:100,FocalLength:35}),'ƒ/2.8 · 1/500 s · ISO 100 · 35 mm');assert.equal(cameraSettings({}),'')});
test('real TIFF bytes yield original camera and timestamp without inventing timezone',async()=>{
 const fields=[[0x010f,'Deepframe Camera'],[0x0110,'Fixture One'],[0x0132,'2026:10:27 10:30:45']];
 const start=8+2+fields.length*12+4;const buffer=Buffer.alloc(start+fields.reduce((n,[,s])=>n+s.length+1,0));buffer.write('II');buffer.writeUInt16LE(42,2);buffer.writeUInt32LE(8,4);buffer.writeUInt16LE(fields.length,8);let offset=start;
 fields.forEach(([tag,value],i)=>{const e=10+i*12;buffer.writeUInt16LE(tag,e);buffer.writeUInt16LE(2,e+2);buffer.writeUInt32LE(value.length+1,e+4);buffer.writeUInt32LE(offset,e+8);buffer.write(value,offset);offset+=value.length+1});
 const groups=await exifr.parse(buffer,{mergeOutput:false,reviveValues:false});const tags=flattenGroups(groups);assert.equal(tags.Make,'Deepframe Camera');assert.equal(tags.Model,'Fixture One');assert.equal(tags.ModifyDate,'2026:10:27 10:30:45');assert.equal(coordinates(tags),null);
});
