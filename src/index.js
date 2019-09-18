#!/usr/bin/env node
import yargs from 'yargs';

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
  .epilogue('for more information, find the documentation at https://github.com/trentrand/git-yank')
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
  if (args.debug) {
    console.log(`Source Branch Name: ${sourceBranchName}`);
    console.log(`Options: ${JSON.stringify(args, null, 2)}`);
  }
})();
