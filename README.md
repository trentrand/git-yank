# Git Yank

## Setup

Clone this repo and run:

```
$ npm i && npm run build
```

Add the repo directory to your `$PATH`. Git will recognize this as a custom command. You can now use `git yank` :tada: 


## Usage

- typical use-case
```
git add -p; // add unrelated changes line-by-line into their own commit
git commit -m "[] Fix an unrelated bug or typo";
git yank <commit-sha> --branch name-of-new-or-existing-branch --push
```


## Options

| Option            | Description | Type        | Default Value |
|-------------------|-------------|-------------|---------------|
| --branch, -b      | The name of the destination branch to create or use when moving <br> commits. If not specified, a unique branch name will be generated. | string  |          |
| --start-point, -s | The name of a commit or branch at which to start the new branch.                                                                        | string  | "master" |
| --push, -p        | Whether the destination branch should be automatically pushed.                                                                          | boolean | false    |
| --safe, -S        | Whether commits should be preserved on the source branch.                                                                               | boolean | false    |
| --debug           | Show debug output                                                                                                                       | boolean | false    |
| -h, --help        | Show help                                                                                                                               | boolean |          |
|  -v, --version    | Show version number                                                                                                                     | boolean |          |


## Examples

1. `git-yank <sha1> <sha2> <sha3>` <br>Moves the three specified commits to a new destination branch.
  
2. `git-yank <sha> -b hotfix` <br>Moves the specified commit to the destination branch "hotfix", creating it if it doesn't exist.

3. `git-yank <sha> --branch feature/patch --start-point feature` <br>Moves the specified commit to the destination branch "feature/patch", creating <br> it if it doesn't exist using the "feature" branch as the branch start point.


