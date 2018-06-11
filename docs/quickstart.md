## Installation

It is recommended to use the npm command `npx` to install _skan-docs_.  In your local repo directory, or in the same directory as your package.json, run:

> Note: this will require npm > v6

To use _skan-docs_ locally:
```bash
npm i -D skan-docs
npx skan-docs
```

Or install it globally:

```bash
npm i -g skan-docs
skan-docs -v

// 1.0.0
```

## Command line arguments

> **-p , --package**    _Path to package.json_
>
> **--no-react**       _Don't include react component docs_
>
> **--no-code**        _Don't include code docs_
>
> **-v**                _Version_
>
> **-h**                _Help_

```bash
skan-docs --package 'path/to/package.json' --serve
```

## Package scripts

By default _skan-docs_ will add the following scripts to your `package.json`:

> **"docs":** "run-s -s docs:code docs:proj"
>
> **"docs:code"**: "runs-s docs:clear docs:build docs:clear"
>
> **"docs:proj"**: "docsify serve docs"
>
> **"docs:clear"**: "rm -rf ./out/"
>
> **"docs:build"**: "jsdoc ./src && npx skan-convert -p ./out -o ./docs"
>
> **"lint"**: "run-s -s lint:\*"
>
> **"lint:md"**: "remark -i docs/\*.md --no-stdout --use remark-lint \*.md"
>
> **"lint:docs"**: "remark --no-stdout --use remark-lint docs/\*.md"


You can easily change these to any script names you like!


## Preview your site

To run the local server with `npm`:

```bash
npm run docs
```

Or you can use the `serve` package which _skan-docs_ installed globally:

```bash
serve ./docs
```

You can preview your site in your browser on [`http://localhost:3000`](http://localhost:3000).

You can easily update the documentation in `./docs/README.md` and, of course, you can add [more pages](more-pages.md)!

?> For more use cases of **docsify-cli** used under the hood, see [docsify-cli documentation](https://github.com/QingWei-Li/docsify-cli).


## Writing content

After _skan-docs_ is complete, you can see the template file list in the `./docs` subdirectory.

* `index.html` as the entry file
* `README.md` as the home page
* `quickstart.md` as the quickstart guide
* `configuration.md` as a template config page
* `_navbar.md` as the format for your navbar dropdowns
* `_sidebar.md` as the format for your sidebar list items
* `_coverpage.md` as the landing page for your docs
* `.nojekyll` prevents GitHub Pages from ignoring files that begin with an underscore

> Note: `.nojekyll` is required by **github pages**, remove it if you do not plan on hosting your docs on gh-pages.

1. You will likely want to change the img 'src' at the top of the `_coverpage.md` file to your own logo.
2. Update your coverpage details on `_coverpage.md`.
3. Add links to your navbar via the `_navbar.md` file.
4. Change the **name** variable passed to the _docsify script_ within `index.html` to your app name.
5. Write some new docs and link them to your docs via the `_sidebar.md` file.

In your root (`./`) directory, _skan-docs_ will provide a `.remarkrc` config file to lint markdown using the **lint:md** command. See below for more details.


## Lint your content

Run:

```bash
npm run lint
```

This will check all `*.md` files in your directory for errors and report the results to the command line.

> Note: the **lint** command will use the `.remarkrc` template file provided for configuration.  Remove or update this file to suit your needs.


## Initialize without template

If you want to start with bare docsify boilerplate files in your `./docs` subdirectory, you can use the `docsify init` command _skan-docs_ installed for you.

```bash
docsify init ./docs
```
