
export function parseDate(date = new Date()) {
  const options = { month: "short", day: "numeric", year: "numeric" };

  const now = new Date();

  const time = date.getTime();
  const fullDateString = date.toLocaleString("en-US", options);
  const since = parseTimeSince(now.getTime() - time);

  return { time, fullDateString, since };
}

export function parseTimeSince(ms) {
  let suffix = "";
  let unit;

  const seconds = (ms - (ms % 1000)) / 1000;

  if (seconds / 3.154e7 >= 1) {
    suffix = "y";
    unit = Math.floor(seconds / 3.154e7);
  } else if (seconds / 2.592e6 >= 1) {
    suffix = "mo";
    unit = Math.floor(seconds / 2.592e6);
  } else if (seconds / 6.048e5 >= 1) {
    suffix = "w";
    unit = Math.floor(seconds / 6.048e5);
  } else if (seconds / 8.64e4 >= 1) {
    suffix = "d";
    unit = Math.floor(seconds / 8.64e4);
  } else if (seconds / 3600 >= 1) {
    suffix = "h";
    unit = Math.floor(seconds / 3600);
  } else if (seconds / 60 >= 1) {
    suffix = "m";
    unit = Math.floor(seconds / 60);
  } else if (seconds <= 10) {
    return "just now";
  } else {
    suffix = "s";
    unit = seconds;
  }

  return unit + suffix;
}
