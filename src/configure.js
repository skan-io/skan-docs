#!/usr/bin/env node
'use strict';

import {exec} from 'child_process';
import {ArgumentParser} from 'argparse';
import chalk from 'chalk';
import art from 'ascii-art';
import path from 'path';
import fs from 'fs';

const version = '1.0.0';


// Command line arguments parser
const parser = new ArgumentParser({
  version,
  addHelp: true,
  description: `A command line tool to help install skan.io doc tools and serve example usage`,
  epilog: `(DEFAULT) Will download docsify-cli, add 'docs:proj', 'docs:proj:serve',
  and docs:proj:build scripts to your project package-lock.json, will start a
  gh-pages branch on your repo at the current HEAD and will tag it with version
  v0.0.1`,
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
    metavar: '<PATH>'
  }
);

parser.addArgument(
  ['-s', '--serve'],
  {
    help: 'Serve your documentation after setup',
    action: 'storeTrue',
    defaultValue: false,
    dest: 'serveDocs'
  }
);


/**
 * Execute simple shell command (async wrapper).
 * @param {String} cmd
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
 * [tryLogCommand description]
 * @param  {asdas} cmd [description]
 * @return {asdas}     [description]
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
 * [printHeadingAndArt description]
 * @return {asdasd} [description]
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
 * [updatePackageJson description]
 * @param  {asdasd} pkg  [description]
 * @param  {assda} path [description]
 * @return {asdad}      [description]
 */
async function updatePackageJson(pkg, path) {
  return new Promise(function (resolve, reject) {
    try {
      if (!pkg.scripts) {
        pkg.scripts = {};
      }
      console.log('');
      console.log(`${chalk.yellow('Adding \'docs:proj\', \'docs:code\', \'docs:*\' scripts.')}`);

      pkg.scripts['docs'] = 'run-s -s docs:code docs:proj';
      pkg.scripts['docs:proj'] = 'docsify serve docs';
      pkg.scripts['docs:code'] = ``;
      pkg.scripts['lint'] = 'run-s -s lint:*';
      pkg.scripts['lint:md'] = 'remark -i .gitignore --no-stdout --use remark-lint *.md';
      pkg.scripts['lint:docs'] = 'remark -i .gitignore --no-stdout --use remark-lint docs/*.md';

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
 * [copyFiles description]
 * @return {asdad} [description]
 */
async function copyFiles() {
  console.log(__dirname);
}


/**
 * [main description]
 * @return {adsasd} [description]
 */
// Main functionality!
async function main() {
  const args = parser.parseArgs(process.argv.slice(2));

  const {packagePath, serveDocs} = args;

  const pkgPath = packagePath === null
    ? path.resolve('.', 'package.json')
    : path.resolve(packagePath, 'package.json');

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
  console.log(`${chalk.yellow('==> Downloading and installing docsify-cli...')}`);

  await tryLogCommand('npm i -g docsify-cli');

  console.log(`${chalk.yellow('docsify-cli successfully installed.')}`);
  console.log('');
  console.log(`${chalk.yellow('==> Downloading and installing jsdoc-to-markdown...')}`);

  await tryLogCommand('npm i -g jsdoc-to-markdown');

  console.log(`${chalk.yellow('jsdoc-to-markdown successfully installed.')}`);
  console.log('');
  console.log(`${chalk.yellow('==> Downloading and installing remark-cli and remark-lint...')}`);

  await tryLogCommand('npm i remark-cli remark-lint');

  console.log(`${chalk.yellow('jsdoc-to-markdown successfully installed.')}`);
  console.log('');
  console.log(`${chalk.yellow('==> Downloading and installing npm-run-all...')}`);

  await tryLogCommand('npm i npm-run-all');

  console.log(`${chalk.yellow('npm-run-all successfully installed.')}`);

  console.log('');
  console.log(`${chalk.yellow('==> Updating package.json scripts...')}`);

  await updatePackageJson(pkgJson, pkgPath);

  console.log('');
  console.log(`${chalk.yellow('==> Downloading and installing serve...')}`);

  await tryLogCommand('npm i serve');

  console.log(`${chalk.yellow('serve successfully installed.')}`);

  console.log('');
  console.log(`${chalk.yellow('==> Copying template files...')}`);

  await copyFiles();

  if (serveDocs) {

    // TODO: open docs in a new tab ttab maybe?

    console.log('');
    console.log(`${chalk.green('Successfully installed project docs template!')}`);
    console.log('');
    console.log(`${chalk.green('==> Setting up document server...')}`);
    console.log('');
  } else {
    console.log('');
    console.log(`${chalk.green('Successfully installed project docs template!')}`);
  }
};

main();
