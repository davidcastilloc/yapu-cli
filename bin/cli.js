#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { t, getLanguage } from '../lib/i18n.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);

// Strip --lang / -l flags from args so they don't interfere with subcommands
const cleanArgs = [];
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--lang' || args[i] === '-l') {
        i++; // skip next arg (the language value)
    } else {
        cleanArgs.push(args[i]);
    }
}

const command = cleanArgs[0];
const activeLang = getLanguage(args);

const targetDir = process.cwd();
let templatesDir = path.join(__dirname, '..', 'templates', activeLang);
if (!fs.existsSync(templatesDir)) {
    templatesDir = path.join(__dirname, '..', 'templates', 'es');
}
const skillsDir = path.join(targetDir, '.agents', 'skills');

// Command mapping
const commands = {
    'init': './commands/init.js',
    'archive': './commands/archive.js',
    'status': './commands/status.js',
    'install-hooks': './commands/install-hooks.js',
    'health': './commands/health.js',
    'check': './commands/check.js',
    'sync': './commands/sync.js',
    'handoff': './commands/handoff.js',
    'brain': './commands/brain.js',
    'dash': './commands/dash.js',
    'board': './commands/board.js',
    'gc': './commands/gc.js',
    'rescue': './commands/rescue.js',
    'swarm': './commands/swarm.js',
    'snapshot': './commands/snapshot.js',
    'rewind': './commands/rewind.js',
    'profile': './commands/profile.js',
    'daemon': './commands/daemon.js',
    'watch': './commands/daemon.js', // watch is alias of daemon
    'branch': './commands/branch.js',
    'merge': './commands/merge.js',
    'provider': './commands/provider.js'
};

if (commands[command]) {
    try {
        const modulePath = path.join(__dirname, '..', 'lib', commands[command]);
        const { run } = await import(`file://${modulePath}`);
        await run({
            targetDir,
            activeLang,
            templatesDir,
            skillsDir,
            cleanArgs
        });
    } catch (err) {
        console.error(`Error executing command "${command}":`, err);
        process.exit(1);
    }
} else {
    console.log(t('help_title'));
    console.log(t('help_usage'));
    console.log(t('help_init'));
    console.log(t('help_status'));
    console.log(t('help_dash'));
    console.log(t('help_gc'));
    console.log(t('help_rescue'));
    console.log(t('help_swarm'));
    console.log(t('help_snapshot'));
    console.log(t('help_rewind'));
    console.log(t('help_profile'));
    console.log(t('help_daemon'));
    console.log(t('help_branch'));
    console.log(t('help_merge'));
    console.log(t('help_health'));
    console.log(t('help_check'));
    console.log(t('help_archive'));
    console.log(t('help_install_hooks'));
    console.log(t('help_sync'));
    console.log(t('help_handoff'));
    console.log(t('help_brain'));
    console.log(t('help_provider'));
    console.log(t('help_board'));
}
