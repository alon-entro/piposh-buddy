# guillotine-buddy

[![ci](https://github.com/yonatankarp/guillotine-buddy/actions/workflows/ci.yml/badge.svg)](https://github.com/yonatankarp/guillotine-buddy/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Claude Code plugin](https://img.shields.io/badge/Claude_Code-plugin-d97757)](https://code.claude.com/docs/en/discover-plugins)

A Claude Code plugin that puts a character from Guillotine's Piposh, Piposh 2 and Rating above your prompt. After each turn they react to what you asked and what got done, in their own voice from the game, and their mouth moves while they say it.

Each session brings a different character, picked at random from 17:

| Piposh | Piposh 2 | Rating |
| --- | --- | --- |
| חזי פיפוש, צוציק, קרופניק, פוסטמה, ד"ר מרגורי קול-רם, ישורון, הסחלב הפראי, פריץ פון בז, אדון בנטלי, גברת בנטלי | חתולי, פטרישיה, רינתי, מנהלת המלון | אלימלך אגוז, מנהל המלון, צביקי המתכנת |

## Install

```
/plugin marketplace add yonatankarp/guillotine-buddy
/plugin install guillotine-buddy@guillotine-buddy
```

It is active at once. Ignore any "userConfig options not yet set" note: every setting has a default.

## Command

In some places Claude Code shows the command as `/guillotine-buddy:guillotine`.

| Command | What it does |
| --- | --- |
| `/guillotine` | Who is here |
| `/guillotine next` | Someone else |
| `/guillotine <name>` | That character, by Hebrew or English name; part of the name is enough |
| `/guillotine quiet` | Hide the character and stop the lines; again to bring them back. Kept across sessions |

## Settings

Change them with `/plugin configure guillotine-buddy@guillotine-buddy`.

| Setting | Default | What it does |
| --- | --- | --- |
| `language` | `he` | `he`: Hebrew, as in the games. `en`: English in the same voice; catchphrases stay Hebrew, in Latin letters |
| `speechModel` | `haiku` | The model that writes the lines |

## What the character sees

Each turn the speech model gets the first 300 characters of your prompt and of Claude's answer, and what got done: counts of tool calls, commits, pushes and PRs, and check names such as `npm test` with passed or failed. No file contents and no paths. A headless run (`claude -p`, the SDK) makes no call at all, and neither does a quiet character.

## Where it looks right

In the desktop app and editors the face is the game's own art at its own resolution. In a terminal it is drawn in half-block pixels, and in a terminal too small for the face only the line shows. Terminals without right-to-left support show Hebrew lines reversed: set `language` to `en` there.

## How it was made

- **Faces:** `scripts/bake.py` cuts each face and its mouth frames out of the games' own Director casts, using the Director extractor of godot-director-player (a private project), and writes `plugin/hooks/data/faces.generated.ts`. `scripts/faces.json` names, per character, the cast member of the face and its mouths, as whole faces, mouth patches matched onto the face, or parts placed where the game's own score puts them.
- **Voices:** each character's lines were transcribed from their voice clips in that game, and their persona and catchphrases drafted from those lines. The same character is a different buddy in each game, since they speak differently in each.

Rebuilding the faces needs the games and Python with Pillow and numpy:

```
python3 scripts/bake.py --player ~/Projects/godot-director-player
```

## Development

```
claude plugin validate --strict plugin
claude plugin test plugin
```

## Licence

The code is MIT. The characters, face art and lines are Guillotine's and are not covered by it: see [NOTICE](NOTICE). This is an unofficial, non-commercial fan project.
