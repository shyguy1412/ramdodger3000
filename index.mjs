  import { generate } from 'astring';
import { parse } from 'acorn';
import { simple } from 'acorn-walk';
import { writeFileSync } from 'fs';

/**
 * 
 * @param {import('acorn').AnyNode} node 
 * @returns {import('acorn').CallExpression}
 */
function generateEvalExpressionForNode(node) {
  return {
    type: 'CallExpression',
    optional: false,
    start: 0,
    end: 0,
    callee: {
      type: 'Identifier',
      name: 'eval',
      start: 0,
      end: 0,
    },
    arguments: [
      {
        type: 'Literal',
        value: generate(node.type == 'ExpressionStatement' ? node : {
          type: "ExpressionStatement",
          expression: node
        }),
        start: 0,
        end: 0,
      }
    ]
  };
}

/**
 * 
 * @param {string} file 
 * @param {import('astring').Options | undefined} options 
 * @returns 
 */
export default function RamDodger3000(file, options) {

  const ast = parse(file, { ecmaVersion: 'latest', sourceType: 'module' });

  /**
   * @type {import('acorn').Statement[]}
   */
  const hoist = [];
  /**
   * @type {import('acorn').ExpressionStatement[]}
   */
  const ramDirectives = [];

  const DodgeMap = {

    /**
     * @param {import('acorn').ExpressionStatement} node 
     * @returns {import('acorn').ExpressionStatement}
     */
    ExpressionStatement(node) {
      return {
        type: 'ExpressionStatement',
        expression: generateEvalExpressionForNode(node),
        start: 0,
        end: 0
      };
    },
    BlockStatement(node) {
      return DodgeMap.ExpressionStatement(node);
    },
    EmptyStatement(node) {
      return node;
    },
    DebuggerStatement(node) {
      return node;
    },
    ReturnStatement(node) {
      return node;
    },
    LabeledStatement(node) {
      return DodgeMap.ExpressionStatement(node);
    },
    BreakStatement(node) {
      return node;
    },
    ContinueStatement(node) {
      return node;
    },
    IfStatement(node) {
      return DodgeMap.ExpressionStatement(node);
    },
    SwitchStatement(node) {
      return DodgeMap.ExpressionStatement(node);
    },
    ThrowStatement(node) {
      return DodgeMap.ExpressionStatement(node);
    },
    TryStatement(node) {
      return DodgeMap.ExpressionStatement(node);
    },
    WhileStatement(node) {
      return DodgeMap.ExpressionStatement(node);
    },
    DoWhileStatement(node) {
      return DodgeMap.ExpressionStatement(node);
    },
    ForStatement(node) {
      return DodgeMap.ExpressionStatement(node);
    },
    ForInStatement(node) {
      return DodgeMap.ExpressionStatement(node);
    },
    ForOfStatement(node) {
      return DodgeMap.ExpressionStatement(node);
    },


    /**
    * 
    * @param {import('acorn').VariableDeclaration} node 
    * @returns {import('acorn').VariableDeclaration}
    */
    VariableDeclaration(node) {
      for (const declarator of node.declarations) {
        if (!declarator.init) continue;
        declarator.init = generateEvalExpressionForNode(declarator.init);
      }
      return node;
    },

    /**
     * 
     * @param {import('acorn').FunctionDeclaration} node 
     * @returns {[]}
    */
    FunctionDeclaration(node) {
      if (!node.id) {
        throw new Error('Unexpected anonymous function\n' + JSON.stringify(node, null, 2));
      }

      hoist.push({
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'Identifier',
              name: node.id.name,
              start: 0,
              end: 0,
            },
            start: 0,
            end: 0,
            init: generateEvalExpressionForNode({
              type: 'ExpressionStatement',
              expression: {
                type: 'FunctionExpression',
                params: node.params,
                body: node.body,
                async: node.async,
                generator: node.generator
              }
            })
            // init: generateEvalExpressionForNode(node)
          },
        ],
        start: 0,
        end: 0
      });

      return [];
    },

    /**
     * 
     * @param {import('acorn').ClassDeclaration} node 
     * @returns {[]}
    */
    ClassDeclaration(node) {
      if (!node.id) {
        throw new Error('Unexpected anonymous class\n' + JSON.stringify(node, null, 2));
      }

      hoist.push({
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'Identifier',
              name: node.id.name,
              start: 0,
              end: 0,
            },
            start: 0,
            end: 0,
            init: generateEvalExpressionForNode({
              type: 'ExpressionStatement',
              expression: {
                type: 'ClassExpression',
                superClass: node.superClass,
                body: node.body
              }
            })
            // init: generateEvalExpressionForNode(node)
          },
        ],
        start: 0,
        end: 0
      });

      return [];
    },

    ImportDeclaration(node) {
      return node;
    },

    /**
     * 
     * @param {import('acorn').ExportNamedDeclaration} node 
     * @returns {import('acorn').AnyNode[]}
    */
    ExportNamedDeclaration(node) {
      if (!node.declaration) return node;
      const declaration = DodgeMap[node.declaration.type](node.declaration);
      if (!declaration.declarations) {
        return {
          type: 'ExportNamedDeclaration',
          declaration: null,
          specifiers: [{
            type: 'ExportSpecifier',
            local: node.declaration.id,
            exported: node.declaration.id
          }]
        };
      }
      return [
        declaration
        , {
          type: 'ExportNamedDeclaration',
          declaration: null,
          specifiers: declaration.declarations.map(d => ({
            type: 'ExportSpecifier',
            local: d.id,
            exported: d.id
          }))
        }
      ];
    },
    ExportDefaultDeclaration(node) {
      node.declaration = generateEvalExpressionForNode(node.declaration);
      return node;
    },
    ExportAllDeclaration(node) {
      return node;
    }
  };

  simple(ast, {
    ExpressionStatement(node) {
      if (!node.directive) return;
      if (!/^use _?[0-9A-Za-z_\.]*$/.test(node.directive)) return;
      if (ramDirectives.find(d => d.directive == node.directive)) return;
      ramDirectives.push({
        type: "ExpressionStatement",
        start: 0,
        end: 0,
        directive: node.directive,
        expression: {
          type: "MemberExpression",
          start: 0,
          end: 0,
          object: {
            type: "Identifier",
            start: 0,
            end: 0,
            name: 'ns'
          },
          property: {
            type: "Identifier",
            start: 0,
            end: 0,
            name: /^use (ns\.)?(_?[0-9A-Za-z_\.]*)$/.exec(node.directive)[2]
          },
          computed: false,
          optional: false
        }
      });
    }
  });

  ast.body = ast.body.map(node => (DodgeMap[node.type] ?? (_ => _))(node)).flat();
  ast.body.unshift(...hoist);
  ast.body.unshift({
    type: "ExpressionStatement",
    expression: {
      type: "ArrowFunctionExpression",
      start: 0,
      end: 0,
      id: null,
      expression: false,
      generator: false,
      async: false,
      params: [
        {
          type: "Identifier",
          start: 0,
          end: 0,
          name: "ns"
        }
      ],
      body: {
        type: "BlockStatement",
        start: 0,
        end: 0,
        body: ramDirectives
      }
    }
  });

  // writeFileSync('ast_dump.json', JSON.stringify(ast, null, 2));

  return generate(ast, options);
}
