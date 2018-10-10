import {
  getProjectNodes,
  readAngularJson,
  readNxJson
} from '@nrwl/schematics/src/command-line/shared';
import { dependencies, Deps, ProjectNode } from '@nrwl/schematics/src/command-line/affected-apps';
import { existsSync, readFileSync, writeFileSync } from 'fs';
const appRoot = require('app-root-path');
const yargs = require('yargs');
import { execSync } from 'child_process';

const SPARSE_CHECKOUT_PATH = '.git/info/sparse-checkout';

export function getDependencies(angularJson: any, nxJson: { npmScope: string }): Deps {
  const npmScope = nxJson.npmScope;
  const projects: ProjectNode[] = getProjectNodes(angularJson, nxJson);

  // fetch all apps and libs
  return dependencies(npmScope, projects, (f: string) =>
    readFileSync(`${appRoot.path}/${f}`, 'utf-8')
  );
}

const writeContent = (path: string, content: string) => {
  writeFileSync(path, content);
};

const createFileIfNotExists = () => {
  if (!existsSync(SPARSE_CHECKOUT_PATH)) {
    writeContent(SPARSE_CHECKOUT_PATH, '');
  }
};

const checkout = () => {
  execSync('git checkout');
};

const checkoutEverything = () => {
  writeContent(SPARSE_CHECKOUT_PATH, '/*');
  checkout();
};
export const extractAppNames = (args: string[]) => args.slice(1, args.length);

const convertToBoolean = (val: string) => val === 'true';

const verifySparseCheckoutEnabled = () =>
  convertToBoolean(
    execSync('git config core.sparseCheckout')
      .toString('utf-8')
      .trim()
  );

const reduceAllProjectsToCheckout = (deps: Deps, appNames: string[]) =>
  appNames.reduce<string[]>((acc, appName) => {
    acc.push(appName);
    acc.push(appName + '-e2e');
    acc.push(...deps[appName].map(dep => dep.projectName));
    return acc;
  }, []);

const reduceProjectsNotToCheckout = (
  projects: { [name: string]: { projectType: string } },
  allProjectsToCheckout: string[]
) =>
  Object.entries(projects)
    .map(([name, project]) => ({ name, type: project.projectType }))
    .filter(
      (project: { name: string; type: string }) => !allProjectsToCheckout.includes(project.name)
    );

const calculateSparseCheckoutFileContent = (
  projects: { [name: string]: { projectType: string } },
  allProjectsToCheckout: string[]
) =>
  reduceProjectsNotToCheckout(projects, allProjectsToCheckout).reduce(
    (content, project) =>
      content +
      (project.type === 'application' ? `!/apps/${project.name}\n` : `!/libs/${project.name}\n`),
    `/*\n`
  );

const checkoutApp = (appNames: string[]) => {
  if (!verifySparseCheckoutEnabled()) {
    console.log("Enable sparce checkouts first by running 'git config core.sparseCheckout true'");
    process.exit(1);
  }

  createFileIfNotExists();
  checkoutEverything();

  if (!appNames.length) {
    return;
  }

  const angularJson = readAngularJson();
  const nxJson = readNxJson();

  const allProjectsToCheckout = reduceAllProjectsToCheckout(
    getDependencies(angularJson, nxJson),
    appNames
  );

  writeContent(
    SPARSE_CHECKOUT_PATH,
    calculateSparseCheckoutFileContent(angularJson.projects, allProjectsToCheckout)
  );

  checkout();
};

/*tslint:disable:no-unused-variable*/
const cli = yargs
  .usage('Utility of nx helper scripts')
  .command(
    'checkout',
    "Checks out all the apps passed to it and all of the dependant libs. Pass the names of the apps to checkout as follows 'nx-etc checkout ${appName} ${appName2'. To checkout everything, call it without app names.",
    (yargsOptions: any) => yargsOptions,
    (args: any) => checkoutApp(extractAppNames(args._))
  )
  .help('help').argv;
