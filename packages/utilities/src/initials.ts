/** Regex to detect words within paraenthesis in a string where gi implies global and case-insensitive. */
const CHARS_WITHIN_PARENTHESIS_REGEX: RegExp = new RegExp('\\(([^)]*)\\)', 'gi');

/**
 *  Matches any non-word characters with respect to the Unicode codepoints; generated by
 * https://mothereff.in/regexpu for regex /\W /u where u stands for Unicode support (ES6 feature).
 * More info here: http://stackoverflow.com/questions/280712/javascript-unicode-regexes.
 * gi implies global and case-insensitive.
 */
const UNICODE_ALPHANUMERIC_CHARS_REGEX =
  new RegExp(
    '(?:[\0-/:-@\[-\^`\{-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]) ',
    'gi');

/** Regex to detect multiple spaces in a string where gi implies global and case-insensitive. */
const MULTIPLE_WHITESPACES_REGEX_TOKEN: RegExp = new RegExp('\\s+', 'gi');

/** Regex to detect Arabic text. */
const ARABIC_LANGUAGE_REGEX = new RegExp('[\u0621-\u064A\u0660-\u0669]');

/** Regex to detect Korean text. */
const KOREAN_LANGUAGE_REGEX = new RegExp('[\u1100-\u11FF|\u3130-\u318F|\uA960-\uA97F|\uAC00-\uD7AF|\uD7B0-\uD7FF]');

/** Regex to detect Chinese text. */
const CHINESE_LANGUAGE_REGEX = new RegExp('[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]');

function getInitialsArabic(displayName: string, isRtl: boolean): string {
  const name = displayName.replace(/\s/, '');

  return isRtl ? name[name.length - 1] : name[0];
}

function getInitialsAsian(displayName: string, isRtl: boolean): string {
  const name = displayName.replace(/\s/, '');

  // For short names, only display a single character of the family name
  if (name.length <= 2) {
    return isRtl ? name[0] : name[name.length - 1];
  }

  // For long names, display the two most significant characters of the family name
  return isRtl ? name.substr(0, 2) : name.substr(name.length - 2, name.length);
}

function getInitialsLatin(displayName: string, isRtl: boolean): string {
  let initials = '';

  const splits: string[] = displayName.split(' ');

  if (splits.length === 2) {
    initials += splits[0].charAt(0).toUpperCase();
    initials += splits[1].charAt(0).toUpperCase();
  } else if (splits.length === 3) {
    initials += splits[0].charAt(0).toUpperCase();
    initials += splits[2].charAt(0).toUpperCase();
  } else if (splits.length !== 0) {
    initials += splits[0].charAt(0).toUpperCase();
  }

  if (isRtl && initials.length > 1) {
    return initials.charAt(1) + initials.charAt(0);
  }

  return initials;
}

function cleanupDisplayName(displayName: string): string {
  // Do not consider the suffixes within parenthesis while computing the initials.
  displayName = displayName.replace(CHARS_WITHIN_PARENTHESIS_REGEX, '');

  // Ignore non-word characters
  displayName = displayName.replace(UNICODE_ALPHANUMERIC_CHARS_REGEX, '');

  // Make whitespace consistent
  displayName = displayName.replace(MULTIPLE_WHITESPACES_REGEX_TOKEN, ' ');
  displayName = displayName.trim();

  return displayName;
}

/** Get (up to 2 characters) initials based on display name of the persona. */
export function getInitials(displayName: string, isRtl: boolean): string {
  if (displayName == null) {
    return '';
  }

  displayName = cleanupDisplayName(displayName);

  if (ARABIC_LANGUAGE_REGEX.test(displayName)) {
    return getInitialsArabic(displayName, isRtl);
  }

  if (KOREAN_LANGUAGE_REGEX.test(displayName) || CHINESE_LANGUAGE_REGEX.test(displayName)) {
    return getInitialsAsian(displayName, isRtl);
  }

  return getInitialsLatin(displayName, isRtl);
}
