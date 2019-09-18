#!/usr/bin/env node
import yargs from 'yargs';
import { GitProcess, GitError, IGitResult } from 'dugite';
import generateBranchName from 'project-name-generator';

const pathToRepository = '.'

const argv = yargs.usage(
  `Move a commit or series of commits to a new branch

    $ git-yank [commits] <options>`
)
  .example('git-yank <sha1> <sha2> <sha3>', 'Moves the three specified commits to a new destination branch.')
  .example('git-yank <sha> -b hotfix', 'Moves the specified commit to the destination branch "hotfix", creating it if it doesn\'t exist.')
  .example('git-yank <sha> --branch feature/patch --start-point feature', 'Moves the specified commit to the destination branch "feature/patch", creating it if it doesn\'t exist using the "feature" branch as the branch start point.')
  .options({
    ['branch']: {
      alias: 'b',
      description: 'The name of the destination branch to create or use when moving commits. If not specified, a unique branch name will be generated.',
      type: 'string'
    },
    ['start-point']: {
      alias: 's',
      description: 'The name of a commit or branch at which to start the new branch.',
      default: 'master',
      type: 'string'
    },
    ['push']: {
      alias: 'p',
      description: 'Whether the destination branch should be automatically pushed.',
      default: false,
      type: 'boolean'
    },
    ['safe']: {
      alias: 'S',
      description: 'Whether commits should be preserved on the source branch.',
      default: false,
      type: 'boolean'
    },
    ['debug']: {
      description: 'Show debug output',
      default: false,
      type: 'boolean'
    }
  })
  // Current Version option
  .alias('v', 'version')
  // Help option
  .help('h')
  .alias('h', 'help')
  .showHelpOnFail(false, 'Specify --help for available options')
  .epilogue('For more information, see the documentation:\nhttps://github.com/trentrand/git-yank\n')
  .epilogue('Created by Trent Rand <contact@trentrand.com>')
  .argv;

let args = {
  commits: argv['_'],
  destinationBranchName: argv['branch'],
  startPoint: argv['start-point'],
  push: argv['push'],
  safe: argv['safe'],
  debug: argv['debug'],
};

(async () => {
  const sourceBranchName = await getCurrentGitBranchName();

  if (args.debug) {
    console.log(`Source Branch Name: ${sourceBranchName}`);
    console.log(`Options: ${JSON.stringify(args, null, 2)}`);
  }

  if (args.destinationBranchName === undefined) {
    args.destinationBranchName = generateBranchName({ words: 2, alliterative: true }).dashed;
  }

  // Create new branch or checkout existing
  await createBranchIfDoesNotExist(args.destinationBranchName, args.startPoint);

  // Switch to the specified destination branch
  await checkoutBranch(args.destinationBranchName);

  // Cherry pick the specified commits
  await cherryPickCommits(args.commits);

  // Conditionally push the destination branch
  if (args.push) {
    await pushCurrentBranch();
  }

  // Checkout previous branch
  await checkoutBranch(sourceBranchName);

  // Conditionally remove the specified commits from the source branch
  if (!args.safe) {
    for (let commitIdentifier of args.commits) {
      await removeCommitFromBranch(commitIdentifier, sourceBranchName);
    }
  }

  console.log(`Successfully yanked the specified commits to a branch named ${args.destinationBranchName}.`);
})();

async function createBranchIfDoesNotExist(branchName, startPoint) {
  const command = `branch ${branchName} ${startPoint}`.split(' ');
  const { stdout, stderr, exitCode } = await GitProcess.exec(command, pathToRepository);

  if (exitCode !== 0) {
    const parsedError = GitProcess.parseError(stderr);
    if (parsedError) {
      if (parsedError === GitError.BranchAlreadyExists) {
        console.info(`Moving commits to a branch named '${branchName}'.`);
      } else {
        Logger.error(stderr, exitCode);
      }
    } else {
      console.info(`Created a branch named '${branchName}'. Commits will be moved to that branch.`);
    }
  }
}

async function checkoutBranch(branchName) {
  const command = `checkout ${branchName}`.split(' ');
  const { stdout, stderr, exitCode } = await GitProcess.exec(command, pathToRepository);

  if (exitCode !== 0) {
    Logger.error(stderr, exitCode);
  }
}

async function cherryPickCommits(commits) {
  const commitsList = commits.join(' ');
  const { stdout, stderr, exitCode } = await GitProcess.exec(['cherry-pick', commitsList], pathToRepository);

  if (exitCode !== 0) {
    Logger.error(stderr, exitCode);
  }
}

async function pushCurrentBranch() {
  const { stdout, stderr, exitCode } = await GitProcess.exec(['push'], pathToRepository);

  if (exitCode !== 0) {
    Logger.error(stderr, exitCode);
  }
}

async function getCurrentGitBranchName() {
  const command = `rev-parse --abbrev-ref HEAD`.split(' ');
  const { stdout: branchName, stderr, exitCode } = await GitProcess.exec(command, pathToRepository);

  if (exitCode !== 0) {
    Logger.error(stderr, exitCode);
  }

  return branchName.trim();
}

async function removeCommitFromBranch(commitIdentifier, sourceBranchName) {
  const command = `rebase -p --onto ${commitIdentifier}~ ${commitIdentifier} ${sourceBranchName}`.split(' ');
  const { stdout, stderr, exitCode } = await GitProcess.exec(command, pathToRepository);

  if (exitCode !== 0) {
    Logger.error(stderr, exitCode);
  }
}

const Logger = {
  error: (error, exitCode) => {
    console.error(`Error ${exitCode}: '${error}'`);
  }
}