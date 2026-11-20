// Original vector drawings inspired by the supplied profiles and watercolor series.
// Coordinates and framing describe an illustration, independent of growth references.
// All outlines share the same path structure. The curve unwinds over several weeks.
const DRAWINGS = [
  {
    week: 5, scale: .55, angle: 9,
    silhouette: 'M 76 78 C 73 67 77 55 85 46 C 100 31 126 27 145 39 C 166 52 169 74 157 93 C 150 102 146 110 148 118 C 151 130 160 141 162 153 C 167 177 152 191 132 193 C 113 195 97 185 92 174 C 88 165 93 156 101 153 C 99 160 108 165 117 158 C 126 151 125 136 115 123 C 109 115 101 111 94 106 C 86 101 81 95 79 90 C 78 86 77 81 76 78 Z',
  },
  {
    week: 10, scale: .69, angle: 5,
    silhouette: 'M 73 78 C 68 65 72 53 81 43 C 94 25 123 23 144 34 C 170 47 173 73 159 94 C 153 104 151 108 153 115 C 156 127 163 138 165 151 C 172 179 152 197 130 198 C 110 199 94 188 91 176 C 88 166 92 155 101 149 C 99 158 109 162 118 154 C 126 146 123 131 114 120 C 108 113 101 109 93 105 C 85 101 81 95 78 89 C 76 85 74 82 73 78 Z',
  },
  {
    week: 16, scale: .80, angle: 2,
    silhouette: 'M 71 79 C 64 67 70 51 80 40 C 95 22 121 20 144 31 C 168 45 175 71 162 94 C 157 102 157 107 163 114 C 176 130 188 150 182 172 C 176 195 154 206 134 204 C 113 201 101 186 104 169 C 107 154 119 138 130 126 C 121 128 111 124 103 118 C 96 116 90 112 85 106 C 81 101 80 97 79 93 C 77 89 76 86 74 83 C 73 81 72 80 71 79 Z',
    arm: 'M 146 112 C 157 111 162 121 155 133 C 148 146 138 157 124 153 C 113 149 104 139 98 128 C 95 126 90 125 87 121 C 83 115 86 108 91 109 C 99 110 102 114 106 122 C 113 131 118 134 124 134 C 131 125 136 115 146 112 Z',
    leg: 'M 151 184 C 137 185 127 174 115 169 C 111 181 105 192 95 196 C 90 200 80 203 77 199 C 74 196 78 192 83 190 C 91 185 92 170 96 159 C 100 147 111 144 123 149 C 135 153 142 160 152 165',
  },
  {
    week: 20, scale: .87, angle: 0,
    silhouette: 'M 66 77 C 60 67 65 49 76 38 C 93 18 124 18 145 30 C 169 45 172 71 161 91 C 157 99 157 104 164 110 C 186 128 197 151 194 174 C 191 200 166 218 140 214 C 115 210 101 191 104 173 C 107 153 124 135 136 119 C 124 125 116 119 110 112 C 101 116 92 113 87 106 C 82 103 81 98 82 94 C 74 94 70 91 72 86 C 72 83 68 80 66 77 Z',
    arm: 'M 150 107 C 164 106 170 117 163 131 C 155 147 143 159 129 157 C 115 154 108 138 100 124 C 97 121 92 120 87 116 C 80 109 82 101 88 101 C 96 101 101 107 106 116 C 114 127 120 133 127 134 C 136 120 140 110 150 107 Z',
    leg: 'M 167 199 C 149 202 136 185 120 172 C 119 185 115 197 106 205 C 101 211 89 216 86 211 C 83 207 86 203 92 200 C 102 194 98 177 101 164 C 104 151 117 148 129 154 C 143 160 153 169 168 178',
    eye: 'M 83 84 Q 89 89 96 85',
  },
  {
    week: 30, scale: 1, angle: -8,
    silhouette: 'M 63 80 C 56 69 61 51 75 37 C 92 17 125 16 148 30 C 172 46 175 75 165 92 C 161 101 164 107 172 112 C 195 129 205 151 202 177 C 199 205 176 221 149 222 C 121 220 101 202 100 184 C 99 164 115 142 135 119 C 123 124 115 120 108 113 C 99 118 91 114 86 107 C 82 105 81 100 82 96 C 73 96 68 92 71 87 C 71 84 66 82 63 80 Z',
    arm: 'M 153 111 C 170 110 176 122 168 138 C 159 155 145 166 131 160 C 118 155 109 140 102 126 C 98 123 91 123 86 118 C 79 113 80 103 87 103 C 97 102 103 109 109 118 C 116 129 121 135 129 136 C 137 121 143 113 153 111 Z',
    leg: 'M 175 203 C 154 213 137 190 123 174 C 121 185 116 197 109 206 C 101 215 89 218 84 213 C 80 209 83 204 90 200 C 101 193 96 174 100 161 C 104 146 117 143 131 151 C 147 159 155 171 173 180',
    eye: 'M 81 85 Q 89 91 97 87',
  },
  {
    week: 42, scale: 1.02, angle: -155,
    silhouette: 'M 60 81 C 54 70 59 51 72 37 C 90 16 122 14 147 29 C 175 46 179 73 168 93 C 165 101 169 107 178 112 C 203 127 213 151 210 178 C 208 207 184 225 156 226 C 123 227 98 208 95 189 C 91 170 104 146 133 120 C 121 125 110 122 104 114 C 94 119 87 115 82 107 C 78 104 77 101 78 97 C 69 95 65 92 68 87 C 67 84 64 83 60 81 Z',
    arm: 'M 152 110 C 171 108 179 123 171 140 C 161 157 150 165 134 160 C 119 155 113 143 105 129 C 101 125 94 125 89 120 C 83 114 85 104 92 104 C 102 104 108 111 114 119 C 120 128 126 133 132 135 C 138 123 142 114 152 110 Z',
    leg: 'M 176 204 C 154 216 138 195 123 173 C 120 184 115 198 105 208 C 98 217 82 221 78 215 C 75 209 78 205 85 201 C 97 194 90 172 95 157 C 100 140 117 139 132 148 C 151 159 156 169 175 178',
    eye: 'M 78 86 Q 87 93 95 88',
  },
];

function interpolatePath(from, to, ratio) {
  const target = to.match(/-?\d+/g).map(Number);
  let index = 0;
  return from.replace(/-?\d+/g, value => {
    const start = Number(value);
    return (start + (target[index++] - start) * ratio).toFixed(2);
  });
}

export function illustrationForWeek(week) {
  if (!Number.isInteger(week) || week < 1 || week > 42) {
    throw new RangeError('Die Illustration unterstützt die 1. bis 42. SSW.');
  }
  const stage = week <= 4 ? 'beginning' : 'profile';
  return { week, stage };
}

function beginning(week, wash) {
  if (week <= 2) {
    const size = 31 + 7 * week;
    return `<ellipse cx="120" cy="120" rx="${size}" ry="${size - 6}" fill="${wash}" opacity=".7"/>
      <ellipse cx="116" cy="116" rx="${size * .57}" ry="${size * .48}" fill="#f9dcc3" opacity=".57"/>
      <path d="M89 116 Q98 98 117 97" fill="none" stroke="#ffebd6" stroke-width="3" opacity=".65"/>`;
  }
  const cells = [[105,107,15],[130,105,16],[111,132,17],[133,130,14],[120,117,13]];
  return `<ellipse cx="120" cy="119" rx="${week === 3 ? 46 : 52}" ry="44" fill="${wash}" opacity=".42"/>
    ${cells.slice(0, week === 3 ? 4 : 5).map(([cx,cy,r]) =>
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${wash}" stroke="#bf8270" stroke-width="1" stroke-opacity=".42"/>`).join('')}`;
}

function profile(week, wash, shadow) {
  const right = DRAWINGS.findIndex(frame => frame.week >= week);
  const from = DRAWINGS[Math.max(0, right - 1)];
  const to = DRAWINGS[right];
  const ratio = from === to ? 0 : (week - from.week) / (to.week - from.week);
  const path = key => from[key] && to[key]
    ? interpolatePath(from[key], to[key], ratio) : to[key];
  const mix = key => from[key] + (to[key] - from[key]) * ratio;
  // Late pose turns gradually as in the visual references. It does not represent fetal position.
  const turn = Math.max(0, (week - 30) / 12);
  const angle = week <= 30 ? mix('angle') : -8 - 147 * turn * turn * (3 - 2 * turn);
  const limbProgress = Math.min(1, Math.max(0, (week - 10) / 6));
  const limbs = limbProgress ? drawLimbs(path, limbProgress, wash, shadow) : '';
  const eyeOpacity = Math.min(.58, Math.max(0, (week - 19) * .12));
  const eye = eyeOpacity
    ? `<path class="development-eye" d="${path('eye')}" fill="none" stroke="#986453" stroke-width="1.35" opacity="${eyeOpacity.toFixed(2)}"/>`
    : '';
  return `<g transform="translate(120 120) rotate(${angle.toFixed(2)}) scale(${mix('scale').toFixed(3)}) translate(-125 -120)">
    <path class="development-silhouette" d="${path('silhouette')}" fill="${wash}" stroke="#a46d59" stroke-opacity=".62" stroke-width="1.25"/>
    ${limbs}
    ${eye}
  </g>`;
}

function drawLimbs(path, progress, wash, shadow) {
  const scale = .35 + .65 * progress;
  const leg = path('leg');
  const arm = path('arm');
  const stroke = (.36 * progress).toFixed(2);
  const opacity = progress.toFixed(2);
  return `<path d="${leg}" transform="translate(147 168) scale(${scale}) translate(-147 -168)"
    fill="${shadow}" stroke="#a16a58" stroke-width="1.25" stroke-opacity="${stroke}" opacity="${opacity}"/>
    <path d="${arm}" transform="translate(145 117) scale(${scale}) translate(-145 -117)"
    fill="${wash}" stroke="#a46d59" stroke-width="1.2" stroke-opacity="${stroke}" opacity="${opacity}"/>`;
}

export function developmentImage(week, placement = 'journey') {
  const { stage } = illustrationForWeek(week);
  // Placement namespaces the gradients when the overview and weeks are shown together.
  const id = `development-${placement === 'overview' ? 'overview' : 'journey'}-${week}`;
  const wash = `url(#${id}-wash)`, shadow = `url(#${id}-shadow)`;
  const art = stage === 'beginning' ? beginning(week, wash) : profile(week, wash, shadow);
  const label = stage === 'beginning' ? 'Symbolischer Anfang' : week <= 15 ? 'Frühe Entwicklung im Profil' : 'Baby im Profil';
  return `<div class="development-image" data-week="${week}">
    <svg class="development-drift" viewBox="0 0 240 240" role="img" aria-label="${label}, ${week}. SSW. Illustration, nicht maßstabsgetreu." stroke-linecap="round" stroke-linejoin="round">
      <defs>
        <radialGradient id="${id}-wash" cx="35%" cy="25%" r="90%">
          <stop offset="0" stop-color="#f9dcc2"/><stop offset=".53" stop-color="#edb79e"/><stop offset="1" stop-color="#cc8c77"/>
        </radialGradient>
        <linearGradient id="${id}-shadow" x1="0%" y1="0%" x2="77%" y2="100%">
          <stop offset="0" stop-color="#f6c8ac"/><stop offset="1" stop-color="#ce8e78"/>
        </linearGradient>
      </defs>
      ${art}
    </svg>
  </div>`;
}

// Each phase lists its artwork in weekly display order. Image numbers identify the source files.
export const DEVELOPMENT_PHASE_SOURCE = 'https://www.gesundheit.gv.at/leben/eltern/schwangerschaft/info/entwicklung-embryo.html';
export const DEVELOPMENT_PHASE_REVIEWED = '2026-11-20';
const CYCLE_MOTIFS = [
  { file: 'zyklusbeginn', alt: 'Offener rosafarbener Aquarellring mit einem Tropfen', caption: 'Symbolischer Zyklusbeginn' },
  { file: 'zyklusvorbereitung', alt: 'Überlappende Aquarellringe in Apricot und Rosa', caption: 'Symbol für die Vorbereitung auf den Eisprung' },
];
const WEEKLY_MOTIFS = [
  [3, 4, ['01', '02'], 'Stilisiertes rundes Motiv zum Beginn der Entwicklung'],
  [5, 6, ['03', '04'], 'Frühes Aquarellmotiv mit zart angedeuteten Strukturen'],
  [7, 8, ['05', '06'], 'Gekrümmtes frühes Profil mit angedeuteten Gliedmaßen'],
  [9, 10, ['07', '09'], 'Eingerolltes Profil mit kurzen Gliedmaßen'],
  [11, 12, ['10', '11'], 'Kleines Profil mit stärker ausgeprägten Armen und Beinen'],
  [13, 16, ['12', '13', '14', '15'], 'Aquarellprofil mit angewinkelten Armen und Beinen'],
  [17, 20, ['16', '17', '18', '19'], 'Aquarellprofil mit nach vorn geführten Armen'],
  [21, 24, ['20', '21', '22', '23'], 'Aquarellprofil mit angewinkelten Knien'],
  [25, 28, ['24', '25', '26', '27'], 'Seitliches Aquarellprofil mit angezogenen Beinen'],
  [29, 32, ['28', '29', '30', '31'], 'Aquarellprofil mit runderen Körperformen'],
  [33, 36, ['32', '33', '34', '35'], 'Eingerolltes Aquarellprofil in kompakter Haltung'],
  [37, 42, ['37', '38', '39', '40', '41', '42'], 'Eingerolltes Aquarellprofil mit dem Kopf nach unten'],
];

export function weeklyMotif(week) {
  illustrationForWeek(week);
  if (week <= CYCLE_MOTIFS.length) {
    const { file, alt, caption } = CYCLE_MOTIFS[week - 1];
    return { first: week, last: week, src: `./images/stages/${file}.webp`, alt, caption };
  }
  const item = WEEKLY_MOTIFS.find(([first, last]) => week >= first && week <= last);
  const [first, last, images, alt] = item;
  const id = images[week - first];
  return { first, last, src: `./images/stages/stadium-${id}.webp`, alt };
}

export function weeklyDevelopmentImage(week, placement = 'journey') {
  const motif = weeklyMotif(week);
  const overview = placement === 'overview';
  const art = `<div class="development-image development-watercolor" data-week="${week}">
    <img class="development-drift" src="${motif.src}" alt="${motif.alt}" width="640" height="640" decoding="async"${overview ? '' : ' loading="lazy"'}>
  </div>`;
  if (overview) return `${art}<span>${motif.caption ?? 'Illustrative Entwicklung · nicht maßstabsgetreu'}</span>`;
  return `<figure class="development-phase">
    ${art}
    <figcaption>${motif.caption ?? `Bildliche Orientierung · ${motif.first}. bis ${motif.last}. SSW`}</figcaption>
  </figure>`;
}
