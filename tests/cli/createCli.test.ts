import { describe, expect, it } from 'vitest';
import { isValidElement } from 'react';
import { createCli } from '../../src/cli/createCli.js';

describe('createCli', () => {
  it('exposes the write command and a bootable app renderer', () => {
    const cli = createCli();

    expect(cli.name).toBe('content-writer');
    expect(cli.command).toBe('write <topic>');
    expect(cli.description).toContain('long-form');
    expect(isValidElement(cli.render('A topic'))).toBe(true);
  });
});
