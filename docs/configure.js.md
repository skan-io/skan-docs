
 ## configure.js 
 
 ```javascript 
#!/usr/bin/env node
'use strict';


/**
 * Source code for the 'skan-docs' binary
 * @module Configure
 * @example
 * // bash shell
 * skan-docs -p ./src --serve
 */


import {exec} from 'child_process';
import {ArgumentParser} from 'argparse';
import chalk from 'chalk';
import art from 'ascii-art';
import path from 'path';
import fs from 'fs';
import copy from 'copy';


/**
 * 'skan-convert' binary version.
 *
 * @const
 * @type {String}
 */
const version = '1.0.8';


/**
 * Pass the commandline arguments through argparse module.
 *
 * @const
 * @type {ArgumentParser}
 */
const parser = new ArgumentParser({
  version,
  addHelp: true,
  description: `A command line tool to help install skan.io doc tools and serve example usage`,
  epilog: `(DEFAULT) Will download docsify-cli, add 'docs:proj', 'docs:proj:serve',
  and docs:proj:build scripts to your project package-lock.json, will start a
  gh-pages branch on your repo at the current HEAD and will tag it with version
  v${version}`,
  prog: 'npm start'
});

const defaultPath = null;
const defaultServe = false;

parser.addArgument(
  ['-p', '--package'],
  {
    help: 'Choose the path to your package.json',
    action: 'store',
    defaultValue: defaultPath,
    dest: 'packagePath',
    metavar: '&lt;PATH>'
  }
);
parser.addArgument(
  ['--no-code'],
  {
    help: 'If true will not set up code docs with jsdoc',
    action: 'storeFalse',
    defaultValue: true,
    dest: 'codeDocs'
  }
);
parser.addArgument(
  ['--no-react'],
  {
    help: 'If true will not set up react component style guide',
    action: 'storeFalse',
    defaultValue: true,
    dest: 'reactDocs'
  }
);


/**
 * Execute simple shell command (async wrapper).
 *
 * @param {String} cmd Shell command to be run (bash)
 * @return {Object} { stdout: String, stderr: String }
 */
async function sh(cmd) {
  return new Promise(function (resolve, reject) {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({stdout, stderr});
      }
    });
  });
};

/**
 * Given a shell command, try the command and catch or log
 * the error or response.
 *
 * @param  {String} cmd Shell command to be run (bash)
 * @return {Void}     Logs errors and stdout
 */
async function tryLogCommand(cmd) {
  try {
    let {stdout, stderr} = await sh(cmd);

    for (let line of stderr.split('\n')) {
      console.log(`${chalk.white(chalk.bold(line))}`);
    }
    for (let line of stdout.split('\n')) {
      console.log(`${chalk.green(line)}`);
    }
  } catch (err) {
    console.log(`${chalk.red(err)}`);
  }
};


/**
 * Print the skan logo ascii art.
 *
 * @return {Void} Ascii art printed to console
 */
// Print ascii art and Skan.io heading
async function printHeadingAndArt() {
  return new Promise(function (resolve, reject) {
    const image = new art.image({
      width : 80,
  	  filepath: path.join(__dirname, 'skan.png'),
  	  alphabet:'variant4'
    }).font('DOCS.', 'Doom', 'cyan', function(ascii){
  	   console.log(ascii);
       resolve();
    });
  });
};

/**
 * Add script commands to the passed package json object.
 *
 * @param  {Object} pkg  { package.json }
 * @param  {String} path Path to write updated package.json out to
 * @return {Promise}     Promise, when resolved has updated package.json
 */

/**
 * Add script commands to the passed package json object.
 * @param  {Object} pkg  { package.json }
 * @param  {String} path Path to write updated package.json out to
 * @param  {Boolean} codeDocs  True if include code docs scripts
 * @param  {Boolean} reactDocs True if include react style guide scripts
 * @return {Promise}     Promise, when resolved has updated package.json
 */
async function updatePackageJson(pkg, path, codeDocs, reactDocs) {
  return new Promise(function (resolve, reject) {
    try {
      if (!pkg.scripts) {
        pkg.scripts = {};
      }
      console.log('');
      console.log(`${chalk.yellow('Adding docs and lint scripts to package.json.')}`);

      if (codeDocs &amp;&amp; reactDocs) {
        pkg.scripts['docs'] = 'run-s -s docs:code docs:proj';
        pkg.scripts['docs:code'] = 'run-s docs:clear docs:build docs:clear';
        pkg.scripts['docs:proj'] = 'docsify serve docs';
        pkg.scripts['docs:clear'] = 'rm -rf ./out/';
        pkg.scripts['docs:build'] = 'jsdoc ./src || exit 0 &amp;&amp; skan-convert -p ./out -o ./docs || exit 0';
        pkg.scripts['lint'] = 'run-s -s lint:*';
        pkg.scripts['lint:md'] = 'remark -i .gitignore --no-stdout --use remark-lint *.md';
        pkg.scripts['lint:docs'] = 'remark -i .gitignore /docs --no-stdout --use remark-lint docs/*.md';

        // TODO add react style guide scripts

      } else if (!codeDocs) {
        pkg.scripts['docs'] = 'run-s -s docs:proj';
        pkg.scripts['docs:proj'] = 'docsify serve docs';
        pkg.scripts['lint'] = 'run-s -s lint:*';
        pkg.scripts['lint:md'] = 'remark -i .gitignore --no-stdout --use remark-lint *.md';
        pkg.scripts['lint:docs'] = 'remark -i .gitignore /docs --no-stdout --use remark-lint docs/*.md';

        // TODO add react style guide scripts
      }

      fs.writeFile(path, JSON.stringify(pkg, null, 2), (err)=> {
        if (err) {
          reject(err);
        }

        console.log(`${chalk.yellow(`Successfully updated ${path}`)}`);
        console.log('');

        resolve();
      });

    } catch (err) {
      reject(err);
    }
  });
};


/**
 * Copy template files into the docs directory.
 *
 * @param  {String} packagePath Path to package.json directory
 * @return {Void}             Templated files copied to docs directory
 */
async function copyFiles(packagePath) {
  const docsPath = path.join(path.dirname(packagePath), 'docs');
  const templatePath = path.join(__dirname, 'templates/*.*');

  copy(templatePath, docsPath, (err, files)=> {
    if (err) {
      console.log(err);
    }
  });
}


/**
 * Entry point.
 *
 * @return {Void}
 */
// Main functionality!
async function main() {
  const args = parser.parseArgs(process.argv.slice(2));

  const {packagePath, codeDocs, reactDocs} = args;

  const pkgPath = packagePath === null
    ? path.resolve('.', 'package.json')
    : path.resolve(packagePath, 'package.json');

  console.log({pkgPath});

  let pkgJson = null;

  try {
    pkgJson = require(pkgPath);
  } catch (err) {
    console.log(`${chalk.red(err)}`);
    return;
  }

  await printHeadingAndArt();

  console.log('');
  console.log(`${chalk.yellow('Welcome to Skan.io doctool.')}`);
  console.log('');
  console.log(`${chalk.yellow('==> Updating package.json scripts...')}`);

  await updatePackageJson(pkgJson, pkgPath, codeDocs, reactDocs);

  console.log('');
  console.log(`${chalk.yellow('==> Downloading and installing docsify-cli...')}`);

  await tryLogCommand('npm i -g docsify-cli &amp;&amp; npm i -D docsify-cli');

  console.log(`${chalk.yellow('docsify-cli successfully installed.')}`);

  if (codeDocs) {
    console.log('');
    console.log(`${chalk.yellow('==> Downloading and installing babel-core and babel-cli')}`);

    await tryLogCommand('npm i babel-core babel-cli');

    console.log(`${chalk.yellow('babel successfully installed.')}`);
    console.log('');
    console.log(`${chalk.yellow('==> Downloading and installing jsdoc and jsdoc-babel')}`);

    await tryLogCommand('npm i -g jsdoc jsdoc-babel &amp;&amp; npm i -D jsdoc jsdoc-babel');

    console.log(`${chalk.yellow('jsdoc successfully installed.')}`);
  }

  console.log('');
  console.log(`${chalk.yellow('==> Downloading and installing remark-cli and remark-lint...')}`);

  await tryLogCommand('npm i remark-cli remark-lint');

  console.log(`${chalk.yellow('remark-lint and remark-cli successfully installed.')}`);
  console.log('');
  console.log(`${chalk.yellow('==> Downloading and installing npm-run-all...')}`);

  await tryLogCommand('npm i npm-run-all');

  console.log(`${chalk.yellow('npm-run-all successfully installed.')}`);

  console.log('');
  console.log(`${chalk.yellow('==> Downloading and installing serve...')}`);

  await tryLogCommand('npm i -D serve &amp;&amp; npm i -g serve');

  console.log(`${chalk.yellow('serve successfully installed.')}`);

  console.log('');
  console.log(`${chalk.yellow('==> Copying template files...')}`);

  await copyFiles(pkgPath);

  console.log('');
  console.log(`${chalk.green('Successfully installed project docs template!')}`);
};

main();
 ``` 
