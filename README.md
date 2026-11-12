# JavaScript Project Template
 
A starter template for plain JavaScript projects (HTML + JS in the browser) with formatting and linting preconfigured:
 
- **EditorConfig**: consistent indentation, line endings and encoding across editors
- **Prettier**: automatic code formatting
- **ESLint**: finds errors and enforces coding conventions
## Requirements
 
- [Node.js](https://nodejs.org/) (LTS version). Check with `node -v`. Node is installed once on your computer, not per project.
- [Git](https://git-scm.com/)
- Visual Studio Code with these extensions:
  - Prettier - Code formatter
  - ESLint
  - EditorConfig for VS Code
## Getting started
 
1. Click **Use this template** > **Create a new repository** on GitHub.
2. Clone your new repository:
```bash
   git clone https://github.com/<username>/<repository>.git
   cd <repository>
```
 
3. Install dependencies (creates the `node_modules` folder, which is not stored in Git):
```bash
   npm install
```
 or 
 ```bash
   npm.cmd install
```
4. Open the folder in VS Code and start coding.
Run `npm install` once after every fresh clone. You do not need to run it every time you open the project.
 
## VS Code settings
 
Open settings with `Ctrl + ,` and check:
 
- **Editor: Default Formatter** is set to **Prettier**
- **Editor: Format On Save** is enabled
## Project structure
 
```
.
├── .editorconfig        # Editor style rules
├── .prettierrc.json     # Prettier configuration
├── eslint.config.js     # ESLint configuration
├── .gitignore
├── package.json         # Project info and dependencies
├── example.html         # Sample HTML page
└── main.js              # Sample JavaScript file
```
 
## Usage
 
Open `example.html` in a browser (or use the VS Code Live Server extension). JavaScript is loaded as a module:
 
```html
<script type="module" src="main.js" defer></script>
```
 
Output from `console.log()` appears in the browser developer tools console (`F12`).
 
For course assignments, put each assignment in its own folder with its own HTML and JS files, and include the assignment number in the file and folder names, for example `assignment1/assignment1.html` and `assignment1/assignment1.js`.
 
## Linting
 
Run ESLint manually on all files:
 
```bash
npx eslint .
```
 
Automatically fix what can be fixed:
 
```bash
npx eslint . --fix
```
 
## Notes
 
- `node_modules`, `.vscode`, `.idea` and `.DS_Store` are ignored by Git (see `.gitignore`).
- If ESLint warnings do not show up in the editor, make sure `npm install` has been run in the project folder.
 
