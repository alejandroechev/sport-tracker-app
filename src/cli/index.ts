import { Command } from 'commander';
import { SportDataService } from '../domain/services/sport-data.service';
import { InMemoryStubAdapter } from '../infra/in-memory/stub.adapter';
import { EspnCompositeAdapter } from '../infra/espn/composite.adapter';
import {
  TRACKED_COMPETITIONS,
  SPORT_CATEGORIES,
} from '../domain/config/competitions';
import type { FootballStandingEntry, F1DriverStanding, TennisRanking } from '../domain/models';

function createService(): SportDataService {
  // Use stub data only when explicitly requested
  const useStub = process.env['VITE_USE_STUB'] === 'true';
  if (useStub) {
    return new SportDataService(new InMemoryStubAdapter());
  }
  // ESPN API requires no key — use it by default
  return new SportDataService(new EspnCompositeAdapter());
}

const program = new Command();
program
  .name('sport-tracker')
  .description('Sport Tracker CLI — validate data fetching')
  .version('1.0.0');

// ── list-competitions ────────────────────────────────────────────────
program
  .command('list-competitions')
  .description('List all tracked competitions')
  .action(() => {
    console.log('\n📋 Tracked Competitions\n');

    for (const category of SPORT_CATEGORIES) {
      console.log(`${category.icon}  ${category.label}`);
      console.log('─'.repeat(50));

      for (const comp of category.competitions) {
        const slug = comp.espnSlug;
        console.log(`  ${comp.id.padEnd(22)} ${comp.name.padEnd(22)} ESPN:${slug}`);
      }
      console.log();
    }

    console.log(`Total: ${TRACKED_COMPETITIONS.length} competitions`);
  });

// ── fetch-standings ──────────────────────────────────────────────────
program
  .command('fetch-standings')
  .argument('<competition-id>', 'Competition ID (e.g., premier-league)')
  .description('Fetch standings for a competition')
  .action(async (competitionId: string) => {
    const service = createService();
    const comp = service.getCompetition(competitionId);

    if (!comp) {
      console.error(`❌ Unknown competition: ${competitionId}`);
      process.exitCode = 1;
      return;
    }

    const table = await service.getStandings(competitionId);
    console.log(`\n🏆 ${comp.name} — Standings (Season ${table.season})\n`);

    if (table.sport === 'football') {
      console.log(
        '#'.padStart(3) +
        '  ' +
        'Team'.padEnd(22) +
        'Pts'.padStart(4) +
        'P'.padStart(4) +
        'W'.padStart(4) +
        'D'.padStart(4) +
        'L'.padStart(4) +
        'GD'.padStart(5),
      );
      console.log('─'.repeat(52));
      for (const e of table.entries as FootballStandingEntry[]) {
        console.log(
          String(e.rank).padStart(3) +
          '  ' +
          e.team.name.padEnd(22) +
          String(e.points).padStart(4) +
          String(e.played).padStart(4) +
          String(e.won).padStart(4) +
          String(e.drawn).padStart(4) +
          String(e.lost).padStart(4) +
          String(e.goalDifference).padStart(5),
        );
      }
    } else if (table.sport === 'formula1') {
      console.log(
        '#'.padStart(3) +
        '  ' +
        'Driver'.padEnd(20) +
        'Team'.padEnd(18) +
        'Pts'.padStart(5) +
        'Wins'.padStart(5),
      );
      console.log('─'.repeat(55));
      for (const e of table.entries as F1DriverStanding[]) {
        console.log(
          String(e.rank).padStart(3) +
          '  ' +
          e.driver.name.padEnd(20) +
          e.team.name.padEnd(18) +
          String(e.points).padStart(5) +
          String(e.wins).padStart(5),
        );
      }
    } else if (table.sport === 'tennis') {
      console.log(
        '#'.padStart(3) +
        '  ' +
        'Player'.padEnd(22) +
        'Points'.padStart(8),
      );
      console.log('─'.repeat(37));
      for (const e of table.entries as TennisRanking[]) {
        console.log(
          String(e.rank).padStart(3) +
          '  ' +
          e.player.name.padEnd(22) +
          String(e.points).padStart(8),
        );
      }
    }

    console.log(`\nLast updated: ${table.lastUpdated}`);
  });

// ── check-live ───────────────────────────────────────────────────────
program
  .command('check-live')
  .description('Check for currently live events')
  .action(async () => {
    const service = createService();
    const events = await service.getAllLiveEvents();

    if (events.length === 0) {
      console.log('\n😴 No live events right now.\n');
      return;
    }

    console.log(`\n🔴 ${events.length} Live Event(s)\n`);

    for (const ev of events) {
      const elapsed = ev.elapsed ? ` (${ev.elapsed})` : '';
      const score = ev.score ? `  ${ev.score}` : '';
      console.log(`  [${ev.sport}] ${ev.competitionName}`);
      console.log(`    ${ev.title}${score}${elapsed}`);
      if (ev.subtitle) console.log(`    ${ev.subtitle}`);
      console.log();
    }
  });

// ── fetch-upcoming ───────────────────────────────────────────────────
program
  .command('fetch-upcoming')
  .argument('<competition-id>', 'Competition ID')
  .option('-n, --count <count>', 'Number of matches', '5')
  .description('Fetch upcoming matches for a competition')
  .action(async (competitionId: string, options: { count: string }) => {
    const service = createService();
    const comp = service.getCompetition(competitionId);

    if (!comp) {
      console.error(`❌ Unknown competition: ${competitionId}`);
      process.exitCode = 1;
      return;
    }

    const count = parseInt(options.count, 10);
    const matches = await service.getUpcoming(competitionId, count);

    if (matches.length === 0) {
      console.log(`\nNo upcoming matches for ${comp.name}.\n`);
      return;
    }

    console.log(`\n📅 ${comp.name} — Next ${matches.length} Match(es)\n`);

    for (const m of matches) {
      const round = m.round ? ` (${m.round})` : '';
      console.log(`  ${m.date}${round}`);
      console.log(`    ${m.homeTeam.name} vs ${m.awayTeam.name}`);
      if (m.venue) console.log(`    📍 ${m.venue}`);
      console.log();
    }
  });

program.parse();
