# Contributing to the Project

If you want to contribute to project here are the guidelines:

- [Bugs and feature requests](#bfr)
- [Environment setup](#ese)
- [Submission guidelines](#sug)
- [Coding rules](#cru)
- [Commit message guidelines](#cmg)
- [Final message](#fmg)

## <a name="bfr"></a> Bugs and feature requests

### For bugs

If you find a bug you can help the project by submitting an issue to the [GitHub Repository](https://www.github.com/mauriciovigolo/keycloak-angular). You may also submit a Pull Request with the bug fix, but before, please check the project's coding rules and commit templates.

### Feature requests

Missing an important feature? Please open an issue for discussion. If you want to implement this new feature, before submiting a Pull Request, please open the issue.

## <a name="ese"></a> Environment setup

- First of all, fork this repository at GitHub.

- Clone the forked repository
```sh
git clone https://github.com/YOUR-USERNAME/keycloak-angular.git
```

- Install the dependencies
```sh
npm install
```

- Now, lets code! :smile:

## <a name="sug"></a> Submission guidelines

### For issues

Before submiting an issue, please search if there is an open issue for the same bug. A minimal reproduce scenario is necessary to help to understand the problem.

For opening an issue, you can fill out this [issue form](https://github.com/mauriciovigolo/keycloak-angular/issues/new).

### Submitting a Pull Request (PR)

Before submiting a Pull Request, please:
- Search for open and closed related PRs.
- Follow the coding rules.
- Follow the commit message guidelines.
- Checkout the code documentation - jsdocs.

## <a name="cru"></a> Coding rules

This project uses the [Airbnb coding style](https://github.com/airbnb/javascript) with little 
exceptions. The project tslint.json file extends tslint-config-airbnb. Check if you have the tslint 
extension in your editor.

Details:
- The code must also be documented following the [jsdoc guidelines](http://usejsdoc.org/).
- Wrap all code at 100 characters.

## <a name="cmg"></a> Commit message guidelines

This project follows the [Angular commit message guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit). 

From the Angular documentation:

### Commit message format

Each commit message consists of a header, a body and a footer. The header has a special format that includes a type, a scope and a subject:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The header is mandatory and the **scope** of the header is optional.

Any line of the commit message **cannot be longer 100 characters!**. This allows the message to be easier to read on GitHub as well as in various git tools.

Footer should contain a closing reference to an issue if any.

### Revert

If the commit reverts a previous commit, it should begin with revert:, followed by the header of the reverted commit. In the body it should say: This reverts commit <hash>., where the hash is the SHA of the commit being reverted.

### Type

Must be one of the following:

* **build:** Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
* **ci:** Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
* **docs:** Documentation only changes
* **feat:** A new feature
* **fix:** A bug fix
* **perf:** A code change that improves performance
* **refactor:** A code change that neither fixes a bug nor adds a feature
* **style:** Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
* **test:** Adding missing tests or correcting existing tests

### Subject

The subject contains succinct description of the change:

use the imperative, present tense: "change" not "changed" nor "changes"
don't capitalize first letter
no dot (.) at the end
Body

Just as in the subject, use the imperative, present tense: "change" not "changed" nor "changes". The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about Breaking Changes and is also the place to reference GitHub issues that this commit Closes.

Breaking Changes should start with the word BREAKING CHANGE: with a space or two newlines. The rest of the commit message is then used for this.

## <a name="fmg"></a> Final message

Thanks for your interest in this project. Hope to see your contribution! 

See you and happy coding! 