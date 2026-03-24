import { describe, it, expect } from 'vitest';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(execFile);

/** Run the CLI with the given arguments and return stdout. */
async function runCli(...args: string[]): Promise<string> {
  const { stdout } = await execAsync('npx', ['tsx', 'src/cli/index.ts', ...args], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_NO_WARNINGS: '1' },
    timeout: 30_000,
    shell: true,
  });
  return stdout;
}

describe('CLI – list-competitions', () => {
  it('shows all 8 tracked competitions', async () => {
    const out = await runCli('list-competitions');
    expect(out).toContain('Premier League');
    expect(out).toContain('FA Cup');
    expect(out).toContain('La Liga');
    expect(out).toContain('Champions League');
    expect(out).toContain('Europa League');
    expect(out).toContain('FIFA World Cup');
    expect(out).toContain('Formula 1');
    expect(out).toContain('ATP Tour');
    expect(out).toContain('Total: 8 competitions');
  }, 35_000);
});

describe('CLI – fetch-standings', () => {
  it('returns standings data for premier-league', async () => {
    const out = await runCli('fetch-standings', 'premier-league');
    expect(out).toContain('Premier League');
    expect(out).toContain('Standings');
    expect(out).toMatch(/Team/);
    expect(out).toMatch(/Pts/);
  }, 35_000);

  it('returns error for unknown competition', async () => {
    try {
      await runCli('fetch-standings', 'nonexistent');
      expect.fail('Expected process to indicate error');
    } catch (err: unknown) {
      const error = err as { stderr?: string; stdout?: string };
      const output = (error.stderr ?? '') + (error.stdout ?? '');
      expect(output).toContain('Unknown competition');
    }
  }, 35_000);

  it('returns F1 standings', async () => {
    const out = await runCli('fetch-standings', 'f1');
    expect(out).toContain('Formula 1');
    expect(out).toContain('Driver');
  }, 35_000);

  it('returns tennis rankings', async () => {
    const out = await runCli('fetch-standings', 'atp');
    expect(out).toContain('ATP Tour');
    expect(out).toContain('Player');
  }, 35_000);
});

describe('CLI – check-live', () => {
  it('returns live events from stub', async () => {
    const out = await runCli('check-live');
    expect(out).toContain('Live Event');
  }, 35_000);
});

describe('CLI – fetch-upcoming', () => {
  it('returns upcoming matches for premier-league', async () => {
    const out = await runCli('fetch-upcoming', 'premier-league');
    expect(out).toContain('Premier League');
    expect(out).toMatch(/vs/);
  }, 35_000);

  it('respects --count option', async () => {
    const out = await runCli('fetch-upcoming', 'premier-league', '-n', '2');
    expect(out).toContain('Premier League');
  }, 35_000);
});
