# Proposal: Documentation Improvement

The project needs a better documentation, including the API documentation, structure revision, useful keycloak-js configuration and a FAQ.

---

## Table of Contents

<TBD>: Add the file topics

---

## Proposed By

* Name: Mauricio Gemelli Vigolo
* Created in: 04/09/2018
* Github user: [mauriciovigolo](https://github.com/mauriciovigolo)

### Versions

|    Date    | Version |                        User                         | Details                          |
| :--------: | :-----: | :-------------------------------------------------: | -------------------------------- |
| 04/09/2018 |  1.0.0  | [mauriciovigolo](https://github.com/mauriciovigolo) | Initial version of this document |

## Reason to add

The library needs a better documentation including its API description, library config and the keycloak-js setup as some users are having problems to configure it in their apps (observed in opened issues).

Type: **Necessary**

List of possible types:

* Security threat: must be fixed as it is a security threat.
* Necessary: Should be added/done, it is a must do. Examples: bugfix.
* Good feature: It is a good feature and it would aggregate value to the lib.
* Dispensable: It is a feature that would not aggregate to much to the lib and if not possible, won't affect too much.

## Implementation Details

The library documentation needs a restructuring as follows:

1.  README file will contain just a getting started and macro information about the library.
2.  Creation of a project folder, which will contains info related to enhancements in the proposals folder and important information as the project roadmap.
3.  API documentation.
4.  Creation of missing documentation files.
5.  Generate site using [docsify](https://docsify.js.org).
6.  Add the .github folder and the templates folder as well the github config file. to automatically take some actions.

### README Modification

The README needs to be simple and reformulated. If a user needs complementary information, the full documentation on the project documentation site should be consulted.
The new readme will have the following topics:

* About
* Table of Contents
* Quick Start
  * Setup
* Examples
* Services
* Interceptors
* Contributors
* Roadmap
* License

### Project Folder

A project folder will be created inside the docs. It will shelter the proposals and the roadmap.

The proposals folder will have the following structure:

* request-for-change:
* to-be-evaluated:
* in-progress:
* done:
* to-be-evaluated:

<TBD> // End this documentation and the content explanation for which folder.

### API Documentation

<TBD> // Need to search for a tool to generate API documentation and create markdown files (jsdocs??)

### Creation of Missing Documentation Files

The library needs a better documentation regarding the setup, config of keycloak and keycloak-js file, compability list and frequently asked questions.
The following files will be created:

* getting-started - general infos about the library and how to install, setup the application.
* keycloak-general-info - infos regarding the keycloak, for example: how to create an instance using docker or downloading the library. Links to the official documentation.
* keycloak-compability-list - List of keycloak versions that this is library is compatible with.
* faq - frequently asked questions on github issues.
* full-library-documentation - full documentation about all the services, interceptors and library info.

### Generate Site with Docsify

<TBD> // Needs to study how to customize and generate site using this library

### Github (.github) Config File

<TBD> // List the files and configs this folder should have
