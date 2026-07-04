#!/usr/bin/env node
import { Command } from 'commander';
import { render } from 'ink';
import { App } from './cli/App.js';
import { createCli } from './cli/createCli.js';

const cli = createCli();

const program = new Command();

program
  .name(cli.name)
  .description(cli.description)
  .command(cli.command)
  .description(cli.description)
  .action((topic: string) => {
    render(<App topic={topic} />);
  });

program.parse(process.argv);
