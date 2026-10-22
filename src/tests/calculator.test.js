const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluate } = require('../calculator');

test('evaluates the addition example from the image', () => {
  assert.equal(evaluate('2 + 3'), 5);
});

test('evaluates the subtraction example from the image', () => {
  assert.equal(evaluate('10 - 4'), 6);
});

test('evaluates the multiplication example from the image', () => {
  assert.equal(evaluate('45 * 2'), 90);
});

test('evaluates the division example from the image', () => {
  assert.equal(evaluate('20 / 5'), 4);
});

test('supports decimal and negative operands', () => {
  assert.equal(evaluate('1.5 + 2.25'), 3.75);
  assert.equal(evaluate('-8 - 2'), -10);
  assert.equal(evaluate('-3 * 4'), -12);
  assert.equal(evaluate('7 / -2'), -3.5);
});

test('applies multiplication and division before addition and subtraction', () => {
  assert.equal(evaluate('2 + 3 * 4'), 14);
  assert.equal(evaluate('20 - 12 / 3'), 16);
});

test('evaluates operators of equal precedence from left to right', () => {
  assert.equal(evaluate('20 / 5 * 2'), 8);
  assert.equal(evaluate('10 - 3 - 2'), 5);
});

test('respects operator precedence and parentheses', () => {
  assert.equal(evaluate('2 + 3 * (4 - 1)'), 11);
  assert.equal(evaluate('(2 + 3) * 4'), 20);
});

test('supports unary signs and whitespace', () => {
  assert.equal(evaluate('-2.5 + +4'), 1.5);
  assert.equal(evaluate('2 + 3   '), 5);
  assert.equal(evaluate('  2\t*\n3  '), 6);
  assert.equal(evaluate('--2'), 2);
});

test('rejects direct and expression-based division by zero', () => {
  assert.throws(() => evaluate('4 / 0'), /Division by zero/);
  assert.throws(() => evaluate('1 / (3 - 3)'), /Division by zero/);
});

test('rejects empty expressions and values that are not strings', () => {
  assert.throws(() => evaluate(''), /Expression cannot be empty/);
  assert.throws(() => evaluate('   '), /Expression cannot be empty/);
  assert.throws(() => evaluate(42), {
    name: 'TypeError',
    message: 'Expression must be a string',
  });
});

test('rejects invalid tokens and unsupported operations', () => {
  assert.throws(() => evaluate('2 + process.exit()'), /Invalid expression/);
  assert.throws(() => evaluate('2 % 3'), /Invalid expression/);
  assert.throws(() => evaluate('2 ** 3'), /Expected a number/);
});

test('rejects incomplete expressions and unmatched parentheses', () => {
  assert.throws(() => evaluate('2 +'), /Expected a number/);
  assert.throws(() => evaluate('(2 + 3'), /Missing closing parenthesis/);
  assert.throws(() => evaluate('2 + 3)'), /Unexpected token/);
});

test('rejects results outside the finite number range', () => {
  assert.throws(() => evaluate('9'.repeat(400)), /not a finite number/);
});
