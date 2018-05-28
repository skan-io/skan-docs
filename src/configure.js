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


async function updatePackageJson(pkg, path) {
  return new Promise(function (resolve, reject) {
    try {
      if (!pkg.scripts) {
        pkg.scripts = {};
      }
      console.log('');
      console.log(`${chalk.yellow('Adding \'docs:proj\', \'docs:proj:serve\', \'docs:proj:build\' scripts.')}`);

      pkg.scripts['docs:proj'] = 'docsify serve docs';

      fs.writeFile(path, JSON.stringify(pkg, null, 2), (err)=> {
        if (err) {
          reject(err);
        }

        console.log(`${chalk.yellow(`Successfully updated ${path}`)}`);
        console.log('');

        resolve();
      });

      // TODO uncomment this when ready to remove package.json
      // fs.unlink(path, (err)=> {
      //   if (err) {
      //     reject(err);
      //   }
      //
      //   console.log(`${chalk.yellow(`Removed (outdated) ${path}`)}`);
      //   console.log('');
      // });

    } catch (err) {
      reject(err);
    }
  });
};


async function copyFiles() {
  console.log(__dirname);
}


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

  try {
    let {stdout, stderr} = await sh('npm i -g docsify-cli');

    for (let line of stderr.split('\n')) {
      console.log(`${chalk.white(chalk.bold(line))}`);
    }
    for (let line of stdout.split('\n')) {
      console.log(`${chalk.green(line)}`);
    }
  } catch (err) {
    console.log(`${chalk.red(err)}`);
  }

  console.log(`${chalk.yellow('docsify-cli successfully installed.')}`);
  console.log('');
  console.log(`${chalk.yellow('==> Downloading and installing npm-run-all...')}`);

  try {
    let {stdout, stderr} = await sh('npm i npm-run-all');

    for (let line of stderr.split('\n')) {
      console.log(`${chalk.white(chalk.bold(line))}`);
    }
    for (let line of stdout.split('\n')) {
      console.log(`${chalk.green(line)}`);
    }
  } catch (err) {
    console.log(`${chalk.red(err)}`);
  }

  console.log(`${chalk.yellow('npm-run-all successfully installed.')}`);

  console.log('');
  console.log(`${chalk.yellow('==> Updating package.json scripts...')}`);

  await updatePackageJson(pkgJson, pkgPath);

  console.log('');
  console.log(`${chalk.yellow('==> Downloading and installing serve...')}`);

  try {
    let {stdout, stderr} = await sh('npm i serve');

    for (let line of stderr.split('\n')) {
      console.log(`${chalk.white(chalk.bold(line))}`);
    }
    for (let line of stdout.split('\n')) {
      console.log(`${chalk.green(line)}`);
    }
  } catch (err) {
    console.log(`${chalk.red(err)}`);
  }

  console.log(`${chalk.yellow('serve successfully installed.')}`);

  console.log('');
  console.log(`${chalk.yellow('==> Copying template files...')}`);

  await copyFiles();

  if (serveDocs) {

    // TODO: open docs in a new tab ttab maybe?

    console.log('');
    console.log(`${chalk.green('SUCCESSFULLY INSTALLED PROJECT DOC TEMPLATE!')}`);
    console.log('');
    console.log(`${chalk.green('==> Setting up document server...')}`);
    console.log('');
  } else {
    console.log('');
    console.log(`${chalk.green('SUCCESSFULLY INSTALLED PROJECT DOC TEMPLATE!')}`);
  }
};

main();
