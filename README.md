# Nx-etc

This repo will hold some utilities that can be used in addition to Nx. 

## Partial checkouts

### Problem description

When working with a monorepo style of development, all apps are in a single repository. In Nx land, there are two important building blocks, apps and libs. Apps are deployable artifacts that are build up out of a number of different libs. A lib can be a feature module, some reusable code, component library, ... 

When developing with such a repo, it can get hard to get an overview over all these different files. Let's say that I'm working on app1, I don't want to open up all the other apps in the monorepo in my IDE. But, due to the flat structure of apps in a single directory, it is impossible to avoid this. 

Reasons I want to avoid this is:
- Performance. My IDE will eventually not be able to handle this anymore, if the monorepo grows too big.
- File lookup. If I want to open a file, I might use the lookup system in IDE's to do so. When I look for 'app.component.ts' while working on 'app1', it would be cool to only have a single result instead of one for every app in the repo.
- Clarity. It easily becomes hard to see what libs are used by an app.

### Solution

#### Sparse checkouts

Git supports a feature called [sparse checkouts](https://git-scm.com/docs/git-read-tree#_sparse_checkout). In this scenario, you can create a file called 'sparse-checkout' where, using some globs, you can instruct git which folders to checkout and which ones to **'hide'**. This means the folders are not visible on the file system!


#### Dependency graph scripts from Nx

Nx exposes some script that can help us build, test, lint, ... only affected apps or generate a dependency graph of the entire monorepo. Using these scripts, you can find out all the dependencies of a certain app.

#### Combination of these features

Combining both features, the nx-etc 'checkout' functionality will checkout out only the files linked to a certain app.

### How to use

#### Install nx-etc

```yarn add --dev nx-etc```

or
 
```npm install --save-dev nx-etc```

**Note:** We avoid having this installed globally, as we do with (almost) any package.

#### Enable sparse checkouts

First of all, you need to enable sparse checkouts. Do this using

```git config core.sparseCheckout true```

#### Using the lib

To checkout one project use:

```npx nx-etc checkout ${appName}```

**Note:** When checking out an app, with dependant libs, the other libs and apps will be hidden! See below to checkout everything again.

To checkout multiple projects use:

```npx nx-etc checkout ${appName1} ${appName2}```

To checkout everything use:

```npx nx-etc checkout```

#### Video tutorial

<iframe src="https://player.vimeo.com/video/295018577" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
<p><a href="https://vimeo.com/295018577">Using nx-etc checkout feature</a> from <a href="https://vimeo.com/user79085465">Kwinten Pisman</a> on <a href="https://vimeo.com">Vimeo</a>.</p>
