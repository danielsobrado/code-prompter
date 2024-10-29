# README

This tool is a code generation and assistance utility, allows users to define specific tasks, such as implementing new features, fixing bugs, or adding enhancements. Users can set the Task Type to organize work and specify whether the tool should adhere to custom instructions or default guidelines. It is basically a repository of prompts.

Users can drag and drop or select specific files from a project directory to share the code in the context to the prompt. This saves time copying and pasting the code that the LLM needs to be aware of.

The Task Instruction and Final Prompt sections allow users to add detailed requirements or custom instructions. The tool then aggregates these into a refined prompt for code generation, assisting the user in creating code tailored to their project’s structure and requirements.

Users can generate prompts using ChatGPT or Claude (XML style).

## About

This template comes with Vite, React, TypeScript, TailwindCSS and shadcn/ui.

Built with `Wails v2.5.1` and [shadcn's CLI](https://ui.shadcn.com/docs/cli)

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
