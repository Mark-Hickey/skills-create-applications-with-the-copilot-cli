#!/usr/bin/env node

// Supported arithmetic operations: addition (+), subtraction (-),
// multiplication (*), division (/), modulo (%), exponentiation (^),
// and square root (sqrt).

function tokenize(expression) {
  const tokens = [];
  const tokenPattern = /\s*(?:(\d+(?:\.\d*)?|\.\d+)|(sqrt)|([()+\-*/%^]))/y;
  let position = 0;

  while (position < expression.length) {
    if (expression.slice(position).trim() === '') {
      break;
    }

    tokenPattern.lastIndex = position;
    const match = tokenPattern.exec(expression);

    if (!match) {
      throw new Error(`Invalid expression near "${expression.slice(position)}"`);
    }

    tokens.push(
      match[1] !== undefined ? Number(match[1]) : match[2] !== undefined ? match[2] : match[3],
    );
    position = tokenPattern.lastIndex;
  }

  if (tokens.length === 0) {
    throw new Error('Expression cannot be empty');
  }

  return tokens;
}

function evaluate(expression) {
  if (typeof expression !== 'string') {
    throw new TypeError('Expression must be a string');
  }

  const tokens = tokenize(expression);
  let position = 0;

  function parsePrimary() {
    const token = tokens[position++];

    if (typeof token === 'number') {
      return token;
    }

    if (token === '(') {
      const value = parseExpression();
      if (tokens[position++] !== ')') {
        throw new Error('Missing closing parenthesis');
      }
      return value;
    }

    if (token === 'sqrt') {
      if (tokens[position++] !== '(') {
        throw new Error('Expected opening parenthesis after sqrt');
      }

      const value = parseExpression();
      if (tokens[position++] !== ')') {
        throw new Error('Missing closing parenthesis after sqrt');
      }
      if (value < 0) {
        throw new Error('Square root of a negative number');
      }
      return Math.sqrt(value);
    }

    throw new Error('Expected a number or parenthesized expression');
  }

  function parsePower() {
    const value = parsePrimary();

    if (tokens[position] === '^') {
      position++;
      return value ** parseUnary();
    }

    return value;
  }

  function parseUnary() {
    if (tokens[position] === '+') {
      position++;
      return parseUnary();
    }

    if (tokens[position] === '-') {
      position++;
      return -parseUnary();
    }

    return parsePower();
  }

  function parseTerm() {
    let value = parseUnary();

    while (tokens[position] === '*' || tokens[position] === '/' || tokens[position] === '%') {
      const operator = tokens[position++];
      const right = parseUnary();

      if (operator === '/' || operator === '%') {
        if (right === 0) {
          throw new Error(operator === '/' ? 'Division by zero' : 'Modulo by zero');
        }

        if (operator === '/') {
          value /= right;
        } else {
          value %= right;
        }
      } else {
        value *= right;
      }
    }

    return value;
  }

  function parseExpression() {
    let value = parseTerm();

    while (tokens[position] === '+' || tokens[position] === '-') {
      const operator = tokens[position++];
      const right = parseTerm();
      value = operator === '+' ? value + right : value - right;
    }

    return value;
  }

  const result = parseExpression();
  if (position !== tokens.length) {
    throw new Error('Unexpected token in expression');
  }

  if (!Number.isFinite(result)) {
    throw new Error('Result is not a finite number');
  }

  return result;
}

if (require.main === module) {
  const expression = process.argv.slice(2).join(' ');

  if (!expression || expression === '--help' || expression === '-h') {
    console.log('Usage: node src/calculator.js "<expression>"');
    console.log('Supports +, -, *, /, %, ^, and sqrt(...).');
    process.exitCode = expression ? 0 : 1;
  } else {
    try {
      console.log(evaluate(expression));
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exitCode = 1;
    }
  }
}

module.exports = { evaluate };
