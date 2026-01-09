/**
 * Parse SRT subtitle file content
 * @param {string} content - Raw SRT file content
 * @returns {Array} Array of subtitle objects with start, end, and text
 */
export function parseSRT(content) {
  const subtitles = [];
  const blocks = content.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;

    // Skip the index line (first line)
    const timeLine = lines[1];
    const textLines = lines.slice(2);

    // Parse time format: 00:00:20,000 --> 00:00:24,400
    const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);

    if (timeMatch) {
      const [, startH, startM, startS, startMs, endH, endM, endS, endMs] = timeMatch;

      const startTime =
        parseInt(startH) * 3600 +
        parseInt(startM) * 60 +
        parseInt(startS) +
        parseInt(startMs) / 1000;

      const endTime =
        parseInt(endH) * 3600 +
        parseInt(endM) * 60 +
        parseInt(endS) +
        parseInt(endMs) / 1000;

      subtitles.push({
        start: startTime,
        end: endTime,
        text: textLines.join('\n')
      });
    }
  }

  return subtitles;
}

/**
 * Get current subtitle text based on current time
 * If no subtitle is active at the current time, returns the last passed subtitle
 * @param {Array} subtitles - Array of subtitle objects
 * @param {number} currentTime - Current playback time in seconds
 * @returns {string|null} Current subtitle text or last subtitle text or null
 */
export function getCurrentSubtitle(subtitles, currentTime) {
  if (!subtitles || subtitles.length === 0) return null;

  // Find active subtitle at current time
  const current = subtitles.find(
    sub => currentTime >= sub.start && currentTime <= sub.end
  );

  if (current) {
    return current.text;
  }

  // If no current subtitle, find the last subtitle that has passed
  let lastSubtitle = null;
  for (const sub of subtitles) {
    if (sub.end < currentTime) {
      lastSubtitle = sub;
    } else {
      break; // Subtitles are in chronological order, so we can stop here
    }
  }

  return lastSubtitle ? lastSubtitle.text : null;
}
