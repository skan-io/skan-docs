## Deploying to _GitHub Pages_

#### Option 1 - `/docs` on master branch

Once you have run:

```bash
skan-docs
```

You will have all the files you need to launch a **github.io** page for your repo inside `/docs`.  Add them to your github repository.

> Note: assumes you have run `git init` and set up your local repository

```bash
git add -A
git commit -m 'Added documentation to project'
git push origin master
```

1. Then navigate to your org/repo.
2. Go to **Settings**
3. Scroll down to **GitHub Pages**
4. Choose the `master branch /docs folder` source
5. Click save
6. Navigate to **https://your-org.github.io/your-repo/**
