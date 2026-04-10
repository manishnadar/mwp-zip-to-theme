import fs from 'fs';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<div id="gjs"></div>');
global.window = dom.window;
global.document = dom.window.document;
import grapesjs from 'grapesjs';
const editor = grapesjs.init({ container: '#gjs', storageManager: false });
setTimeout(() => {
  fs.writeFileSync('dom.html', document.getElementById('gjs').innerHTML);
  console.log("Done");
}, 500);
