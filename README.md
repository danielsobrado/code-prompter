# README

This tool is a code generation and assistance utility, allows users to define specific tasks, such as implementing new features, fixing bugs, or adding enhancements. Users can set the Task Type to organize work and specify whether the tool should adhere to custom instructions or default guidelines. It is basically a repository of prompts.

Users can drag and drop or select specific files from a project directory to share the code in the context to the prompt. This saves time copying and pasting the code that the LLM needs to be aware of.

The Task Instruction and Final Prompt sections allow users to add detailed requirements or custom instructions. The tool then aggregates these into a refined prompt for code generation, assisting the user in creating code tailored to their project’s structure and requirements.

Users can generate prompts using ChatGPT or Claude (XML style).

Check the [sample prompts](https://github.com/danielsobrado/code-prompter/blob/main/prompts/README.md)

## About

This template comes with Vite, React, TypeScript, TailwindCSS and shadcn/ui.

Built with `Wails v2.5.1` and [shadcn's CLI](https://ui.shadcn.com/docs/cli)

## Version History

### v0.0.2
- **Extension Filtering System**: New dropdown menu to filter files by extension, making it easier to manage large sets of files
  - Dynamically shows all detected extensions with file counts
  - Support for both inclusion and exclusion filtering
  - Visual indicators showing active filters
  - Quick filter toggle directly from the main interface
- **.gitignore Integration**: Automatically respect .gitignore rules when importing files
  - Detects and parses .gitignore files during folder import
  - Filters out ignored directories and files based on standard gitignore patterns
  - Toggle control to enable/disable gitignore filtering
  - Visual indicator when .gitignore patterns are detected and applied

![Code Prompter v 0.0.2](https://github.com/danielsobrado/code-prompter/blob/main/images/CodePrompter2.jpg)

### v0.0.1
- Initial release
- Task Type and Custom Instructions selection
- Drag-and-drop file selection
- ChatGPT and Claude prompt generation

### Using the Template
```console
wails init -n project-name -t https://github.com/Mahcks/wails-vite-react-tailwind-shadcnui-ts
```

```console
cd frontend
```

```console
npm install
```

### Installing Components
To install components, use shadcn's CLI tool to install

More info here: https://ui.shadcn.com/docs/cli#add

Example:
```console
npx shadcn-ui@latest add [component]
```

## Live Development

To run in live development mode, run `wails dev` in the project directory. In another terminal, go into the `frontend`
directory and run `npm run dev`. The frontend dev server will run on http://localhost:34115. Connect to this in your
browser and connect to your application.

![Code Prompter](https://github.com/danielsobrado/code-prompter/blob/main/images/CodePrompter1.jpg)

## Building

To build a redistributable, production mode package, use `wails build`.

The Executable for Windows is on build/bin [Executable](https://github.com/danielsobrado/code-prompter/tree/main/build/bin/CodePrompter.exe)

Or generate it with:

```console
wails build -nsis
```
This can be done for Mac as well see the latest part of [this guide](https://wails.io/docs/guides/windows-installer/)


