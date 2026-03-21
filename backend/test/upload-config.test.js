const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveUploadFolder } = require('../src/config/upload');

test('resolveUploadFolder keeps allowed folders', () => {
  assert.equal(resolveUploadFolder('albums'), 'albums');
  assert.equal(resolveUploadFolder('images'), 'images');
});

test('resolveUploadFolder rejects traversal and unknown folders', () => {
  assert.equal(resolveUploadFolder('../albums'), 'images');
  assert.equal(resolveUploadFolder('..\\albums'), 'images');
  assert.equal(resolveUploadFolder('anything-else'), 'images');
  assert.equal(resolveUploadFolder(undefined), 'images');
});
