## Use cases

1. Record workouts

   - Pick an exercise. Dispaly sets, reps, last time performed

1. View workouts
1. CRUD exercises

## Macro Workout Strategies

I want to list a few standard routine workouts. Each workout is featured by
a few stapled exercises.

For example, a power workout should feature speed and/or plyometrics;
a lower body strength workout may feature deadlifts.
A upper body pump/strength workout may feature shoulder, chest and back.

Sample routine:

### Monday gameday:

- Isometrics: single leg hold, side bridge, calf hold/raise
- Ploymetrics (feature): box/depth jumps
- Single leg RDL
- Nordic curl
- Box breathing
- Farmer carry
- 10 min light cardio
- Medicine ball throw

### Tuesday recovery:

- rotational, core
- Isometrics (feature): plank, glute/abductor hold
- light cardio
- Massage, foam rolling, stretch
- Cold plunge, sauna
- Upper body pump: chest, biceps, triceps, back
- Box breathing (feature)
- Inversion
- BFR

### Wednesday heavy:

- Deadlift variations: sumo, RDL, trapbar, unilateral etc...
- Bent-over row
- 1 RPM machine bench
- Box breathing

### Thursday plyometrics:

Mostly same as Monday but swap similar excercises.

Can add weighted explosive movements and short range impulses.

### Friday recovery:

Mostly same as Tuesday

### Saturday heavy

Same as Wednesday but may swap deadlifts for squats.
Can swap back with shoulder exercises

### Sunday rest/walk

## Google API references

There are 2 authorization flows. One is implicit flow and the other is authorization code flow which requests for refresh token.

Migrating to new auth using implicit flow: https://developers.google.com/identity/oauth2/web/guides/migration-to-gis#gapi-asyncawait

# Deployment

This app is deployed to github pages which does not support single page apps. Therefore, I have to use
this [hack](https://github.com/rafgraph/spa-github-pages)


# Generate csv

⏺ PEXELS_API_KEY=<your-key> uv run csv-reader/generate.py \
    --book 11339 \
    --story "The Hare And The Tortoise" \
    --languages chinese french \
    --pages 12 \
    --output csv-reader/hare-tortoise.csv

  Without Pexels:
  uv run csv-reader/generate.py \
    --book 11339 \
    --story "The Hare And The Tortoise" \
    --languages chinese french \
    --pages 12 \
    --output csv-reader/hare-tortoise.csv

  Some good Gutenberg IDs:
  - 11339 — Aesop's Fables (use --list-stories to browse)
  - 2591 — Grimm's Fairy Tales
  - 1597 — Hans Christian Andersen's Fairy Tales

