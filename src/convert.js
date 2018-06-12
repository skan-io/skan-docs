#!/usr/bin/env node
'use strict';


/**
 * Source code for the 'skan-convert' binary
 * @module Convert
 * @example
 * // bash shell
 * skan-convert -p ./out -o ./docs
 */


import fs from 'fs';
import path from 'path';
import {ArgumentParser} from 'argparse';


/**
 * The splice() method changes the content of a string by removing a range of
 * characters and/or adding new characters.
 *
 * @this {String}
 * @param {Number} start Index at which to start changing the string.
 * @param {Number} delCount An integer indicating the number of old chars to remove.
 * @param {String} newSubStr The String that is spliced in.
 * @return {String} A new string with the spliced substring.
 */
String.prototype.splice = function(start, delCount, newSubStr) {
    return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
};


/**
 * 'skan-convert' binary version.
 *
 * @const
 * @type {String}
 */
const version = '1.0.9';


/**
 * List of files to be maintained.
 *
 * @const
 * @type {Array}
 */
const manifestFiles = [];


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

parser.addArgument(
  ['-p', '--path'],
  {
    help: 'The root directory of files to be converted',
    action: 'store',
    defaultValue: defaultPath,
    dest: 'dirname',
    metavar: '<PATH>'
  }
);
parser.addArgument(
  ['-o', '--output'],
  {
    help: 'Where to put the converted docs (default = \'./docs\')',
    action: 'store',
    defaultValue: defaultPath,
    dest: 'outdir',
    metavar: '<PATH>'
  }
);


const excludedExtensions = new Set(['css', 'scss', 'sass', 'json']);
const standardFiles = new Set([
  '_coverpage.md', '_navbar.md', '_sidebar.md',
  '.nojekyll', 'index.html', 'quickstart.md',
  'README.md', 'skan.png', 'config.md', 'deploy.md',
  'coverpage.md', 'custom-nav.md', 'more-pages.md',
  'configuration.md', 'manifest.json'
]);


/**
 * Given a string find all indices where the search string is located.
 *
 * @param  {String} searchStr     Subtring to search for
 * @param  {String} str           String to search within
 * @param  {Boolean} caseSensitive True if case sensitive
 * @return {Array}               Array of indicies where search term is
 *                               in parent string
 */
const getIndicesOf = (searchStr, str, caseSensitive)=> {
    const searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
      return [];
    }
    let startIndex = 0
    let index = null;
    const indices = [];

    if (!caseSensitive) {
      str = str.toLowerCase();
      searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
      indices.push(index);
      startIndex = index + searchStrLen;
    }
    return indices;
};


/**
 * Given a string find the next instance of the search string,
 * from the previous index
 *
 * @param  {String} searchStr     Subtring to search for
 * @param  {String} str           String to search within
 * @param  {Number} previousIndex Index to start search from
 * @return {Number}               The next found index of search term
 */
const getNextIndexOf = (searchStr, str, previousIndex)=> {
  const substring = str.substring(previousIndex);
  const idx = substring.indexOf(searchStr);

  return idx + previousIndex;
};


/**
 * Given a content string find all hrefs and replace the links
 * with appropriate path for docsify
 *
 * @param  {String} content File content as string
 * @return {String}         New file content as string with updated href
 *                          paths
 */
const updateHrefs = (content)=> {
  let previousIndex = 0;
  // length of 'href=' string
  const hlength = 5;
  const refs = [];
  const hrefs = getIndicesOf('href=', content);

  for (let i = 0; i < hrefs.length; i += 1) {
    const index = getNextIndexOf('href=', content, previousIndex) + hlength + 1;

    const remainder = content.substring(index);

    const ref = remainder.split('"', 1);

    const ext = ref[0].split('.').pop();

    if (!excludedExtensions.has(ext)) {
      const idxHtml = 'index.html';
      if (ref[0] === idxHtml) {
        content = content.splice(index, idxHtml.length, '#/code_index.html');
        previousIndex = index + idxHtml.length;
      } else {
        if (ref[0].includes('.js.html')) {
          const path = `#/${ref[0].replace('.js.html', '.js.md')}`;
          content = content.splice(index, ref[0].length, path);
          previousIndex = index + path.length;
        } else {
          const path = `#/${ref[0]}`;
          content = content.splice(index, ref[0].length, path);
          previousIndex = index + path.length;
        }
      }
    } else {
      previousIndex = index;
    }
  }

  return content;
};


/**
 * Given an output directory and filename, write the passed content
 * to that file and add the filename to the manifest.json
 *
 * @param  {String} outdir  Path of output directory
 * @param  {String} filename  Name of file to be written
 * @param  {String} content File content as string
 * @return {Void}         Content written to file and filename added to manifest.json
 */
const writeFileAndManifest = (outdir, filename, content, files)=> {
  fs.access(outdir, fs.constants.F_OK, (err)=> {
    console.log(`${err ? 'docs directory does not exist' : 'internal docs folder exists'}`);

    if (!err) {
      if (filename === 'index.html') {
        filename = 'code_index.html';
      } else if (filename.includes('.js.html')) {
        filename = filename.replace('.js.html', '.js.md');
      }

      if (standardFiles.has(filename)) {
        onError('Cannot override standard file names');
        return;
      }

      fs.writeFile(path.join(outdir, filename), content, {encoding: 'utf-8'}, (err)=> {
        if (err) throw err;
        console.log('The file has been saved!');

        manifestFiles.push(filename);

        const manifest = {
          files: manifestFiles
        };

        fs.writeFile(path.join(outdir, 'manifest.json'), JSON.stringify(manifest), {encoding: 'utf-8'}, (err)=> {
          if (err) throw err;
          console.log('The manifest has been saved!');
        });
      });
    }
  });
}


/**
 * Given a filename and dirname OR out directory, write the content
 * to the resolved file on that path
 *
 * @param  {String} filename Name of file to be written
 * @param  {String} content  File content as string
 * @param  {String} dirname  Path of source file directory
 * @param  {String} outdir  Path of output directory
 * @return {Void}
 */
const writeContentToDocs = (filename, content, dirname, outdir)=> {
  const docsPath = path.join(dirname, 'docs');
  const dir = outdir ? outdir : dirname;
  const manifestDir = `${
    path.join(
      process.cwd(),
      path.join(outdir ? outdir : docsPath, 'manifest.json')
    )
  }`;
  const relativeManifestDir = path.relative(__dirname, manifestDir);
  const manifest = require(relativeManifestDir);
  const files = manifest.files;

  if (!outdir) {
    const docsPath = path.join(dirname, 'docs');
    writeFileAndManifest(docsPath, filename, content, files);
  } else {
    writeFileAndManifest(outdir, filename, content, files);
  }
};


/**
 * Given file content string, convert to markdown format if the
 * the filename suggests this file is a code block
 * @param  {String} filename       Name of file
 * @param  {String} updatedContent File content as string
 * @return {String}                Updated file content, possibly in
 *                                 markdown format
 */
const convertCodeToMarkdown = (filename, updatedContent)=> {
  if (filename.includes('.js.html')) {
    const file = filename.replace('.html', '');

    const codeStart = updatedContent.split('<code>')[1];
    const code = codeStart.split('</code>')[0];
    const navStart = updatedContent.split('<nav>')[1];
    const nav = navStart.split('</nav>')[0];

    const md = `\n ## ${file} \n \n \`\`\`javascript \n${code} \`\`\` \n`;

    return md;
  }

  return updatedContent;
};


/**
 * Function called when file data is read by fs
 *
 * @callback
 * @param  {String} filename Name of file
 * @param  {String} content  File content as string
 * @param  {String} dirname  Path of source file directory
 * @return {Void}
 */
const onFileContent = (filename, content, dirname, outdir)=> {
  const ext = filename.split('.').pop();

  if (ext === 'html') {
    const updatedContent = updateHrefs(content);
    const markedContent = convertCodeToMarkdown(filename, updatedContent);
    writeContentToDocs(filename, markedContent, dirname, outdir);
  }
};


/**
 * Function called when file data is unsuccessfully read
 *
 * @callback
 * @param  {Error} err Error object or string
 * @return {Void}
 */
const onError = (err)=> {
  console.log(err);
}


/**
 * Given a directory name, read the files in that directory,
 * process its content and write the updated content to the supplied out
 * directory
 *
 * @param  {String} dirname       Path of source file directory
 * @param  {Function} onFileContent Callback function to process content
 * @param  {Function} onError       Callback function to handle error
 * @param  {String} outdir       Path of output directory
 * @return {Void}
 */
const readFiles = (dirname, onFileContent, onError, outdir)=> {
  fs.readdir(dirname, (err, filenames)=> {
    if (err) {
      onError(err);
      return;
    }
    filenames.forEach((filename)=> {
      const file = path.join(dirname, filename);
      if (fs.lstatSync(file).isFile()) {
        fs.readFile(path.join(dirname, filename), 'utf-8', (err, content)=> {
          if (err) {
            onError(err);
            return;
          }
          onFileContent(filename, content, dirname, outdir);
        });
      }
    });
  });
};


/**
 * Remove any doc files from the supplied output directory or the
 * docs directory which are not in the standardFiles set or are on
 * the manifest.json, then clear the manifest.json.
 *
 * @param  {String} dirname Path to source file directory
 * @param  {String} outdir  Path to output directory
 * @param  {Function} onError Callback function to handle errors
 * @return {Void}
 */
const cleanDocs = (dirname, outdir, onError, files)=> {
  const docsPath = path.join(dirname, 'docs');
  const dir = outdir ? outdir : dirname;

  fs.readdir(dir, (err, filenames)=> {
    if (err) {
      onError(err);
      return;
    }
    filenames.forEach((filename)=> {
      if (files.has(filename)) {
        const file = path.join(outdir ? outdir : docsPath, filename);

        if (fs.lstatSync(file).isFile() && !standardFiles.has(filename)) {
          fs.unlink(file);
        }
      }
    });
  });
};


/**
 * Entry point
 * @return {Void}
 */
function main() {
  const args = parser.parseArgs(process.argv.slice(2));
  const {dirname, outdir} = args;

  const docsPath = path.join(dirname, 'docs');
  const dir = outdir ? outdir : dirname;

  const manifestDir = `${
    path.join(
      process.cwd(),
      path.join(outdir ? outdir : docsPath, 'manifest.json')
    )
  }`;
  const relativeManifestDir = path.relative(__dirname, manifestDir);
  const manifest = require(relativeManifestDir);
  const files = new Set([...manifest.files]);

  cleanDocs(dirname, outdir, onError, files);

  if (dirname) {
    readFiles(dirname, onFileContent, onError, outdir, files);
  } else {
    readFiles('.', onFileContent, onError, outdir, files);
  }

  return;
};


main();
