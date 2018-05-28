# Quick start

It is recommended to use the npm command `npx` to install _skan-docs_.  In your local repo directory, or in the same directory as your package.json, run:

> Note: this will require npm > v6

```bash
npx skan-docs
```

Or install it globally:

```bash
npm i -g skan-docs
skan-docs -v
```

## Command line arguments

> **-p , --package**    _Path to package.json_

> **-s , --serve**      _Serve docs after setup_

> **-v**                _Version_

> **-h**                _Help_

```bash
skan-docs --package 'path/to/package.json' --serve
```

## Package scripts

By default _skan-docs_ will add the following scripts to your `package.json`:

> "docs:proj": "docsify serve docs"


You can easily change this to any script name you like!


## Preview your site

To run the local server with `npm`:

```bash
npm run docs:proj
```

Or you can use the `serve` package which _skan-docs_ installed globally:

```bash
serve ./docs
```

You can preview your site in your browser on `http://localhost:3000`.

You can easily update the documentation in `./docs/README.md` and, of course, you can add [more pages](more-pages.md)!

?> For more use cases of `docsify-cli` used under the hood, see [docsify-cli documentation](https://github.com/QingWei-Li/docsify-cli).


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


1. You will likely want to change the img 'src' at the top of the `_coverpage.md` file to your own logo.
2. Change all the links and href in all documents to suit your needs.
3. Write some new docs and add them to your `_sidebar.md` file.

> Note: `.nojekyll` is required by **github pages**, remove it if you do not plan on hosting your docs on gh-pages.


## Initialize without template

If you want to start with bare docsify boilerplate files in your `./docs` subdirectory, you can use the `docsify init` command _skan-docs_ installed for you.

```bash
docsify init ./docs
```
