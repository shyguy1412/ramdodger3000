
//ExpressionStatement
(() => window)();

//BlockStatement
{
  window;
}

//LabledStatement
label: {
  window;
}

//IfStatement
if (window) {
  window;
} else {
  window;
}

//SwitchStatement
switch (1) {
  case 1:
    window;
    break;
}

//ThrowStatement
// throw window;

//TryStatement
try {
  window;
} catch (e) {
  e;
}

//WhileStatement
while (false) window;

//DoWhileStatement
do { window; } while (false);


//ForStatement
for (let i = 0; i < 10; i++) window;

//ForInStatement
for (const key in { key: window }) window;

//ForOfStatement
for (const el in [1, 2, 3]) window;

//VariableDeclaration
var a;
var b = window;
let c;
let d = window;
let obj = {
  window
};
const e = window;

//FunctionDeclartion
function f() {
  window;
}

//ClassDeclaration
class g {
  constructor() {
    window;
  }
}

//ExportNamedDeclaration
export var h;
export var i = window;
export var i1, i2, i3 = window;
export let j;
export let k = window;
export let k1, k2, k3 = window;
export const l = window;
export const l1 = window, l2 = window, l3 = window;

export function m() {
  window;
}

export async function async_m() {
  await window;
}

export class n {
  constructor() {
    window;
  }
}

var o = class extends n {
  terminalInput = null;
  terminalElement = null;
};

export { a, b, c, d };

//ExportDefaultDeclaration
export default window;

// ExportAllDeclarataion
export * from '';