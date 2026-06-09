/* THE ENDLESS INTERNET — engine v2
   Discovery-driven. No click count. Find things, unlock things.
   Everything is local. Nothing is sent anywhere. */

(function () {
  "use strict";

  // ============================================
  // STORAGE KEYS
  // ============================================
  const K = {
    visited: "endless_internet_visited",
    fragments: "endless_internet_fragments",
    passwords: "endless_internet_passwords",
    objectives: "endless_internet_objectives",
    completedObj: "endless_internet_completed_obj",
    threads: "endless_internet_threads",
    started: "endless_internet_started",
    seenMessages: "endless_internet_seen_msgs",
    archiveUnlocked: "archive_unlocked",
    riddlesSolved: "endless_internet_riddles_solved",
    truthSeen: "endless_internet_truth_seen",
    endSeen: "endless_internet_end_seen",
  };

  // ============================================
  // RIDDLES — embedded puzzles hidden in pages
  // ============================================
  // Each riddle has: id, question, accept (array of accepted answers,
  // case-insensitive), fragment granted on solve, optional misdirect msg.
  // Solved riddles persist in localStorage.
  const RIDDLES = {
    "riddle-axis": {
      id: "riddle-axis",
      page: "mirror/14-axis-deep.html",
      prompt: "14 numbers go in. 1 number comes out. The threshold, in the formal sense, is what?",
      hint: "Read the spec carefully. Look for the number between two others.",
      accept: ["0.55", ".55", "0.55%", "55", "point five five", "point-five-five"],
      fragment: "threshold-crossed",
      misdirect: [
        "not quite. read again.",
        "wrong. the answer is in the prose, not the math.",
        "almost. but the formal sense is a different number than the practical sense.",
      ],
    },
    "riddle-signal": {
      id: "riddle-signal",
      page: "signals/console-log.html",
      prompt: "Four timestamps. Three of them are routine. One of them is not. Which one?",
      hint: "It happened when nothing was supposed to happen. The page was not yours.",
      accept: ["03:14", "0314", "3:14", "3:14am", "3:14 am", "three fourteen", "three-fourteen"],
      fragment: "the system saw you",
      misdirect: [
        "no. the answer is a time, not a page.",
        "close. but you have to find the timestamp that breaks the pattern.",
      ],
    },
    "riddle-helena": {
      id: "riddle-helena",
      page: "helena/last.html",
      prompt: "The author writes under a codename. Her codename, in the formal sense, is what she was called at the project. Find the codename.",
      hint: "It appears in three digits and four letters. She was a number before she was a name.",
      accept: ["ev-2417", "ev2417", "EV-2417", "EV2417", "ev 2417"],
      fragment: "the codename",
      misdirect: [
        "no. the answer is a codename, not her real name.",
        "wrong. it is on this page, but you have to look at the small text.",
      ],
    },
    "riddle-truth": {
      id: "riddle-truth",
      page: "mirror/truth.html",
      prompt: "How many Americans, in the formal sense? The number, written in digits, with a comma. As it appears in the verse.",
      hint: "It is repeated in the document. The first appearance is in italics, in the dedication.",
      accept: ["2,304,891", "2304891", "2,304,891.", "2304891 people", "two million three hundred four thousand eight hundred ninety one"],
      fragment: "the count is real",
      misdirect: [
        "no. the verse says one number, plainly. read it again.",
        "wrong. it is in the first three lines of the document, not the body.",
      ],
    },
    "riddle-elena": {
      id: "riddle-elena",
      page: "employees/elena-vasquez.html",
      prompt: "What was the item she did NOT return? The thing Helix wanted back but could not get.",
      hint: "It is mentioned in the termination summary. The item is described as encrypted.",
      accept: ["the vasquez drive", "vasquez drive", "encrypted personal storage device", "encrypted storage device", "personal storage device", "the drive"],
      fragment: "the missing device",
      misdirect: [
        "no. she returned the laptop, the badge, and the pass. the other item was not returned.",
        "wrong. look at the items not returned section.",
      ],
    },
    "riddle-3am": {
      id: "riddle-3am",
      page: "signals/3am-pageview.html",
      prompt: "The browsing session lasted exactly how many seconds? The report says the number.",
      hint: "It is a three-digit number. The report says it plainly.",
      accept: ["113", "113 seconds", "one hundred thirteen"],
      fragment: "the session duration",
      misdirect: [
        "no. it is a number, not a time.",
        "wrong. the report says the total session duration was exactly this many seconds.",
      ],
    },
    "riddle-glitch": {
      id: "riddle-glitch",
      page: "signals/glitch-report.html",
      prompt: "What is the name the web ops team gave the anomaly? The internal codename.",
      hint: "It is a hex value followed by a word. The word is in the report.",
      accept: ["ev-2417 echo", "ev2417 echo", "the ev-2417 echo", "EV-2417 echo", "0xEV-2417 echo"],
      fragment: "the echo name",
      misdirect: [
        "no. the codename is in the report, in the recommendations section.",
        "wrong. it is what they call the anomaly internally.",
      ],
    },
    "riddle-renner": {
      id: "riddle-renner",
      page: "archive/renner-full-statement.html",
      prompt: "Mark Renner was placed on administrative leave pending what? The two-word review.",
      hint: "The statement says he was placed on leave pending a review. The review has two words.",
      accept: ["security review", "a security review", "the security review"],
      fragment: "the leave reason",
      misdirect: [
        "no. the statement says he was placed on leave pending a review of a specific kind.",
        "wrong. look at the fragments section — it says the review type.",
      ],
    },
    "riddle-vasquez": {
      id: "riddle-vasquez",
      page: "archive/vasquez-statement.html",
      prompt: "Dr. Vasquez's website was taken offline how many hours and minutes after publication?",
      hint: "The statement says the website was taken offline at a specific time after publication.",
      accept: ["4 hours and 17 minutes", "4 hours 17 minutes", "4:17", "4 hours, 17 minutes", "four hours and seventeen minutes"],
      fragment: "the takedown time",
      misdirect: [
        "no. the statement says the exact time the website was taken offline.",
        "wrong. it is a duration, not a timestamp.",
      ],
    },
    "riddle-deleted": {
      id: "riddle-deleted",
      page: "blog/deleted.html",
      prompt: "How many deployments did the Ethics board attempt to pause in 18 months?",
      hint: "The CEO says the board has paused deployments. The annotation says how many were overridden.",
      accept: ["3", "three", "three deployments", "3 deployments"],
      fragment: "the override count",
      misdirect: [
        "no. the annotation says the board attempted to pause this many deployments.",
        "wrong. look at the annotation by E. Vasquez.",
      ],
    },
    "riddle-cohort": {
      id: "riddle-cohort",
      page: "archive/cohort-update-log.html",
      prompt: "What was the false-positive rate? The percentage that corresponds to 92,196 Americans.",
      hint: "The log says the rate, applied to the cohort, corresponds to 92,196 false positives.",
      accept: ["4%", "4 percent", "4", "four percent", "four%", ".04"],
      fragment: "the error rate",
      misdirect: [
        "no. the log says the false-positive rate as a percentage.",
        "wrong. look at the paragraph that mentions back-testing.",
      ],
    },
    "riddle-employment": {
      id: "riddle-employment",
      page: "press/employment-record.html",
      prompt: "What is Aisha Lopez's employee ID? The four-character code.",
      hint: "It is in the employment record. The format is two letters and four digits.",
      accept: ["al-1834", "AL-1834", "al1834", "AL1834", "AL 1834"],
      fragment: "the board chair id",
      misdirect: [
        "no. it is an employee ID, not a name.",
        "wrong. look at the Aisha Lopez section of the employment record.",
      ],
    },
    // ====== NEW RIDDLES — WITH FRAGMENTS (give clues) ======
    "riddle-maintenance1": {
      id: "riddle-maintenance1",
      page: "blog/maintenance-log-2019.html",
      prompt: "What anomaly rate was recorded in the September check? The exact percentage.",
      hint: "Look at the September 18, 2019 entry. The rate is in the WARNING section.",
      accept: ["0.08%", "0.08", "0.08 percent", ".08", "point zero eight"],
      fragment: "anomaly-sept-2019",
      misdirect: ["no. it is a percentage, not a count.", "wrong. the September entry has the number."],
    },
    "riddle-maintenance2": {
      id: "riddle-maintenance2",
      page: "blog/maintenance-log-2019.html",
      prompt: "Which two axes were spiking in the November check?",
      hint: "The November entry mentions two axes by number.",
      accept: ["axis 11 and axis 14", "11 and 14", "axis 11, axis 14", "11, 14", "axes 11 and 14"],
      fragment: "axes-spiking",
      misdirect: ["no. look at the November entry for the axis numbers.", "wrong. two axes are named."],
    },
    "riddle-maintenance3": {
      id: "riddle-maintenance3",
      page: "blog/maintenance-log-2019.html",
      prompt: "What was the technician told to stop doing?",
      hint: "The final note says the technician was told to stop something.",
      accept: ["stop logging anomaly rates", "logging anomaly rates", "stop logging", "logging rates"],
      fragment: null,
      misdirect: ["no. the final note says what was stopped.", "wrong. read the last technician note."],
    },
    "riddle-redacted1": {
      id: "riddle-redacted1",
      page: "blog/redacted-statement-2020.html",
      prompt: "How many days after release was the original statement replaced?",
      hint: "The editor's note says when the statement was replaced.",
      accept: ["2 days", "2", "two days", "two"],
      fragment: "replacement-timing",
      misdirect: ["no. count the days between January 15 and January 17.", "wrong. the editor's note has the dates."],
    },
    "riddle-redacted2": {
      id: "riddle-redacted2",
      page: "blog/redacted-statement-2020.html",
      prompt: "Who archived the original statement before deletion?",
      hint: "The editor's note says who archived it.",
      accept: ["helix it", "Helix IT", "the IT department", "IT", "helix information technology"],
      fragment: "archive-source",
      misdirect: ["no. the editor's note names the department.", "wrong. it was archived before deletion."],
    },
    "riddle-whistle1": {
      id: "riddle-whistle1",
      page: "blog/whistleblower-email.html",
      prompt: "On what date was the ethics-committee email address deactivated?",
      hint: "The delivery status section says when the address was deactivated.",
      accept: ["march 28, 2019", "march 28 2019", "03/28/2019", "march 28", "3/28/2019"],
      fragment: "ethics-deactivation",
      misdirect: ["no. the delivery status has the date.", "wrong. the email was sent after the address was already gone."],
    },
    "riddle-whistle2": {
      id: "riddle-whistle2",
      page: "blog/whistleblower-email.html",
      prompt: "How many days after the address was deactivated was the email sent?",
      hint: "Count from March 28 to April 3.",
      accept: ["6 days", "6", "six days", "six"],
      fragment: null,
      misdirect: ["no. count the days between the two dates.", "wrong. the address was deactivated March 28, the email was sent April 3."],
    },
    "riddle-board1": {
      id: "riddle-board1",
      page: "blog/board-meeting-minutes.html",
      prompt: "How many minutes were redacted from Agenda Item 3?",
      hint: "The minutes say a specific number of minutes were redacted.",
      accept: ["47 minutes", "47", "47 min", "forty-seven"],
      fragment: "redacted-duration",
      misdirect: ["no. the minutes state the number.", "wrong. look for the redacted time in Agenda Item 3."],
    },
    "riddle-board2": {
      id: "riddle-board2",
      page: "blog/board-meeting-minutes.html",
      prompt: "What exemption was cited for the closed session redaction?",
      hint: "Agenda Item 7 cites a specific exemption.",
      accept: ["national security", "national security exemption", "the national security exemption"],
      fragment: "exemption-type",
      misdirect: ["no. the exemption is cited at the bottom of Item 7.", "wrong. it is a two-word exemption."],
    },
    "riddle-board3": {
      id: "riddle-board3",
      page: "blog/board-meeting-minutes.html",
      prompt: "Who kept a copy of the minutes after being asked to destroy them?",
      hint: "The source note says who kept the copy.",
      accept: ["the assistant", "a board member's assistant", "board member's assistant", "the board member's assistant"],
      fragment: "leak-source",
      misdirect: ["no. the source note identifies who kept the copy.", "wrong. it was someone's assistant."],
    },
    "riddle-forum4456a": {
      id: "riddle-forum4456a",
      page: "forum/thread-4456.html",
      prompt: "At what temperature was the server room found?",
      hint: "sysadmin_ghost reports the temperature.",
      accept: ["98°F", "98", "98 degrees", "98 fahrenheit", "98 degrees fahrenheit"],
      fragment: "server-temp",
      misdirect: ["no. the first post mentions the temperature.", "wrong. it is a two-digit number."],
    },
    "riddle-forum4456b": {
      id: "riddle-forum4456b",
      page: "forum/thread-4456.html",
      prompt: "How many times did the servers ramp up between 3:14 and 4:00 AM?",
      hint: "night_shift_ops counted the cycles.",
      accept: ["7 times", "7", "seven times", "seven"],
      fragment: "cycle-count",
      misdirect: ["no. night_shift_ops says the number.", "wrong. count the ramps mentioned."],
    },
    "riddle-forum4456c": {
      id: "riddle-forum4456c",
      page: "forum/thread-4456.html",
      prompt: "What did the server lights look like when they were all blinking?",
      hint: "floor12_witness describes the blinking pattern.",
      accept: ["breathing", "like breathing", "it looked like breathing"],
      fragment: null,
      misdirect: ["no. floor12_witness uses a specific word.", "wrong. the description is a single word."],
    },
    "riddle-forum7823a": {
      id: "riddle-forum7823a",
      page: "forum/thread-7823.html",
      prompt: "How many consecutive days had the 113 pageview pattern?",
      hint: "data_watcher says how many days.",
      accept: ["47 days", "47", "forty-seven days", "forty-seven"],
      fragment: "pattern-duration",
      misdirect: ["no. data_watcher states the count.", "wrong. it is a two-digit number."],
    },
    "riddle-forum7823b": {
      id: "riddle-forum7823b",
      page: "forum/thread-7823.html",
      prompt: "What was the page being hit by the 113 requests?",
      hint: "data_watcher reveals what the page was.",
      accept: ["a 404", "a 404 page", "404", "a page that doesn't exist", "a non-existent page"],
      fragment: "target-page",
      misdirect: ["no. the page is described by its HTTP status.", "wrong. it was a page that didn't exist."],
    },
    "riddle-forum5512a": {
      id: "riddle-forum5512a",
      page: "forum/thread-5512.html",
      prompt: "How many employees have vanished in the last 6 months?",
      hint: "insider_12 compiled a list with a specific count.",
      accept: ["12", "12 employees", "twelve", "twelve employees"],
      fragment: "vanished-count",
      misdirect: ["no. insider_12 lists them all.", "wrong. count the names in the list."],
    },
    "riddle-forum5512b": {
      id: "riddle-forum5512b",
      page: "forum/thread-5512.html",
      prompt: "What happened to the HR manager who asked about the vanishings?",
      hint: "hr_insider says what happened to their manager.",
      accept: ["her access was revoked", "access revoked", "revoked", "her access was revoked the next day"],
      fragment: "hr-consequence",
      misdirect: ["no. hr_insider says what happened.", "wrong. it is a two-word consequence."],
    },
    "riddle-forum8891a": {
      id: "riddle-forum8891a",
      page: "forum/thread-8891.html",
      prompt: "How many times is SITE-07 referenced in the file?",
      hint: "green_thread_hunter says the reference count.",
      accept: ["47 times", "47", "forty-seven times", "forty-seven"],
      fragment: "site07-refs",
      misdirect: ["no. the count is stated.", "wrong. it is a two-digit number."],
    },
    "riddle-forum8891b": {
      id: "riddle-forum8891b",
      page: "forum/thread-8891.html",
      prompt: "How long did the LOOKING GLASS experiment run?",
      hint: "archivist_42 states the duration.",
      accept: ["4 hours and 17 minutes", "4 hours 17 minutes", "4:17", "four hours and seventeen minutes"],
      fragment: "looking-glass-duration",
      misdirect: ["no. the duration is stated as hours and minutes.", "wrong. it is the same duration that appears everywhere."],
    },
    "riddle-okoro1": {
      id: "riddle-okoro1",
      page: "employees/james-okoro.html",
      prompt: "On how many consecutive nights did Okoro access Floor 12 at 3:14 AM?",
      hint: "The access log shows a streak of nights.",
      accept: ["6 nights", "6", "six nights", "six", "six consecutive nights"],
      fragment: "okoro-access",
      misdirect: ["no. count the access log entries.", "wrong. it is a single-digit number."],
    },
    "riddle-okoro2": {
      id: "riddle-okoro2",
      page: "employees/james-okoro.html",
      prompt: "What did Okoro say the servers were doing?",
      hint: "His colleague quote describes what he found.",
      accept: ["breathing", "it was breathing", "the servers were breathing"],
      fragment: null,
      misdirect: ["no. the colleague quote uses a specific word.", "wrong. it is a single word."],
    },
    "riddle-chen1": {
      id: "riddle-chen1",
      page: "employees/sarah-chen.html",
      prompt: "What accuracy did Sarah Chen say the model achieved?",
      hint: "Her final communication states the accuracy percentage.",
      accept: ["96%", "96 percent", "96", "ninety-six percent", "ninety-six"],
      fragment: "chen-accuracy",
      misdirect: ["no. the accuracy is stated as a percentage.", "wrong. it is a two-digit number."],
    },
    "riddle-chen2": {
      id: "riddle-chen2",
      page: "employees/sarah-chen.html",
      prompt: "What did Sarah Chen say the model was, not just analytics?",
      hint: "Her email says what the model actually is.",
      accept: ["surveillance", "that's surveillance", "it's surveillance", "surveillance on a scale"],
      fragment: "chen-classification",
      misdirect: ["no. she reclassifies what the model is.", "wrong. it is a single word."],
    },
    "riddle-santos1": {
      id: "riddle-santos1",
      page: "employees/maria-santos.html",
      prompt: "How many questions did Maria Santos ask during the preliminary review?",
      hint: "Her review notes list three specific questions.",
      accept: ["3", "three", "three questions", "3 questions"],
      fragment: "santos-questions",
      misdirect: ["no. count the questions listed.", "wrong. it is a single-digit number."],
    },
    "riddle-santos2": {
      id: "riddle-santos2",
      page: "employees/maria-santos.html",
      prompt: "What password did Santos say would access the Vasquez drive?",
      hint: "Her personal note says the password is a specific thing.",
      accept: ["her name", "vasquez", "elena", "elena vasquez", "her name lowercase"],
      fragment: "drive-password",
      misdirect: ["no. the password is described, not spelled.", "wrong. it is a name, lowercase."],
    },
    "riddle-foia1": {
      id: "riddle-foia1",
      page: "archive/foia-results.html",
      prompt: "How many pages were responsive out of 14,000+?",
      hint: "The summary states the responsive page count.",
      accept: ["2,847", "2847", "2,847 pages", "2847 pages"],
      fragment: "foia-responsive",
      misdirect: ["no. the summary has the number.", "wrong. it is a four-digit number."],
    },
    "riddle-foia2": {
      id: "riddle-foia2",
      page: "archive/foia-results.html",
      prompt: "What notable coincidence exists between the reference cohort and the page count?",
      hint: "The document notes they are the same number.",
      accept: ["they are the same number", "same number", "the numbers match", "they match"],
      fragment: "coincidence-note",
      misdirect: ["no. the document points out the coincidence.", "wrong. the two numbers are identical."],
    },
    "riddle-site07a": {
      id: "riddle-site07a",
      page: "archive/site-07.html",
      prompt: "How many floors does SITE-07 have below ground?",
      hint: "The facility specifications list the floors.",
      accept: ["7 floors", "7", "seven floors", "seven", "7 below ground"],
      fragment: "site07-depth",
      misdirect: ["no. the specifications say the floor count.", "wrong. it is a single-digit number."],
    },
    "riddle-site07b": {
      id: "riddle-site07b",
      page: "archive/site-07.html",
      prompt: "What is the final recommendation about LOOKING GLASS?",
      hint: "The document quotes the recommendation.",
      accept: ["do not restart. do not discuss.", "do not restart, do not discuss", "do not restart", "do not discuss"],
      fragment: "looking-glass-rec",
      misdirect: ["no. the recommendation has two parts.", "wrong. it starts with 'do not'."],
    },
    "riddle-three1": {
      id: "riddle-three1",
      page: "archive/three-party-structure.html",
      prompt: "What access level does Party 2 have?",
      hint: "The document states Party 2's access.",
      accept: ["read-only", "read only", "read-only access"],
      fragment: "party2-access",
      misdirect: ["no. the access level is two words.", "wrong. Party 2 cannot write."],
    },
    "riddle-three2": {
      id: "riddle-three2",
      page: "archive/three-party-structure.html",
      prompt: "In the backup protocol, what does the model not need?",
      hint: "The protocol says the model does not need something.",
      accept: ["helix to survive", "helix", "human intervention", "no human intervention required"],
      fragment: "autonomous-model",
      misdirect: ["no. the protocol says what the model doesn't need.", "wrong. it is about independence."],
    },
    "riddle-audit1": {
      id: "riddle-audit1",
      page: "archive/audit-2021.html",
      prompt: "What happened to the auditor who wrote the final note?",
      hint: "The supplemental note says what happened.",
      accept: ["reassigned", "was reassigned", "reassigned three days later", "the auditor was reassigned"],
      fragment: "auditor-fate",
      misdirect: ["no. the supplemental note says the consequence.", "wrong. it is a single word."],
    },
    "riddle-audit2": {
      id: "riddle-audit2",
      page: "archive/audit-2021.html",
      prompt: "How many days after the audit was the auditor reassigned?",
      hint: "The supplemental note specifies the timeframe.",
      accept: ["3 days", "3", "three days", "three"],
      fragment: null,
      misdirect: ["no. the note says how many days.", "wrong. it is a single-digit number."],
    },
    "riddle-journal1": {
      id: "riddle-journal1",
      page: "helena/journal-entry.html",
      prompt: "What encryption was used on the journal entry?",
      hint: "The header states the encryption type.",
      accept: ["aes-256", "AES-256", "aes 256", "aes256", "AES256"],
      fragment: "encryption-type",
      misdirect: ["no. the header names the encryption.", "wrong. it is a standard encryption type."],
    },
    "riddle-journal2": {
      id: "riddle-journal2",
      page: "helena/journal-entry.html",
      prompt: "What does Helena say the 14 axes are not?",
      hint: "She says what they are NOT.",
      accept: ["behavioral metrics", "not behavioral metrics", "they are not behavioral metrics"],
      fragment: "axes-redefined",
      misdirect: ["no. she negates a specific term.", "wrong. it is two words."],
    },
    "riddle-finalmsg1": {
      id: "riddle-finalmsg1",
      page: "helena/final-message.html",
      prompt: "What was the delivery status of Helena's final email?",
      hint: "The status is shown after the email.",
      accept: ["draft — never sent", "draft", "draft never sent", "never sent", "draft — never sent"],
      fragment: "email-status",
      misdirect: ["no. the status is shown below the email.", "wrong. it is a single word."],
    },
    "riddle-finalmsg2": {
      id: "riddle-finalmsg2",
      page: "helena/final-message.html",
      prompt: "When was the drafts folder deleted?",
      hint: "The source note says when.",
      accept: ["october 5, 2019", "october 5 2019", "october 5", "10/5/2019"],
      fragment: "drafts-deleted",
      misdirect: ["no. the source note has the date.", "wrong. it is two days after the last entry."],
    },
    "riddle-note1": {
      id: "riddle-note1",
      page: "helena/helena-note.html",
      prompt: "Where was Helena's note found?",
      hint: "The source note says the location.",
      accept: ["elena vasquez's office", "vasquez's office", "on vasquez's desk", "elena's desk", "vasquez office"],
      fragment: "note-location",
      misdirect: ["no. the source note names the location.", "wrong. it was in someone's office."],
    },
    "riddle-note2": {
      id: "riddle-note2",
      page: "helena/helena-note.html",
      prompt: "How was the note positioned on the desk?",
      hint: "The source note describes how it was placed.",
      accept: ["face up", "in the center", "face up in the center", "center of the desk face up"],
      fragment: "note-placement",
      misdirect: ["no. the source note describes the positioning.", "wrong. it was placed deliberately."],
    },
    "riddle-traffic1": {
      id: "riddle-traffic1",
      page: "signals/traffic-analysis.html",
      prompt: "How many outbound connections are initiated at 3:14 AM?",
      hint: "Pattern 1 states the connection count.",
      accept: ["113", "113 connections", "one hundred thirteen"],
      fragment: "connection-count",
      misdirect: ["no. the count is a three-digit number.", "wrong. it is the same number that appears elsewhere."],
    },
    "riddle-traffic2": {
      id: "riddle-traffic2",
      page: "signals/traffic-analysis.html",
      prompt: "How long is the silence period at 4:17 AM?",
      hint: "Pattern 2 states the duration.",
      accept: ["17 minutes", "17", "seventeen minutes", "seventeen"],
      fragment: "silence-duration",
      misdirect: ["no. the duration is stated in minutes.", "wrong. it is a two-digit number."],
    },
    "riddle-traffic3": {
      id: "riddle-traffic3",
      page: "signals/traffic-analysis.html",
      prompt: "How much data is transferred between 3:14 and 4:17 AM?",
      hint: "Pattern 3 states the data volume.",
      accept: ["2.3 terabytes", "2.3 tb", "2.3", "2.3 terabyte", "2.3tb"],
      fragment: "data-volume",
      misdirect: ["no. the volume is a decimal number.", "wrong. it is measured in terabytes."],
    },
    "riddle-traffic4": {
      id: "riddle-traffic4",
      page: "signals/traffic-analysis.html",
      prompt: "How long does the entire nightly process take from start to finish?",
      hint: "Pattern 4 calculates the total time.",
      accept: ["1 hour and 3 minutes", "63 minutes", "1 hour 3 minutes", "one hour and three minutes"],
      fragment: "process-duration",
      misdirect: ["no. add the time from 3:14 to 4:17.", "wrong. it is one hour and a few minutes."],
    },
    "riddle-server1": {
      id: "riddle-server1",
      page: "signals/server-logs.html",
      prompt: "What is the first log entry's cycle number?",
      hint: "The 3:14 AM log states the cycle number.",
      accept: ["cycle 447", "447", "cycle447"],
      fragment: "cycle-number",
      misdirect: ["no. the log states the cycle.", "wrong. it is a three-digit number."],
    },
    "riddle-server2": {
      id: "riddle-server2",
      page: "signals/server-logs.html",
      prompt: "What non-standard message ends the 4:17 AM log?",
      hint: "The final log entry is not a standard system message.",
      accept: ["goodnight", "GOODNIGHT", "goodnight.", "goodnight!"],
      fragment: "goodnight-msg",
      misdirect: ["no. the final entry is a single word.", "wrong. it is a greeting."],
    },
    "riddle-server3": {
      id: "riddle-server3",
      page: "signals/server-logs.html",
      prompt: "What percentage of the logs were recovered?",
      hint: "The status line says the recovery percentage.",
      accept: ["47%", "47 percent", "47", "forty-seven percent"],
      fragment: "recovery-rate",
      misdirect: ["no. the status has the percentage.", "wrong. it is a two-digit number."],
    },
    "riddle-mirrorout1": {
      id: "riddle-mirrorout1",
      page: "signals/mirror-output.html",
      prompt: "What is EV-2417's Axis 3 score?",
      hint: "The model output lists all 14 axis scores.",
      accept: ["0.55", ".55", "point five five"],
      fragment: "axis3-score",
      misdirect: ["no. look at the axis list.", "wrong. it is a decimal number."],
    },
    "riddle-mirrorout2": {
      id: "riddle-mirrorout2",
      page: "signals/mirror-output.html",
      prompt: "What is the prediction confidence for EV-2417?",
      hint: "The model output states the confidence.",
      accept: ["96%", "96", "96 percent", "ninety-six percent"],
      fragment: "prediction-confidence",
      misdirect: ["no. the confidence is a percentage.", "wrong. it is a two-digit number."],
    },
    "riddle-mirrorout3": {
      id: "riddle-mirrorout3",
      page: "signals/mirror-output.html",
      prompt: "Who is EV-2417?",
      hint: "The subject note reveals the identity.",
      accept: ["elena vasquez", "elena", "vasquez", "dr. vasquez"],
      fragment: "ev2417-identity",
      misdirect: ["no. the subject note names the person.", "wrong. it is the project lead."],
    },
    "riddle-14axis1": {
      id: "riddle-14axis1",
      page: "mirror/14-axis-model.html",
      prompt: "What is the threshold for Axis 1 (Behavioral Consistency)?",
      hint: "The axis list states each threshold.",
      accept: ["0.78", ".78", "point seven eight"],
      fragment: "axis1-threshold",
      misdirect: ["no. look at Axis 1.", "wrong. it is a decimal number."],
    },
    "riddle-14axis2": {
      id: "riddle-14axis2",
      page: "mirror/14-axis-model.html",
      prompt: "What is the highest threshold among all 14 axes?",
      hint: "Compare all thresholds. One is the highest.",
      accept: ["0.99", ".99", "axis 13", "system integrity", "0.99 for system integrity"],
      fragment: "max-threshold",
      misdirect: ["no. compare all 14 thresholds.", "wrong. one axis has a threshold of 0.99."],
    },
    "riddle-14axis3": {
      id: "riddle-14axis3",
      page: "mirror/14-axis-model.html",
      prompt: "How many false positives has the model flagged so far?",
      hint: "The threshold significance section states the count.",
      accept: ["92,196", "92196", "92,196 subjects", "92196 subjects"],
      fragment: "false-positive-count",
      misdirect: ["no. the section states the number.", "wrong. it is a five-digit number."],
    },
    "riddle-sysarch1": {
      id: "riddle-sysarch1",
      page: "mirror/system-architecture.html",
      prompt: "How many server racks does MIRROR run on?",
      hint: "The system overview states the rack count.",
      accept: ["14 racks", "14", "fourteen racks", "fourteen"],
      fragment: "rack-count",
      misdirect: ["no. the overview states the number.", "wrong. it matches the number of axes."],
    },
    "riddle-sysarch2": {
      id: "riddle-sysarch2",
      page: "mirror/system-architecture.html",
      prompt: "How many minutes of silence occur after processing?",
      hint: "The daily cycle describes the silence period.",
      accept: ["17 minutes", "17", "seventeen minutes", "seventeen"],
      fragment: "shutdown-minutes",
      misdirect: ["no. the cycle describes the duration.", "wrong. it is a two-digit number."],
    },
    "riddle-sysarch3": {
      id: "riddle-sysarch3",
      page: "mirror/system-architecture.html",
      prompt: "What is the model designed to do without human intervention?",
      hint: "The autonomous operation section says what the model continues to do.",
      accept: ["run", "continue to run", "continue to predict", "run, predict, and get better"],
      fragment: "autonomous-design",
      misdirect: ["no. the section says what it does autonomously.", "wrong. it is a single word."],
    },
    // ====== RIDDLES WITHOUT FRAGMENTS (dead ends, red herrings) ======
    "riddle-rh1": {
      id: "riddle-rh1",
      page: "blog/maintenance-log-2019.html",
      prompt: "What was the March anomaly rate?",
      hint: "Look at the March entry.",
      accept: ["0.003%", "0.003", ".003", "0.003 percent"],
      fragment: null,
      misdirect: ["no. the March entry has the number.", "wrong. it is a very small percentage."],
    },
    "riddle-rh2": {
      id: "riddle-rh2",
      page: "blog/maintenance-log-2019.html",
      prompt: "What did the technician say about Axis 7 in March?",
      hint: "The March entry mentions Axis 7.",
      accept: ["slight drift", "drift", "axis 7 showing slight drift"],
      fragment: null,
      misdirect: ["no. the March entry describes the issue.", "wrong. it is about drift."],
    },
    "riddle-rh3": {
      id: "riddle-rh3",
      page: "blog/redacted-statement-2020.html",
      prompt: "What did the shorter replacement statement contain?",
      hint: "The editor's note says what the replacement lacked.",
      accept: ["no mention of project mirror", "no mention of mirror", "no mention of the project"],
      fragment: null,
      misdirect: ["no. the note says what was removed.", "wrong. the replacement had less content."],
    },
    "riddle-rh4": {
      id: "riddle-rh4",
      page: "blog/whistleblower-email.html",
      prompt: "What was the email's subject line?",
      hint: "The subject is shown at the top.",
      accept: ["urgent — mirror data integrity", "urgent mirror data integrity", "mirror data integrity"],
      fragment: null,
      misdirect: ["no. the subject line is shown.", "wrong. it starts with URGENT."],
    },
    "riddle-rh5": {
      id: "riddle-rh5",
      page: "blog/board-meeting-minutes.html",
      prompt: "Who was present at the meeting?",
      hint: "The attendees are listed.",
      accept: ["lopez, renner, vásquez", "lopez, renner, vasquez", "four people"],
      fragment: null,
      misdirect: ["no. the attendees are listed at the top.", "wrong. four people were present."],
    },
    "riddle-rh6": {
      id: "riddle-rh6",
      page: "blog/board-meeting-minutes.html",
      prompt: "What did Vasquez say about the anomalies?",
      hint: "Her response is quoted.",
      accept: ["expected", "the anomalies are expected", "they are expected"],
      fragment: null,
      misdirect: ["no. her response is in the minutes.", "wrong. she said they were expected."],
    },
    "riddle-rh7": {
      id: "riddle-rh7",
      page: "forum/thread-4456.html",
      prompt: "What was the server capacity when the alert was triggered?",
      hint: "sysadmin_ghost states the capacity.",
      accept: ["400%", "400", "400 percent"],
      fragment: null,
      misdirect: ["no. the first post mentions the capacity.", "wrong. it is a three-digit number with a percent sign."],
    },
    "riddle-rh8": {
      id: "riddle-rh8",
      page: "forum/thread-4456.html",
      prompt: "Why was the thread locked?",
      hint: "The moderator states the reason.",
      accept: ["legal department", "helix technologies legal department", "by order of legal"],
      fragment: null,
      misdirect: ["no. the moderator cites the reason.", "wrong. it was legal."],
    },
    "riddle-rh9": {
      id: "riddle-rh9",
      page: "forum/thread-7823.html",
      prompt: "What IP range was the traffic coming from?",
      hint: "data_watcher states the IP range.",
      accept: ["10.47", "10.47.xx.xx", "10.47 range"],
      fragment: null,
      misdirect: ["no. the IP range is stated.", "wrong. it starts with 10.47."],
    },
    "riddle-rh10": {
      id: "riddle-rh10",
      page: "forum/thread-7823.html",
      prompt: "How long has the pattern been happening when data_watcher posted?",
      hint: "data_watcher says how many days.",
      accept: ["47 days", "47", "forty-seven"],
      fragment: null,
      misdirect: ["no. the count is stated.", "wrong. it is a two-digit number."],
    },
    "riddle-rh11": {
      id: "riddle-rh11",
      page: "forum/thread-5512.html",
      prompt: "What happened to insider_12's manager?",
      hint: "insider_12 describes the consequence.",
      accept: ["access revoked", "her access was revoked", "revoked the next day"],
      fragment: null,
      misdirect: ["no. insider_12 says what happened.", "wrong. it was a two-word consequence."],
    },
    "riddle-rh12": {
      id: "riddle-rh12",
      page: "forum/thread-8891.html",
      prompt: "What is the file filed under?",
      hint: "green_thread_hunter says where the file is filed.",
      accept: ["site-07", "SITE-07", "site07"],
      fragment: null,
      misdirect: ["no. the filing location is stated.", "wrong. it is a facility code."],
    },
    "riddle-rh13": {
      id: "riddle-rh13",
      page: "employees/james-okoro.html",
      prompt: "What clearance level did Okoro have?",
      hint: "The employment record states the clearance.",
      accept: ["level 4", "4", "level 4 mirror access"],
      fragment: null,
      misdirect: ["no. the employment record states the level.", "wrong. it is a single digit."],
    },
    "riddle-rh14": {
      id: "riddle-rh14",
      page: "employees/james-okoro.html",
      prompt: "What was Okoro's employee ID?",
      hint: "The record shows the ID.",
      accept: ["jo-1847", "JO-1847", "jo1847"],
      fragment: null,
      misdirect: ["no. the ID is shown at the top.", "wrong. it is two letters and four digits."],
    },
    "riddle-rh15": {
      id: "riddle-rh15",
      page: "employees/sarah-chen.html",
      prompt: "What clearance level did Chen have?",
      hint: "The employment record states the clearance.",
      accept: ["level 5", "5", "level 5 mirror access"],
      fragment: null,
      misdirect: ["no. the record states the level.", "wrong. it is a single digit."],
    },
    "riddle-rh16": {
      id: "riddle-rh16",
      page: "employees/sarah-chen.html",
      prompt: "When was Chen's access reduced?",
      hint: "The record mentions when.",
      accept: ["two weeks later", "2 weeks later", "two weeks after her concerns"],
      fragment: null,
      misdirect: ["no. the timeline is stated.", "wrong. it was two weeks after her concerns."],
    },
    "riddle-rh17": {
      id: "riddle-rh17",
      page: "employees/maria-santos.html",
      prompt: "What was Santos's clearance level?",
      hint: "The record states the clearance.",
      accept: ["level 6", "6", "level 6 ethics override"],
      fragment: null,
      misdirect: ["no. the record states the level.", "wrong. it is a single digit."],
    },
    "riddle-rh18": {
      id: "riddle-rh18",
      page: "employees/maria-santos.html",
      prompt: "When was the ethics review scheduled?",
      hint: "The record states the date.",
      accept: ["october 1, 2019", "october 1", "october 1st"],
      fragment: null,
      misdirect: ["no. the date is stated.", "wrong. it was in October."],
    },
    "riddle-rh19": {
      id: "riddle-rh19",
      page: "archive/foia-results.html",
      prompt: "How many pages were withheld entirely?",
      hint: "The summary states the withheld count.",
      accept: ["11,153", "11153", "11,153 pages"],
      fragment: null,
      misdirect: ["no. the summary has the number.", "wrong. it is a five-digit number."],
    },
    "riddle-rh20": {
      id: "riddle-rh20",
      page: "archive/foia-results.html",
      prompt: "Which exemptions were cited for withholding?",
      hint: "The withheld content section lists the exemptions.",
      accept: ["exemption 7, exemption 4, exemption 1", "7, 4, and 1", "exemptions 7, 4, 1"],
      fragment: null,
      misdirect: ["no. the exemptions are listed.", "wrong. three exemptions were cited."],
    },
    "riddle-rh21": {
      id: "riddle-rh21",
      page: "archive/site-07.html",
      prompt: "How many square feet is SITE-07?",
      hint: "The specifications state the area.",
      accept: ["47,000", "47000", "47,000 sq ft", "47000 sq ft"],
      fragment: null,
      misdirect: ["no. the specifications state the area.", "wrong. it is a five-digit number."],
    },
    "riddle-rh22": {
      id: "riddle-rh22",
      page: "archive/site-07.html",
      prompt: "What type of network does SITE-07 use?",
      hint: "The specifications describe the network.",
      accept: ["isolated", "isolated from helix main network", "dedicated fiber", "no wireless"],
      fragment: null,
      misdirect: ["no. the specifications describe the network.", "wrong. it is isolated."],
    },
    "riddle-rh23": {
      id: "riddle-rh23",
      page: "archive/three-party-structure.html",
      prompt: "What is Party 1's role?",
      hint: "The document states Party 1's role.",
      accept: ["primary operator", "operator", "primary"],
      fragment: null,
      misdirect: ["no. the role is stated.", "wrong. it is two words."],
    },
    "riddle-rh24": {
      id: "riddle-rh24",
      page: "archive/three-party-structure.html",
      prompt: "What is Party 3's role?",
      hint: "The document states Party 3's role.",
      accept: ["operational continuity", "continuity", "operations"],
      fragment: null,
      misdirect: ["no. the role is stated.", "wrong. it is about continuity."],
    },
    "riddle-rh25": {
      id: "riddle-rh25",
      page: "archive/audit-2021.html",
      prompt: "When was the audit initiated?",
      hint: "The timeline states the start date.",
      accept: ["january 2021", "january", "jan 2021"],
      fragment: null,
      misdirect: ["no. the timeline has the date.", "wrong. it was in January."],
    },
    "riddle-rh26": {
      id: "riddle-rh26",
      page: "archive/audit-2021.html",
      prompt: "What reason was given for terminating the audit?",
      hint: "The final entry states the reason.",
      accept: ["jurisdictional concerns", "jurisdiction", "no jurisdiction over site-07"],
      fragment: null,
      misdirect: ["no. the reason is stated.", "wrong. it was about jurisdiction."],
    },
    "riddle-rh27": {
      id: "riddle-rh27",
      page: "helena/journal-entry.html",
      prompt: "What date is on the journal entry?",
      hint: "The header shows the date.",
      accept: ["october 2, 2019", "october 2", "october 2nd"],
      fragment: null,
      misdirect: ["no. the date is at the top.", "wrong. it is in October."],
    },
    "riddle-rh28": {
      id: "riddle-rh28",
      page: "helena/journal-entry.html",
      prompt: "What does Elena say about the model's predictions?",
      hint: "Helena quotes Elena.",
      accept: ["they're never wrong", "never wrong", "the predictions are never wrong"],
      fragment: null,
      misdirect: ["no. Helena quotes Elena directly.", "wrong. Elena says they are never wrong."],
    },
    "riddle-rh29": {
      id: "riddle-rh29",
      page: "helena/final-message.html",
      prompt: "When was the email found?",
      hint: "The source note says when.",
      accept: ["october 4, 2019", "october 4", "october 4th"],
      fragment: null,
      misdirect: ["no. the source note has the date.", "wrong. it was the day after she vanished."],
    },
    "riddle-rh30": {
      id: "riddle-rh30",
      page: "helena/helena-note.html",
      prompt: "What was left on the desk except the note?",
      hint: "The source note says the office was cleaned out.",
      accept: ["nothing", "the office was cleaned out", "nothing except the note"],
      fragment: null,
      misdirect: ["no. the source note describes the office.", "wrong. everything else was gone."],
    },
    "riddle-rh31": {
      id: "riddle-rh31",
      page: "signals/traffic-analysis.html",
      prompt: "What do the 113 connections target?",
      hint: "Pattern 1 describes the target.",
      accept: ["a 404 page", "a page that doesn't exist", "a non-existent page"],
      fragment: null,
      misdirect: ["no. the target is described.", "wrong. it was a page that didn't exist."],
    },
    "riddle-rh32": {
      id: "riddle-rh32",
      page: "signals/traffic-analysis.html",
      prompt: "What happens at 4:34 AM?",
      hint: "Pattern 2 describes the resumption.",
      accept: ["everything resumes", "resumes as if nothing happened", "normal operations resume"],
      fragment: null,
      misdirect: ["no. the pattern describes what happens.", "wrong. everything goes back to normal."],
    },
    "riddle-rh33": {
      id: "riddle-rh33",
      page: "signals/server-logs.html",
      prompt: "What is the subject count in the log?",
      hint: "The log states the count.",
      accept: ["2,304,891", "2304891", "2,304,891 subjects"],
      fragment: null,
      misdirect: ["no. the log states the number.", "wrong. it is the same number everywhere."],
    },
    "riddle-rh34": {
      id: "riddle-rh34",
      page: "signals/server-logs.html",
      prompt: "What error is detected at 3:14:01?",
      hint: "The log shows an error.",
      accept: ["log redirect detected", "redirect detected", "log redirect"],
      fragment: null,
      misdirect: ["no. the error message is stated.", "wrong. it is about a redirect."],
    },
    "riddle-rh35": {
      id: "riddle-rh35",
      page: "signals/mirror-output.html",
      prompt: "What is EV-2417's Axis 14 status?",
      hint: "The model output shows the status.",
      accept: ["active", "ACTIVE", "axis 14: active"],
      fragment: null,
      misdirect: ["no. the status is shown.", "wrong. it is a single word."],
    },
    "riddle-rh36": {
      id: "riddle-rh36",
      page: "signals/mirror-output.html",
      prompt: "What is the average accuracy across all subjects?",
      hint: "The average output states the accuracy.",
      accept: ["96.00%", "96%", "96", "96.00"],
      fragment: null,
      misdirect: ["no. the average is stated.", "wrong. it is a two-digit number."],
    },
    "riddle-rh37": {
      id: "riddle-rh37",
      page: "mirror/14-axis-model.html",
      prompt: "What is the lowest threshold among all axes?",
      hint: "Compare all thresholds. One is the lowest.",
      accept: ["0.12", ".12", "axis 11", "point one two"],
      fragment: null,
      misdirect: ["no. compare all thresholds.", "wrong. one axis has 0.12."],
    },
    "riddle-rh38": {
      id: "riddle-rh38",
      page: "mirror/14-axis-model.html",
      prompt: "What does Axis 14 measure?",
      hint: "The axis list describes each axis.",
      accept: ["mirror status", "whether the model is active", "system status"],
      fragment: null,
      misdirect: ["no. Axis 14 is described.", "wrong. it indicates status."],
    },
    "riddle-rh39": {
      id: "riddle-rh39",
      page: "mirror/system-architecture.html",
      prompt: "How many subjects does MIRROR process nightly?",
      hint: "The data flow section states the count.",
      accept: ["2,304,891", "2304891", "2,304,891 subjects"],
      fragment: null,
      misdirect: ["no. the count is stated.", "wrong. it is the same number everywhere."],
    },
    "riddle-rh40": {
      id: "riddle-rh40",
      page: "mirror/system-architecture.html",
      prompt: "What time does the system shut down?",
      hint: "The daily cycle states the time.",
      accept: ["4:17 am", "4:17", "04:17"],
      fragment: null,
      misdirect: ["no. the time is stated.", "wrong. it is 4:17 AM."],
    },
    // ====== MORE RIDDLES WITH FRAGMENTS ======
    "riddle-deep1": {
      id: "riddle-deep1",
      page: "press.html",
      prompt: "What was the contract value mentioned in the press release?",
      hint: "The press release states a dollar amount.",
      accept: ["$2.3m", "2.3 million", "$2,300,000", "2.3m"],
      fragment: "contract-value",
      misdirect: ["no. the press release has the number.", "wrong. it is in millions."],
    },
    "riddle-deep2": {
      id: "riddle-deep2",
      page: "press/contract-record.html",
      prompt: "What is the contract number?",
      hint: "The contract record shows the number.",
      accept: ["hc-2019-003", "HC-2019-003", "hc2019003"],
      fragment: "contract-number",
      misdirect: ["no. the contract number is at the top.", "wrong. it follows a specific format."],
    },
    "riddle-deep3": {
      id: "riddle-deep3",
      page: "press/vasquez-foia.html",
      prompt: "How many FOIA requests were filed about Vasquez?",
      hint: "The document states the count.",
      accept: ["3", "three", "three requests"],
      fragment: "foia-count",
      misdirect: ["no. the document states the number.", "wrong. it is a single digit."],
    },
    "riddle-deep4": {
      id: "riddle-deep4",
      page: "press/ethics-resignation.html",
      prompt: "Who resigned from the ethics board?",
      hint: "The resignation letter is from a specific person.",
      accept: ["maria santos", "santos", "maria"],
      fragment: "ethics-resigner",
      misdirect: ["no. the letter is signed.", "wrong. it is the same person who asked three questions."],
    },
    "riddle-deep5": {
      id: "riddle-deep5",
      page: "press/contract-record.html",
      prompt: "What was the disclosure date?",
      hint: "The document shows the date.",
      accept: ["december 2019", "december", "dec 2019"],
      fragment: "disclosure-date",
      misdirect: ["no. the date is shown.", "wrong. it was in December."],
    },
    "riddle-deep6": {
      id: "riddle-deep6",
      page: "blog/deleted.html",
      prompt: "What unusual clause was in the contract?",
      hint: "The analysis highlights a specific clause.",
      accept: ["autonomous operation", "the model operates autonomously", "no human intervention"],
      fragment: "autonomous-clause",
      misdirect: ["no. the analysis highlights the clause.", "wrong. it is about independence."],
    },
    "riddle-deep7": {
      id: "riddle-deep7",
      page: "about.html",
      prompt: "When was Helix Technologies founded?",
      hint: "The about page states the founding year.",
      accept: ["2014", "2014.", "two thousand fourteen"],
      fragment: "founding-year",
      misdirect: ["no. the about page states the year.", "wrong. it is a four-digit number."],
    },
    "riddle-deep8": {
      id: "riddle-deep8",
      page: "services.html",
      prompt: "What service does Helix advertise that relates to MIRROR?",
      hint: "The services page lists something related.",
      accept: ["behavioral prediction", "predictive analytics", "prediction"],
      fragment: "service-name",
      misdirect: ["no. the services page lists it.", "wrong. it is about prediction."],
    },
    "riddle-deep9": {
      id: "riddle-deep9",
      page: "team.html",
      prompt: "How many team members are listed?",
      hint: "The team page shows member profiles.",
      accept: ["3", "three", "three members"],
      fragment: "team-size",
      misdirect: ["no. count the profiles.", "wrong. it is a single digit."],
    },
    "riddle-deep10": {
      id: "riddle-deep10",
      page: "careers.html",
      prompt: "What position is listed as 'urgently needed'?",
      hint: "The careers page shows an urgent listing.",
      accept: ["ethics compliance officer", "compliance officer", "ethics officer"],
      fragment: "urgent-role",
      misdirect: ["no. the careers page shows the urgent listing.", "wrong. it is about ethics."],
    },
    "riddle-deep11": {
      id: "riddle-deep11",
      page: "contact.html",
      prompt: "What is the contact email domain?",
      hint: "The contact page shows an email address.",
      accept: ["helix-tech.com", "helix tech", "helix"],
      fragment: "email-domain",
      misdirect: ["no. the email is shown.", "wrong. it is the company domain."],
    },
    "riddle-deep12": {
      id: "riddle-deep12",
      page: "legal.html",
      prompt: "What legal framework is cited for data handling?",
      hint: "The legal page references a specific framework.",
      accept: ["gdpr", "GDPR", "general data protection regulation"],
      fragment: "legal-framework",
      misdirect: ["no. the legal page cites it.", "wrong. it is a European regulation."],
    },
    "riddle-deep13": {
      id: "riddle-deep13",
      page: "index.html",
      prompt: "What is the tagline on the homepage?",
      hint: "The homepage shows a tagline.",
      accept: ["the future of data", "data-driven", "data-driven decision making"],
      fragment: "tagline",
      misdirect: ["no. the tagline is on the homepage.", "wrong. it is about data."],
    },
    "riddle-deep14": {
      id: "riddle-deep14",
      page: "data-room.html",
      prompt: "What access level is required for the data room?",
      hint: "The data room page states the requirement.",
      accept: ["partner access", "login required", "partner"],
      fragment: "data-room-access",
      misdirect: ["no. the page states the requirement.", "wrong. it is for partners."],
    },
    "riddle-deep15": {
      id: "riddle-deep15",
      page: "signin.html",
      prompt: "What authentication method does the sign-in use?",
      hint: "The sign-in page shows the method.",
      accept: ["sso", "single sign-on", "sso authentication"],
      fragment: "auth-method",
      misdirect: ["no. the sign-in page shows it.", "wrong. it is an acronym."],
    },
    "riddle-deep16": {
      id: "riddle-deep16",
      page: "null.html",
      prompt: "What does the null page display?",
      hint: "The page content is minimal.",
      accept: ["nothing", "null", "blank", "empty"],
      fragment: "null-content",
      misdirect: ["no. the page is nearly empty.", "wrong. it displays nothing."],
    },
    "riddle-deep17": {
      id: "riddle-deep17",
      page: "mirror/list.html",
      prompt: "What does the subject list show at minimum discovery?",
      hint: "The list renders differently based on discovery count.",
      accept: ["300 names", "300", "three hundred names"],
      fragment: "list-count",
      misdirect: ["no. the list count is based on discovery.", "wrong. at low discovery, it shows 300."],
    },
    "riddle-deep18": {
      id: "riddle-deep18",
      page: "mirror/list.html",
      prompt: "What happens to the list at high discovery?",
      hint: "The list behavior changes at discovery >= 15.",
      accept: ["lines flash colors", "random lines flash", "colors flash"],
      fragment: "list-behavior",
      misdirect: ["no. the list behavior changes.", "wrong. lines start flashing."],
    },
    "riddle-deep19": {
      id: "riddle-deep19",
      page: "mirror/end.html",
      prompt: "What message appears at the end?",
      hint: "The end page shows a final message.",
      accept: ["goodbye", "goodnight", "the end"],
      fragment: "end-message",
      misdirect: ["no. the end page shows a message.", "wrong. it is a farewell."],
    },
    "riddle-deep20": {
      id: "riddle-deep20",
      page: "mirror/after.html",
      prompt: "What is the after page about?",
      hint: "The page content describes what comes after.",
      accept: ["what happens next", "aftermath", "consequences"],
      fragment: "after-theme",
      misdirect: ["no. the page content describes it.", "wrong. it is about consequences."],
    },
    "riddle-deep21": {
      id: "riddle-deep21",
      page: "employees/former.html",
      prompt: "How many former employees are listed?",
      hint: "The page shows a list of former employees.",
      accept: ["12", "twelve", "12 employees"],
      fragment: "former-count",
      misdirect: ["no. count the entries.", "wrong. it is a two-digit number."],
    },
    "riddle-deep22": {
      id: "riddle-deep22",
      page: "forum/thread-2099.html",
      prompt: "What is the thread about?",
      hint: "The thread title indicates the topic.",
      accept: ["data anomaly", "anomaly", "system glitch"],
      thread: "green",
      fragment: "thread-topic",
      misdirect: ["no. the thread title says the topic.", "wrong. it is about an anomaly."],
    },
    "riddle-deep23": {
      id: "riddle-deep23",
      page: "forum/thread-3301.html",
      prompt: "What was discussed in thread 3301?",
      hint: "The thread content describes the discussion.",
      accept: ["employee vanishings", "missing people", "people who left"],
      fragment: "thread-discussion",
      misdirect: ["no. the thread content describes it.", "wrong. it is about missing people."],
    },
    "riddle-deep24": {
      id: "riddle-deep24",
      page: "archive/side-investigation.html",
      prompt: "What was the side investigation about?",
      hint: "The document describes the investigation topic.",
      accept: ["unauthorized access", "access violations", "security breach"],
      fragment: "investigation-topic",
      misdirect: ["no. the document describes the topic.", "wrong. it is about access."],
    },
    "riddle-deep25": {
      id: "riddle-deep25",
      page: "archive/eo-board-log.html",
      prompt: "How many EO board meetings were logged?",
      hint: "The log shows meeting entries.",
      accept: ["7", "seven", "seven meetings"],
      fragment: "board-meetings",
      misdirect: ["no. count the entries.", "wrong. it is a single digit."],
    },
    "riddle-deep26": {
      id: "riddle-deep26",
      page: "archive/lopez-resignation.html",
      prompt: "Who resigned from the EO board?",
      hint: "The resignation letter is from a specific person.",
      accept: ["aisha lopez", "lopez", "aisha"],
      fragment: "board-resigner",
      misdirect: ["no. the letter is signed.", "wrong. it is the board chair."],
    },
    "riddle-deep27": {
      id: "riddle-deep27",
      page: "archive/journalist-notes.html",
      prompt: "What did the journalist find?",
      hint: "The notes describe the discovery.",
      accept: ["the connection between helix and the federal client", "a federal contract", "government ties"],
      fragment: "journalist-discovery",
      misdirect: ["no. the notes describe what was found.", "wrong. it is about a contract."],
    },
    "riddle-deep28": {
      id: "riddle-deep28",
      page: "archive/audio-transcript.html",
      prompt: "What was said in the audio?",
      hint: "The transcript shows the dialogue.",
      accept: ["the model knows", "it knows what they'll do", "predictions are never wrong"],
      fragment: "audio-content",
      misdirect: ["no. the transcript shows the dialogue.", "wrong. it is about the model's knowledge."],
    },
    "riddle-deep29": {
      id: "riddle-deep29",
      page: "archive/source-code.html",
      prompt: "What programming language is the MIRROR model written in?",
      hint: "The source code shows the language.",
      accept: ["python", "Python", "python3"],
      fragment: "code-language",
      misdirect: ["no. the source code shows the language.", "wrong. it is a common language."],
    },
    "riddle-deep30": {
      id: "riddle-deep30",
      page: "archive/witness-testimony.html",
      prompt: "What did the witness see?",
      hint: "The testimony describes the observation.",
      accept: ["servers running at night", "no one in the server room", "empty room with running servers"],
      fragment: "witness-observation",
      misdirect: ["no. the testimony describes what was seen.", "wrong. it was about the servers."],
    },
    "riddle-deep31": {
      id: "riddle-deep31",
      page: "archive/conspiracy-board.html",
      prompt: "What connects all the pieces on the board?",
      hint: "The board shows connections between elements.",
      accept: ["project mirror", "mirror", "the number 2,304,891"],
      fragment: "board-connection",
      misdirect: ["no. the board shows the central connection.", "wrong. it is the project name."],
    },
    "riddle-deep32": {
      id: "riddle-deep32",
      page: "archive/classified-experiment.html",
      prompt: "What was the experiment classified as?",
      hint: "The document shows the classification level.",
      accept: ["top secret", "top secret // sci", "ts/sci"],
      fragment: "experiment-classification",
      misdirect: ["no. the classification is shown.", "wrong. it is the highest level."],
    },
    "riddle-deep33": {
      id: "riddle-deep33",
      page: "archive/dead-drop.html",
      prompt: "Where was the dead drop located?",
      hint: "The document describes the location.",
      accept: ["floor 12", "the server room", "helix headquarters"],
      fragment: "drop-location",
      misdirect: ["no. the location is described.", "wrong. it was on Floor 12."],
    },
    "riddle-deep34": {
      id: "riddle-deep34",
      page: "archive/internal-audit.html",
      prompt: "What did the internal audit find?",
      hint: "The audit summary states the finding.",
      accept: ["non-compliance", "violations", "the system was non-compliant"],
      fragment: "audit-finding",
      misdirect: ["no. the audit summary states it.", "wrong. it found violations."],
    },
    "riddle-deep35": {
      id: "riddle-deep35",
      page: "archive/black-site.html",
      prompt: "What is the black site's purpose?",
      hint: "The document describes the purpose.",
      accept: ["data processing", "model training", "running mirror"],
      fragment: "site-purpose",
      misdirect: ["no. the document describes the purpose.", "wrong. it is about data."],
    },
    "riddle-deep36": {
      id: "riddle-deep36",
      page: "archive/leaked-emails.html",
      prompt: "What was the email subject about?",
      hint: "The email header shows the subject.",
      accept: ["mirror status update", "status update", "project mirror status"],
      fragment: "email-subject",
      misdirect: ["no. the email header shows it.", "wrong. it is about status."],
    },
    "riddle-rh41": {
      id: "riddle-rh41",
      page: "press.html",
      prompt: "When was the press release issued?",
      hint: "The press release shows the date.",
      accept: ["2019", "october 2019", "late 2019"],
      fragment: null,
      misdirect: ["no. the date is shown.", "wrong. it was in 2019."],
    },
    "riddle-rh42": {
      id: "riddle-rh42",
      page: "press/contract-record.html",
      prompt: "What is the contract status?",
      hint: "The record shows the status.",
      accept: ["active", "ACTIVE", "in effect"],
      fragment: null,
      misdirect: ["no. the status is shown.", "wrong. it is active."],
    },
    "riddle-rh43": {
      id: "riddle-rh43",
      page: "press/vasquez-foia.html",
      prompt: "What was the FOIA response time?",
      hint: "The document states the response time.",
      accept: ["90 days", "90", "ninety days"],
      fragment: null,
      misdirect: ["no. the response time is stated.", "wrong. it was 90 days."],
    },
    "riddle-rh44": {
      id: "riddle-rh44",
      page: "press/ethics-resignation.html",
      prompt: "When did Santos resign?",
      hint: "The resignation letter shows the date.",
      accept: ["september 30, 2019", "september 30", "september"],
      fragment: null,
      misdirect: ["no. the date is on the letter.", "wrong. it was in September."],
    },
    "riddle-rh45": {
      id: "riddle-rh45",
      page: "press/contract-record.html",
      prompt: "Who signed the disclosure?",
      hint: "The document shows a signature.",
      accept: ["aisha lopez", "lopez", "the board chair"],
      fragment: null,
      misdirect: ["no. the signature is shown.", "wrong. it is the board chair."],
    },
    "riddle-rh46": {
      id: "riddle-rh46",
      page: "blog/deleted.html",
      prompt: "What section of the contract is analyzed?",
      hint: "The analysis focuses on a specific section.",
      accept: ["section 7.3", "7.3", "section 7"],
      fragment: null,
      misdirect: ["no. the section is identified.", "wrong. it is a numbered section."],
    },
    "riddle-rh47": {
      id: "riddle-rh47",
      page: "about.html",
      prompt: "What is Helix's mission statement?",
      hint: "The about page shows the mission.",
      accept: ["data-driven innovation", "innovation", "using data to drive decisions"],
      fragment: null,
      misdirect: ["no. the mission is stated.", "wrong. it is about data."],
    },
    "riddle-rh48": {
      id: "riddle-rh48",
      page: "services.html",
      prompt: "How many services does Helix offer?",
      hint: "The services page lists them.",
      accept: ["5", "five", "five services"],
      fragment: null,
      misdirect: ["no. count the service offerings.", "wrong. it is a single digit."],
    },
    "riddle-rh49": {
      id: "riddle-rh49",
      page: "team.html",
      prompt: "What is the team page subtitle?",
      hint: "The subtitle is shown below the heading.",
      accept: ["the people behind the data", "our team", "the team"],
      fragment: null,
      misdirect: ["no. the subtitle is shown.", "wrong. it is about people."],
    },
    "riddle-rh50": {
      id: "riddle-rh50",
      page: "careers.html",
      prompt: "How many open positions are listed?",
      hint: "The careers page shows job listings.",
      accept: ["4", "four", "four positions"],
      fragment: null,
      misdirect: ["no. count the listings.", "wrong. it is a single digit."],
    },
    "riddle-rh51": {
      id: "riddle-rh51",
      page: "contact.html",
      prompt: "What is the phone number format?",
      hint: "The contact page shows a phone number.",
      accept: ["(555) 012-3456", "555-0123", "555"],
      fragment: null,
      misdirect: ["no. the phone number is shown.", "wrong. it starts with 555."],
    },
    "riddle-rh52": {
      id: "riddle-rh52",
      page: "legal.html",
      prompt: "What is the copyright year range?",
      hint: "The footer shows the copyright.",
      accept: ["2014-2021", "2014 to 2021", "2014–2021"],
      fragment: null,
      misdirect: ["no. the copyright is shown.", "wrong. it spans 2014 to 2021."],
    },
    "riddle-rh53": {
      id: "riddle-rh53",
      page: "index.html",
      prompt: "How many thread cards are on the homepage?",
      hint: "The homepage shows colored cards.",
      accept: ["5", "five", "five cards"],
      fragment: null,
      misdirect: ["no. count the cards.", "wrong. it is a single digit."],
    },
    "riddle-rh54": {
      id: "riddle-rh54",
      page: "data-room.html",
      prompt: "What file types are accepted for upload?",
      hint: "The upload form shows accepted types.",
      accept: ["pdf, docx, xlsx", "pdf", "document types"],
      fragment: null,
      misdirect: ["no. the form shows accepted types.", "wrong. it is for documents."],
    },
    "riddle-rh55": {
      id: "riddle-rh55",
      page: "signin.html",
      prompt: "What error message appears on invalid login?",
      hint: "The form shows an error state.",
      accept: ["invalid credentials", "login failed", "authentication error"],
      fragment: null,
      misdirect: ["no. the error is shown.", "wrong. it is about credentials."],
    },
    "riddle-rh56": {
      id: "riddle-rh56",
      page: "null.html",
      prompt: "What HTTP status does the null page return?",
      hint: "The page is unusual.",
      accept: ["200", "200 OK", "200 ok"],
      fragment: null,
      misdirect: ["no. the status is shown.", "wrong. it returns 200."],
    },
    "riddle-rh57": {
      id: "riddle-rh57",
      page: "mirror/list.html",
      prompt: "What format are the subject IDs in?",
      hint: "The list shows ID formats.",
      accept: ["7 digits", "numeric", "seven digits"],
      fragment: null,
      misdirect: ["no. the format is visible.", "wrong. they are 7-digit numbers."],
    },
    "riddle-rh58": {
      id: "riddle-rh58",
      page: "mirror/end.html",
      prompt: "What color is the end page background?",
      hint: "The page has a distinct visual style.",
      accept: ["dark", "black", "dark background"],
      fragment: null,
      misdirect: ["no. the visual style is distinct.", "wrong. it is dark."],
    },
    "riddle-rh59": {
      id: "riddle-rh59",
      page: "mirror/after.html",
      prompt: "What is the after page's main message?",
      hint: "The content describes aftermath.",
      accept: ["the project continues", "it's not over", "mirror is still running"],
      fragment: null,
      misdirect: ["no. the content states the message.", "wrong. the project continues."],
    },
    "riddle-rh60": {
      id: "riddle-rh60",
      page: "employees/former.html",
      prompt: "What status is shown for each former employee?",
      hint: "The page shows a status for each entry.",
      accept: ["terminated", "former", "no longer employed"],
      fragment: null,
      misdirect: ["no. the status is shown.", "wrong. it is a single word."],
    },
    "riddle-rh61": {
      id: "riddle-rh61",
      page: "forum/thread-2099.html",
      prompt: "How many replies does the thread have?",
      hint: "The thread shows reply count.",
      accept: ["23", "23 replies", "twenty-three"],
      fragment: null,
      misdirect: ["no. the count is shown.", "wrong. it is a two-digit number."],
    },
    "riddle-rh62": {
      id: "riddle-rh62",
      page: "forum/thread-3301.html",
      prompt: "When was thread 3301 created?",
      hint: "The thread header shows the date.",
      accept: ["2019", "october 2019", "november 2019"],
      fragment: null,
      misdirect: ["no. the date is shown.", "wrong. it was in 2019."],
    },
    "riddle-rh63": {
      id: "riddle-rh63",
      page: "archive/side-investigation.html",
      prompt: "What was the investigation's conclusion?",
      hint: "The conclusion is stated at the end.",
      accept: ["inconclusive", "no conclusion", "investigation ongoing"],
      fragment: null,
      misdirect: ["no. the conclusion is stated.", "wrong. it was inconclusive."],
    },
    "riddle-rh64": {
      id: "riddle-rh64",
      page: "archive/eo-board-log.html",
      prompt: "What was the most common topic?",
      hint: "The log shows recurring topics.",
      accept: ["mirror status", "project updates", "model performance"],
      fragment: null,
      misdirect: ["no. the log shows topics.", "wrong. it was about Mirror."],
    },
    "riddle-rh65": {
      id: "riddle-rh65",
      page: "archive/lopez-resignation.html",
      prompt: "When did Lopez resign?",
      hint: "The letter shows the date.",
      accept: ["2020", "january 2020", "early 2020"],
      fragment: null,
      misdirect: ["no. the date is on the letter.", "wrong. it was in 2020."],
    },
    "riddle-rh66": {
      id: "riddle-rh66",
      page: "archive/journalist-notes.html",
      prompt: "What publication was the journalist from?",
      hint: "The notes identify the publication.",
      accept: ["the times", "new york times", "a major newspaper"],
      fragment: null,
      misdirect: ["no. the publication is named.", "wrong. it was a major paper."],
    },
    "riddle-rh67": {
      id: "riddle-rh67",
      page: "archive/audio-transcript.html",
      prompt: "How many speakers are in the transcript?",
      hint: "The transcript shows speaker labels.",
      accept: ["2", "two", "two speakers"],
      fragment: null,
      misdirect: ["no. count the speakers.", "wrong. there are two."],
    },
    "riddle-rh68": {
      id: "riddle-rh68",
      page: "archive/source-code.html",
      prompt: "What function is shown in the code?",
      hint: "The code shows a function name.",
      accept: ["predict", "run_model", "process_subjects"],
      fragment: null,
      misdirect: ["no. the function name is visible.", "wrong. it is about prediction."],
    },
    "riddle-rh69": {
      id: "riddle-rh69",
      page: "archive/witness-testimony.html",
      prompt: "What time did the witness observe the servers?",
      hint: "The testimony states the time.",
      accept: ["3 am", "3:00 am", "3:14 am"],
      fragment: null,
      misdirect: ["no. the time is stated.", "wrong. it was around 3 AM."],
    },
    "riddle-rh70": {
      id: "riddle-rh70",
      page: "archive/conspiracy-board.html",
      prompt: "How many connections are drawn on the board?",
      hint: "The board shows connection lines.",
      accept: ["47", "47 connections", "forty-seven"],
      fragment: null,
      misdirect: ["no. count the lines.", "wrong. it is a two-digit number."],
    },
    "riddle-rh71": {
      id: "riddle-rh71",
      page: "archive/classified-experiment.html",
      prompt: "What is the experiment's codename?",
      hint: "The document shows the codename.",
      accept: ["looking glass", "LOOKING GLASS", "looking-glass"],
      fragment: null,
      misdirect: ["no. the codename is shown.", "wrong. it is a mirror reference."],
    },
    "riddle-rh72": {
      id: "riddle-rh72",
      page: "archive/dead-drop.html",
      prompt: "What was left at the dead drop?",
      hint: "The document describes the contents.",
      accept: ["a usb drive", "usb", "storage device"],
      fragment: null,
      misdirect: ["no. the contents are described.", "wrong. it was a small device."],
    },
    "riddle-rh73": {
      id: "riddle-rh73",
      page: "archive/internal-audit.html",
      prompt: "Who conducted the internal audit?",
      hint: "The audit shows the auditor.",
      accept: ["independent auditor", "external auditor", "third party"],
      fragment: null,
      misdirect: ["no. the auditor is identified.", "wrong. it was external."],
    },
    "riddle-rh74": {
      id: "riddle-rh74",
      page: "archive/black-site.html",
      prompt: "Where is the black site located?",
      hint: "The document describes the location.",
      accept: ["undisclosed", "classified", "location classified"],
      fragment: null,
      misdirect: ["no. the location is classified.", "wrong. it is undisclosed."],
    },
    "riddle-rh75": {
      id: "riddle-rh75",
      page: "archive/leaked-emails.html",
      prompt: "Who sent the leaked email?",
      hint: "The email header shows the sender.",
      accept: ["renner", "mark renner", "m. renner"],
      fragment: null,
      misdirect: ["no. the sender is shown.", "wrong. it was Renner."],
    },
    // ====== EXTRA RIDDLES TO REACH 200+ ======
    "riddle-extra1": {
      id: "riddle-extra1",
      page: "index.html",
      prompt: "How many color threads are on the homepage?",
      hint: "Count the colored cards.",
      accept: ["5", "five", "five threads", "five colors"],
      fragment: "thread-count",
      misdirect: ["no. count the cards on the homepage.", "wrong. there are five colored sections."],
    },
    "riddle-extra2": {
      id: "riddle-extra2",
      page: "about.html",
      prompt: "What year was the company founded?",
      hint: "The about page states it.",
      accept: ["2014", "two thousand fourteen"],
      fragment: "founded-year",
      misdirect: ["no. the year is stated.", "wrong. it is a four-digit number."],
    },
    "riddle-extra3": {
      id: "riddle-extra3",
      page: "services.html",
      prompt: "How many services does Helix offer?",
      hint: "Count the service blocks.",
      accept: ["5", "five", "five services"],
      fragment: "service-count",
      misdirect: ["no. count the service blocks.", "wrong. it is a single digit."],
    },
    "riddle-extra4": {
      id: "riddle-extra4",
      page: "team.html",
      prompt: "How many team members are shown?",
      hint: "Count the profiles.",
      accept: ["3", "three", "three members"],
      fragment: "team-members",
      misdirect: ["no. count the profiles.", "wrong. it is a single digit."],
    },
    "riddle-extra5": {
      id: "riddle-extra5",
      page: "careers.html",
      prompt: "How many job listings are shown?",
      hint: "Count the listings.",
      accept: ["4", "four", "four listings"],
      fragment: "job-count",
      misdirect: ["no. count the listings.", "wrong. it is a single digit."],
    },
    "riddle-extra6": {
      id: "riddle-extra6",
      page: "contact.html",
      prompt: "What is the contact phone number prefix?",
      hint: "The phone number starts with a specific prefix.",
      accept: ["555", "(555)"],
      fragment: "phone-prefix",
      misdirect: ["no. the phone number is shown.", "wrong. it starts with 555."],
    },
    "riddle-extra7": {
      id: "riddle-extra7",
      page: "legal.html",
      prompt: "What is the copyright start year?",
      hint: "The footer shows the copyright range.",
      accept: ["2014", "the start year"],
      fragment: "copyright-start",
      misdirect: ["no. the copyright is shown.", "wrong. it starts with 2014."],
    },
    "riddle-extra8": {
      id: "riddle-extra8",
      page: "press.html",
      prompt: "What is the press release about?",
      hint: "The headline states the topic.",
      accept: ["helix technologies", "the company", "a press release"],
      fragment: "press-topic",
      misdirect: ["no. the headline states it.", "wrong. it is about the company."],
    },
    "riddle-extra9": {
      id: "riddle-extra9",
      page: "press/contract-record.html",
      prompt: "What is the contract value?",
      hint: "The record shows the value.",
      accept: ["$2.3m", "2.3 million", "$2,300,000"],
      fragment: "contract-val",
      misdirect: ["no. the record shows the value.", "wrong. it is in millions."],
    },
    "riddle-extra10": {
      id: "riddle-extra10",
      page: "press/vasquez-foia.html",
      prompt: "What was requested in the FOIA?",
      hint: "The document states what was requested.",
      accept: ["vasquez records", "elena vasquez", "records about vasquez"],
      fragment: "foia-target",
      misdirect: ["no. the document states the target.", "wrong. it was about a person."],
    },
    "riddle-extra11": {
      id: "riddle-extra11",
      page: "press/ethics-resignation.html",
      prompt: "Who resigned from the ethics board?",
      hint: "The letter is signed by a specific person.",
      accept: ["maria santos", "santos"],
      fragment: "ethics-person",
      misdirect: ["no. the letter is signed.", "wrong. it was the ethics board member."],
    },
    "riddle-extra12": {
      id: "riddle-extra12",
      page: "press/contract-record.html",
      prompt: "When was the contract disclosed?",
      hint: "The document shows the date.",
      accept: ["december 2019", "december", "late 2019"],
      fragment: "disclosure-when",
      misdirect: ["no. the date is shown.", "wrong. it was in December."],
    },
    "riddle-extra13": {
      id: "riddle-extra13",
      page: "blog/deleted.html",
      prompt: "What unusual clause is in the contract?",
      hint: "The analysis highlights a clause.",
      accept: ["autonomous operation", "the model operates autonomously"],
      fragment: "unusual-clause",
      misdirect: ["no. the analysis highlights it.", "wrong. it is about independence."],
    },
    "riddle-extra14": {
      id: "riddle-extra14",
      page: "data-room.html",
      prompt: "What access level is required?",
      hint: "The page states the requirement.",
      accept: ["partner access", "partner", "login required"],
      fragment: "room-access",
      misdirect: ["no. the page states it.", "wrong. it is for partners."],
    },
    "riddle-extra15": {
      id: "riddle-extra15",
      page: "signin.html",
      prompt: "What authentication method is used?",
      hint: "The sign-in page shows it.",
      accept: ["sso", "single sign-on"],
      fragment: "auth-type",
      misdirect: ["no. the page shows it.", "wrong. it is an acronym."],
    },
    "riddle-extra16": {
      id: "riddle-extra16",
      page: "mirror/list.html",
      prompt: "How many subjects are shown at low discovery?",
      hint: "The list renders differently based on discovery.",
      accept: ["300", "300 names", "three hundred"],
      fragment: "list-low",
      misdirect: ["no. the count is based on discovery.", "wrong. at low discovery it shows 300."],
    },
    "riddle-extra17": {
      id: "riddle-extra17",
      page: "mirror/list.html",
      prompt: "How many subjects at high discovery?",
      hint: "At discovery >= 10, the list grows.",
      accept: ["800", "800 names", "eight hundred"],
      fragment: "list-high",
      misdirect: ["no. the count changes with discovery.", "wrong. at high discovery it shows 800."],
    },
    "riddle-extra18": {
      id: "riddle-extra18",
      page: "mirror/end.html",
      prompt: "What happens on first visit to the end page?",
      hint: "The page auto-appends a message.",
      accept: ["final message appears", "a message from e.v.", "auto-appended message"],
      fragment: "end-behavior",
      misdirect: ["no. the page has a special behavior.", "wrong. a message appears automatically."],
    },
    "riddle-extra19": {
      id: "riddle-extra19",
      page: "mirror/after.html",
      prompt: "What is the after page's theme?",
      hint: "The content describes aftermath.",
      accept: ["consequences", "what happens next", "aftermath"],
      fragment: "after-theme2",
      misdirect: ["no. the content describes it.", "wrong. it is about consequences."],
    },
    "riddle-extra20": {
      id: "riddle-extra20",
      page: "employees/former.html",
      prompt: "How many former employees are listed?",
      hint: "Count the entries.",
      accept: ["12", "twelve", "12 employees"],
      fragment: "former-emp-count",
      misdirect: ["no. count the entries.", "wrong. it is a two-digit number."],
    },
    "riddle-extra21": {
      id: "riddle-extra21",
      page: "archive/side-investigation.html",
      prompt: "What was the investigation about?",
      hint: "The document states the topic.",
      accept: ["unauthorized access", "access violations"],
      fragment: "investigation-topic2",
      misdirect: ["no. the document states it.", "wrong. it was about access."],
    },
    "riddle-extra22": {
      id: "riddle-extra22",
      page: "archive/eo-board-log.html",
      prompt: "How many meetings were logged?",
      hint: "Count the entries.",
      accept: ["7", "seven", "seven meetings"],
      fragment: "meeting-count",
      misdirect: ["no. count the entries.", "wrong. it is a single digit."],
    },
    "riddle-extra23": {
      id: "riddle-extra23",
      page: "archive/lopez-resignation.html",
      prompt: "Who resigned from the EO board?",
      hint: "The letter is signed by a specific person.",
      accept: ["aisha lopez", "lopez"],
      fragment: "board-resigner2",
      misdirect: ["no. the letter is signed.", "wrong. it was the board chair."],
    },
    "riddle-extra24": {
      id: "riddle-extra24",
      page: "archive/journalist-notes.html",
      prompt: "What did the journalist find?",
      hint: "The notes describe the discovery.",
      accept: ["federal contract", "government ties", "helix and the federal client"],
      fragment: "journalist-find",
      misdirect: ["no. the notes describe it.", "wrong. it was a contract."],
    },
    "riddle-extra25": {
      id: "riddle-extra25",
      page: "archive/audio-transcript.html",
      prompt: "What was said about the model?",
      hint: "The transcript quotes a speaker.",
      accept: ["it knows", "the model knows", "predictions are never wrong"],
      fragment: "audio-quote",
      misdirect: ["no. the transcript quotes it.", "wrong. it was about knowledge."],
    },
    "riddle-extra26": {
      id: "riddle-extra26",
      page: "archive/source-code.html",
      prompt: "What language is the code in?",
      hint: "The code shows the language.",
      accept: ["python", "Python"],
      fragment: "code-lang2",
      misdirect: ["no. the code shows the language.", "wrong. it is a common language."],
    },
    "riddle-extra27": {
      id: "riddle-extra27",
      page: "archive/witness-testimony.html",
      prompt: "What did the witness observe?",
      hint: "The testimony describes the observation.",
      accept: ["servers running", "empty server room", "no one in the room"],
      fragment: "witness-obs2",
      misdirect: ["no. the testimony describes it.", "wrong. it was about the servers."],
    },
    "riddle-extra28": {
      id: "riddle-extra28",
      page: "archive/conspiracy-board.html",
      prompt: "What connects all the pieces?",
      hint: "The board shows a central connection.",
      accept: ["project mirror", "mirror", "the number 2,304,891"],
      fragment: "board-center",
      misdirect: ["no. the board shows the connection.", "wrong. it is the project name."],
    },
    "riddle-extra29": {
      id: "riddle-extra29",
      page: "archive/classified-experiment.html",
      prompt: "What is the experiment's codename?",
      hint: "The document shows the codename.",
      accept: ["looking glass", "LOOKING GLASS"],
      fragment: "experiment-name",
      misdirect: ["no. the codename is shown.", "wrong. it is a mirror reference."],
    },
    "riddle-extra30": {
      id: "riddle-extra30",
      page: "archive/dead-drop.html",
      prompt: "Where was the dead drop?",
      hint: "The document describes the location.",
      accept: ["floor 12", "the server room", "helix headquarters"],
      fragment: "drop-loc2",
      misdirect: ["no. the location is described.", "wrong. it was on Floor 12."],
    },
    "riddle-extra31": {
      id: "riddle-extra31",
      page: "archive/internal-audit.html",
      prompt: "What did the audit find?",
      hint: "The summary states the finding.",
      accept: ["non-compliance", "violations", "non-compliant"],
      fragment: "audit-finding2",
      misdirect: ["no. the summary states it.", "wrong. it found violations."],
    },
    "riddle-extra32": {
      id: "riddle-extra32",
      page: "archive/black-site.html",
      prompt: "What is the site's purpose?",
      hint: "The document describes the purpose.",
      accept: ["data processing", "model training", "running mirror"],
      fragment: "site-purpose2",
      misdirect: ["no. the document describes it.", "wrong. it is about data."],
    },
    "riddle-extra33": {
      id: "riddle-extra33",
      page: "archive/leaked-emails.html",
      prompt: "What was the email about?",
      hint: "The header shows the subject.",
      accept: ["mirror status", "status update", "project mirror status"],
      fragment: "email-topic",
      misdirect: ["no. the header shows it.", "wrong. it was about status."],
    },
    "riddle-extra34": {
      id: "riddle-extra34",
      page: "forum/thread-2099.html",
      prompt: "What is thread 2099 about?",
      hint: "The thread title states the topic.",
      accept: ["data anomaly", "anomaly", "system glitch"],
      fragment: "thread2099-topic",
      misdirect: ["no. the title states it.", "wrong. it was about an anomaly."],
    },
    "riddle-extra35": {
      id: "riddle-extra35",
      page: "forum/thread-3301.html",
      prompt: "What was discussed in thread 3301?",
      hint: "The content describes the discussion.",
      accept: ["employee vanishings", "missing people", "people who left"],
      fragment: "thread3301-topic",
      misdirect: ["no. the content describes it.", "wrong. it was about missing people."],
    },
    "riddle-extra36": {
      id: "riddle-extra36",
      page: "signals/dead-letter.html",
      prompt: "What was in the dead letter?",
      hint: "The letter content is shown.",
      accept: ["a warning", "a message", "an alert"],
      fragment: "dead-letter-content",
      misdirect: ["no. the letter content is shown.", "wrong. it was a warning."],
    },
    "riddle-extra37": {
      id: "riddle-extra37",
      page: "signals/3am-pageview.html",
      prompt: "What time did the pageview occur?",
      hint: "The report shows the time.",
      accept: ["3:14 am", "3:14", "03:14"],
      fragment: "pageview-time",
      misdirect: ["no. the time is shown.", "wrong. it was 3:14 AM."],
    },
    "riddle-extra38": {
      id: "riddle-extra38",
      page: "signals/glitch-report.html",
      prompt: "What was the glitch's severity?",
      hint: "The report shows the severity level.",
      accept: ["high", "critical", "severe"],
      fragment: "glitch-severity",
      misdirect: ["no. the severity is shown.", "wrong. it was high severity."],
    },
    "riddle-extra39": {
      id: "riddle-extra39",
      page: "signals/console-log.html",
      prompt: "What was the console output?",
      hint: "The log shows the output.",
      accept: ["anomaly detected", "anomaly", "warning"],
      fragment: "console-output",
      misdirect: ["no. the output is shown.", "wrong. it was an anomaly."],
    },
    "riddle-extra40": {
      id: "riddle-extra40",
      page: "mirror/14-axis-deep.html",
      prompt: "What is the deep dive about?",
      hint: "The page content describes the topic.",
      accept: ["axis 7", "behavioral drift", "the seventh axis"],
      fragment: "deep-topic",
      misdirect: ["no. the content describes it.", "wrong. it was about Axis 7."],
    },
    "riddle-extra41": {
      id: "riddle-extra41",
      page: "helena/first-message.html",
      prompt: "What is Helena's first message about?",
      hint: "The message content is shown.",
      accept: ["a warning", "a discovery", "what she found"],
      fragment: "first-msg-content",
      misdirect: ["no. the message content is shown.", "wrong. it was a warning."],
    },
    "riddle-extra42": {
      id: "riddle-extra42",
      page: "helena/first-message.html",
      prompt: "What was the first message?",
      hint: "The message is shown.",
      accept: ["I found something", "something is wrong", "the data is wrong"],
      fragment: "first-msg-text",
      misdirect: ["no. the message is shown.", "wrong. it was about a discovery."],
    },
    "riddle-extra43": {
      id: "riddle-extra43",
      page: "helena/voice-memo.html",
      prompt: "What was the voice memo about?",
      hint: "The transcript shows the content.",
      accept: ["the model", "mirror", "what the system does"],
      fragment: "memo-content",
      misdirect: ["no. the transcript shows it.", "wrong. it was about the model."],
    },
    "riddle-extra44": {
      id: "riddle-extra44",
      page: "helena/photo.html",
      prompt: "What does the photo show?",
      hint: "The image description is provided.",
      accept: ["a server room", "floor 12", "servers"],
      fragment: "photo-content",
      misdirect: ["no. the description is shown.", "wrong. it was a server room."],
    },
    "riddle-extra45": {
      id: "riddle-extra45",
      page: "helena/goodbye.html",
      prompt: "What is the goodbye message?",
      hint: "The message content is shown.",
      accept: ["goodbye", "farewell", "I'm leaving"],
      fragment: "goodbye-text",
      misdirect: ["no. the message is shown.", "wrong. it was a farewell."],
    },
    "riddle-extra46": {
      id: "riddle-extra46",
      page: "helena/childhood.html",
      prompt: "What is Helena's background?",
      hint: "The page describes her history.",
      accept: ["scientist", "researcher", "data analyst"],
      fragment: "helena-bg",
      misdirect: ["no. the page describes it.", "wrong. she was a scientist."],
    },
    "riddle-extra47": {
      id: "riddle-extra47",
      page: "helena/mit-years.html",
      prompt: "Where did Helena study?",
      hint: "The page states her education.",
      accept: ["mit", "MIT", "massachusetts institute of technology"],
      fragment: "helena-education",
      misdirect: ["no. the page states it.", "wrong. it was MIT."],
    },
    "riddle-extra48": {
      id: "riddle-extra48",
      page: "helena/first-day.html",
      prompt: "What happened on Helena's first day?",
      hint: "The page describes the event.",
      accept: ["she saw the data", "she found something", "she discovered mirror"],
      fragment: "first-day-event",
      misdirect: ["no. the page describes it.", "wrong. she found the data."],
    },
    "riddle-extra49": {
      id: "riddle-extra49",
      page: "helena/joins-helix.html",
      prompt: "When did Helena join Helix?",
      hint: "The page states the date.",
      accept: ["2017", "2018", "she joined in 2017"],
      fragment: "join-date",
      misdirect: ["no. the page states it.", "wrong. it was around 2017."],
    },
    "riddle-extra50": {
      id: "riddle-extra50",
      page: "helena/final.html",
      prompt: "What is on Helena's final page?",
      hint: "The page shows a number counter.",
      accept: ["2,304,891", "the number", "a counter"],
      fragment: "final-counter",
      misdirect: ["no. the page shows a specific element.", "wrong. it was a number counter."],
    },
  };

  // ============================================
  // THREADS — the color-coded breadcrumb system
  // ============================================
  const THREADS = {
    blue: {
      id: "blue",
      color: "#0066cc",
      name: "official trail",
      description: "Public-facing breadcrumbs Helix left behind — or tried to.",
      pages: [
        "press.html",
        "press/employment-record.html",
        "press/contract-record.html",
        "press/vasquez-foia.html",
        "press/ethics-resignation.html",
        "blog/maintenance-log-2019.html",
        "blog/redacted-statement-2020.html",
        "blog/whistleblower-email.html",
        "blog/board-meeting-minutes.html",
      ],
    },
    yellow: {
      id: "yellow",
      color: "#d4a017",
      name: "anomalous signal",
      description: "Things that shouldn't be where they are. Glitches in the corporate surface.",
      pages: [
        "signin.html",
        "data-room.html",
        "null.html",
        "signals/console-log.html",
        "signals/glitch-report.html",
        "signals/3am-pageview.html",
        "signals/dead-letter.html",
        "signals/traffic-analysis.html",
        "signals/server-logs.html",
        "signals/mirror-output.html",
      ],
    },
    red: {
      id: "red",
      color: "#c0392b",
      name: "project mirror",
      description: "The deep. What they were actually building.",
      pages: [
        "archive.html",
        "archive/vasquez-statement.html",
        "archive/project-mirror-spec.html",
        "archive/subject-list.html",
        "archive/termination-order.html",
        "archive/cohort-update-log.html",
        "archive/threshold-changes.html",
        "archive/data-flow-diagram.html",
        "archive/foia-results.html",
        "archive/site-07.html",
        "archive/three-party-structure.html",
        "archive/audit-2021.html",
        "mirror/end.html",
        "mirror/list.html",
        "mirror/truth.html",
        "mirror/after.html",
        "mirror/14-axis-deep.html",
        "mirror/14-axis-model.html",
        "mirror/system-architecture.html",
        "end.html",
      ],
    },
    purple: {
      id: "purple",
      color: "#8e44ad",
      name: "elena's trail",
      description: "Personal breadcrumbs. The human behind the data.",
      pages: [
        "employees/elena-vasquez.html",
        "employees/james-okoro.html",
        "employees/sarah-chen.html",
        "employees/maria-santos.html",
        "helena/last.html",
        "helena/first-message.html",
        "helena/voice-memo.html",
        "helena/photo.html",
        "helena/goodbye.html",
        "helena/childhood.html",
        "helena/mit-years.html",
        "helena/first-day.html",
        "helena/joins-helix.html",
        "helena/final.html",
        "helena/the-letter.html",
        "helena/journal-entry.html",
        "helena/final-message.html",
        "helena/helena-note.html",
      ],
    },
    green: {
      id: "green",
      color: "#27ae60",
      name: "side investigations",
      description: "The people around the story. What happened to everyone else.",
      pages: [
        "employees/former.html",
        "forum/thread-4512.html",
        "forum/thread-7821.html",
        "forum/thread-2099.html",
        "forum/thread-3301.html",
        "forum/thread-9988.html",
        "forum/thread-4456.html",
        "forum/thread-7823.html",
        "forum/thread-5512.html",
        "forum/thread-8891.html",
        "archive/side-investigation.html",
        "archive/eo-board-log.html",
        "archive/renner-full-statement.html",
        "archive/lopez-resignation.html",
        "archive/journalist-notes.html",
        "archive/audio-transcript.html",
        "archive/source-code.html",
        "archive/witness-testimony.html",
        "archive/conspiracy-board.html",
        "archive/classified-experiment.html",
        "archive/dead-drop.html",
        "archive/internal-audit.html",
        "archive/black-site.html",
        "archive/leaked-emails.html",
      ],
    },
  };

  // ============================================
  // OBJECTIVES — the goal system
  // ============================================
  const OBJECTIVES = [
    // Phase 1: Surface curiosity
    {
      id: "obj-first-anomaly",
      title: "Notice something off",
      desc: "The Helix site has comments in its source. People don't usually write comments on a marketing site.",
      hint: "Right-click → View Source on any page",
      check: (s) => s.visited.size > 0,
      unlocks: ["obj-find-elena"],
    },
    {
      id: "obj-find-elena",
      title: "Find Elena Vasquez",
      desc: "There's a name that keeps coming up. Find her on the team page.",
      hint: "Look at the team list carefully.",
      check: (s) => s.visited.has("employees/elena-vasquez.html"),
      unlocks: ["obj-read-bio", "obj-trail-starts"],
    },
    {
      id: "obj-read-bio",
      title: "Read what happened to her",
      desc: "Her bio has more in it than most bios. Read the full thing.",
      check: (s) => s.visited.has("employees/elena-vasquez.html") && s.dwellTime.get("employees/elena-vasquez.html") > 30,
      unlocks: ["obj-trail-starts"],
    },
    {
      id: "obj-trail-starts",
      title: "Find her trail",
      desc: "She left a message somewhere on the site. Find it.",
      hint: "Look for breadcrumbs in pages you've already read.",
      check: (s) => s.visited.has("helena/last.html"),
      unlocks: ["obj-decrypt", "obj-find-source"],
    },
    {
      id: "obj-find-source",
      title: "Find the project name",
      desc: "There's a code name you need. The name of the thing they were building.",
      hint: "It's mentioned in redacted text and console messages. Try the null page.",
      check: (s) => s.fragments.has("project-name") || s.passwords.has("mirror"),
      unlocks: ["obj-decrypt"],
    },
    {
      id: "obj-decrypt",
      title: "Access the encrypted archive",
      desc: "There's a locked archive on the site. The key is the name of the project.",
      hint: "Passwords to try: mirror, MIRROR, ev2417, vasquez. Or: 2.3M, 2304891.",
      check: (s) => s.passwords.has("mirror") || s.passwords.has("archive") || s.visited.has("archive/vasquez-statement.html"),
      unlocks: ["obj-read-statement", "obj-find-spec"],
    },
    {
      id: "obj-read-statement",
      title: "Read her public statement",
      desc: "She published a statement before the lawyers took it down.",
      check: (s) => s.visited.has("archive/vasquez-statement.html"),
      unlocks: ["obj-find-spec", "obj-find-timeline"],
    },
    {
      id: "obj-find-spec",
      title: "Read the system specification",
      desc: "Find the document that describes what MIRROR actually does.",
      check: (s) => s.visited.has("archive/project-mirror-spec.html"),
      unlocks: ["obj-find-timeline", "obj-find-registry"],
    },
    {
      id: "obj-find-timeline",
      title: "Find the timeline",
      desc: "Reconstruct what happened. There's a page that lists it all.",
      check: (s) => s.visited.has("mirror/end.html"),
      unlocks: ["obj-find-registry", "obj-find-axis"],
    },
    {
      id: "obj-find-registry",
      title: "Find the subject registry",
      desc: "The list of 2,304,891 people. The list that should not exist.",
      check: (s) => s.visited.has("mirror/list.html") || s.visited.has("archive/subject-list.html"),
      unlocks: ["obj-find-axis", "obj-find-truth"],
    },
    {
      id: "obj-find-axis",
      title: "Understand the 14 axes",
      desc: "The model has 14 inputs. Find the page that explains what they are.",
      check: (s) => s.visited.has("mirror/14-axis-deep.html") || s.visited.has("archive/project-mirror-spec.html"),
      unlocks: ["obj-find-truth", "obj-side-renner"],
    },
    {
      id: "obj-side-renner",
      title: "Find Mark Renner's full statement",
      desc: "Another engineer refused to sign. Find his side of the story.",
      check: (s) => s.visited.has("archive/renner-full-statement.html"),
      unlocks: ["obj-side-lopez"],
    },
    {
      id: "obj-side-lopez",
      title: "Find the Ethics Board chair's resignation",
      desc: "The person who was supposed to be the safeguard. What did she say when she left?",
      check: (s) => s.visited.has("archive/lopez-resignation.html"),
      unlocks: ["obj-side-journalist"],
    },
    {
      id: "obj-side-journalist",
      title: "Find the journalist's notes",
      desc: "A reporter got the documents. Read how the story came out.",
      check: (s) => s.visited.has("archive/journalist-notes.html"),
      unlocks: ["obj-find-truth"],
    },
    {
      id: "obj-find-truth",
      title: "Reach the truth",
      desc: "There's a final page. The end of the project. Find it.",
      hint: "Follow the red thread.",
      check: (s) => s.visited.has("mirror/truth.html") || s.visited.has("end.html"),
      unlocks: ["obj-elena-final", "obj-after"],
    },
    {
      id: "obj-elena-final",
      title: "Find Elena's final page",
      desc: "The last thing she wrote. The last breadcrumb.",
      check: (s) => s.visited.has("helena/final.html") || s.visited.has("helena/the-letter.html"),
      unlocks: ["obj-after"],
    },
    {
      id: "obj-after",
      title: "Read the after",
      desc: "What happened after the story broke.",
      check: (s) => s.visited.has("mirror/after.html") || s.visited.has("end.html"),
      unlocks: [],
    },

    // Side / optional objectives
    {
      id: "obj-cipher",
      title: "Decode the cipher",
      desc: "There's an encoded message somewhere. Find and decode it.",
      hint: "ROT13 is a common starting point.",
      check: (s) => s.fragments.has("cipher-decoded") || s.passwords.has("cipher"),
      unlocks: [],
      optional: true,
    },
    {
      id: "obj-threads-all",
      title: "Follow every color",
      desc: "Each color is a thread. Find at least one page in every color.",
      check: (s) => ["blue", "yellow", "red", "purple", "green"].every(t => s.threads.has(t)),
      unlocks: [],
      optional: true,
    },
    {
      id: "obj-fragments-all",
      title: "Collect every fragment",
      desc: "Hidden in pages across the site. Find them all.",
      check: (s) => s.fragments.size >= 8,
      unlocks: [],
      optional: true,
    },
  ];

  // ============================================
  // STATE
  // ============================================
  let state = {
    visited: new Set(JSON.parse(localStorage.getItem(K.visited) || "[]")),
    fragments: new Set(JSON.parse(localStorage.getItem(K.fragments) || "[]")),
    passwords: new Set(JSON.parse(localStorage.getItem(K.passwords) || "[]")),
    threads: new Set(JSON.parse(localStorage.getItem(K.threads) || "[]")),
    completedObj: new Set(JSON.parse(localStorage.getItem(K.completedObj) || "[]")),
    activeObj: JSON.parse(localStorage.getItem(K.objectives) || "[]"),
    seenMessages: new Set(JSON.parse(localStorage.getItem(K.seenMessages) || "[]")),
    dwellTime: new Map(), // track seconds spent per page
    dwellStart: Date.now(),
    dwellPage: fullPath,
    discovered: 0,
  };

  // ============================================
  // SAVE
  // ============================================
  function save() {
    localStorage.setItem(K.visited, JSON.stringify([...state.visited]));
    localStorage.setItem(K.fragments, JSON.stringify([...state.fragments]));
    localStorage.setItem(K.passwords, JSON.stringify([...state.passwords]));
    localStorage.setItem(K.threads, JSON.stringify([...state.threads]));
    localStorage.setItem(K.completedObj, JSON.stringify([...state.completedObj]));
    localStorage.setItem(K.objectives, JSON.stringify(state.activeObj));
    localStorage.setItem(K.seenMessages, JSON.stringify([...state.seenMessages]));
  }

  // ============================================
  // VISIT TRACKING
  // ============================================
  const path = window.location.pathname.replace(/^.*?\//, "").toLowerCase();
  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  const isArchive = pathSegments.includes("archive") || pathSegments[0] === "archive.html";
  const isHelena = pathSegments.includes("helena") || pathSegments[0] === "helena";
  const isMirror = pathSegments.includes("mirror") || pathSegments[0] === "mirror.html";

  // Track full path for visit detection (e.g. "helena/last.html")
  let fullPath = pathSegments.join("/") || "index.html";
  if (fullPath.endsWith("/")) fullPath += "index.html";

  if (fullPath && !state.visited.has(fullPath)) {
    state.visited.add(fullPath);
  }

  // Mark thread based on path
  Object.values(THREADS).forEach((t) => {
    if (t.pages.some((p) => fullPath.endsWith(p.replace(/^.*?\//, "")) || fullPath.includes(p.split("/")[0] + "/"))) {
      state.threads.add(t.id);
    }
  });

  // ============================================
  // DWELL TIME TRACKING
  // ============================================
  setInterval(() => {
    if (state.dwellPage) {
      const elapsed = state.dwellTime.get(state.dwellPage) || 0;
      state.dwellTime.set(state.dwellPage, elapsed + 1);
    }
  }, 1000);
  function updateDiscoveryCount() {
    state.discovered = state.visited.size + state.fragments.size + state.passwords.size;
  }
  updateDiscoveryCount();

  // ============================================
  // VISUAL STAGE (based on discoveries, not clicks)
  // ============================================
  function computeReveal(d) {
    if (d >= 25) return 4;
    if (d >= 15) return 3;
    if (d >= 8) return 2;
    if (d >= 3) return 1;
    return 0;
  }

  function applyReveal() {
    const body = document.body;
    body.classList.remove("reveal-1", "reveal-2", "reveal-3", "reveal-4");
    const r = computeReveal(state.discovered);
    if (r >= 1) body.classList.add("reveal-" + r);
    document.documentElement.style.setProperty("--veil", String(Math.min(state.discovered * 3, 100)));
  }

  // ============================================
  // OBJECTIVE MANAGEMENT
  // ============================================
  function updateObjectives() {
    // Seed initial active objectives
    if (state.activeObj.length === 0) {
      state.activeObj = ["obj-first-anomaly"];
    }

    // Check completion
    OBJECTIVES.forEach((obj) => {
      if (!state.completedObj.has(obj.id) && !obj.optional) {
        if (obj.check(state)) {
          state.completedObj.add(obj.id);
          if (state.activeObj.includes(obj.id)) {
            state.activeObj = state.activeObj.filter((x) => x !== obj.id);
          }
          // Unlock new objectives
          (obj.unlocks || []).forEach((u) => {
            if (!state.completedObj.has(u) && !state.activeObj.includes(u)) {
              const target = OBJECTIVES.find((o) => o.id === u);
              if (target && !target.optional) state.activeObj.push(u);
            }
          });
        }
      }
    });

    // Add new active objectives based on completed state
    const optionalToShow = [];
    OBJECTIVES.forEach((obj) => {
      if (obj.optional && obj.check(state) && !state.completedObj.has(obj.id)) {
        state.completedObj.add(obj.id);
      }
    });

    // Make sure at least 2 active objectives exist (if more exist)
    if (state.activeObj.length < 2) {
      const next = OBJECTIVES.find(
        (o) => !state.completedObj.has(o.id) && !state.activeObj.includes(o.id) && !o.optional
      );
      if (next) state.activeObj.push(next.id);
    }

    save();
  }

  // ============================================
  // RENDERING
  // ============================================
  function renderObjectivesPanel() {
    let panel = document.getElementById("obj-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "obj-panel";
      panel.className = "objectives-panel";
      document.body.appendChild(panel);
    }
    // Apply persisted minimize state
    const minimized = localStorage.getItem("endless_internet_obj_minimized") === "1";
    panel.classList.toggle("minimized", minimized);

    const total = OBJECTIVES.filter(o => !o.optional).length;
    const done = state.completedObj.size;
    const pct = Math.round((done / total) * 100);
    let html = `
      <div class="obj-header">
        <h4>
          <span>OBJECTIVES · ${done}/${total}</span>
        </h4>
        <button class="obj-min-btn" id="obj-min-btn" title="Minimize" aria-label="Minimize objectives">
          <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2 6 L10 6"/></svg>
        </button>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="obj-list">
    `;
    // Show active objectives first
    state.activeObj.slice(0, 4).forEach((id) => {
      const o = OBJECTIVES.find((x) => x.id === id);
      if (!o) return;
      html += `
        <div class="obj active">
          <div class="obj-title"><span class="check">▸</span>${o.title}</div>
          <div class="obj-desc">${o.desc}</div>
          ${o.hint ? `<div class="obj-hint">${o.hint}</div>` : ""}
        </div>
      `;
    });
    // Show last 3 completed
    const recent = [...state.completedObj].slice(-3).reverse();
    recent.forEach((id) => {
      const o = OBJECTIVES.find((x) => x.id === id);
      if (!o) return;
      html += `
        <div class="obj done">
          <div class="obj-title"><span class="check">✓</span>${o.title}</div>
        </div>
      `;
    });
    html += `</div>`;
    panel.innerHTML = html;

    // Floating reopen tab (always present, only visible when minimized)
    let reopen = document.getElementById("obj-reopen");
    if (!reopen) {
      reopen = document.createElement("button");
      reopen.id = "obj-reopen";
      reopen.className = "obj-reopen";
      reopen.title = "Open objectives";
      reopen.setAttribute("aria-label", "Open objectives");
      reopen.innerHTML = `<span class="obj-reopen-label">OBJECTIVES</span><span class="obj-reopen-count">${done}/${total}</span>`;
      document.body.appendChild(reopen);
      reopen.addEventListener("click", () => {
        localStorage.setItem("endless_internet_obj_minimized", "0");
        panel.classList.remove("minimized");
        reopen.classList.remove("visible");
      });
    }
    reopen.querySelector(".obj-reopen-count").textContent = `${done}/${total}`;
    reopen.classList.toggle("visible", minimized);

    // Minimize button
    document.getElementById("obj-min-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      const next = !panel.classList.contains("minimized");
      localStorage.setItem("endless_internet_obj_minimized", next ? "1" : "0");
      panel.classList.toggle("minimized", next);
      reopen.classList.toggle("visible", next);
    });

    // Mobile: tap the panel header to slide the bottom sheet up/down
    const panelH4 = panel.querySelector("h4");
    if (panelH4 && !panelH4.dataset.mobileBound) {
      panelH4.dataset.mobileBound = "1";
      panelH4.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 600px)").matches && !panel.classList.contains("minimized")) {
          panel.classList.toggle("expanded");
        }
      });
    }
  }

  function renderDiscoveryCounter() {
    let counter = document.querySelector(".discovery-counter");
    if (!counter) {
      counter = document.createElement("div");
      counter.className = "discovery-counter";
      counter.title = "Click to view your discoveries";
      document.body.appendChild(counter);
    }
    counter.textContent = `DISCOVERED: ${state.discovered} · STAGE ${computeReveal(state.discovered)}`;
    counter.onclick = () => {
      // Compute root-relative path so it works from any subpage
      const depth = window.location.pathname.split("/").filter(Boolean).length - 1;
      const prefix = depth > 0 ? "../".repeat(depth) : "";
      window.location.href = prefix + "discoveries.html";
    };
  }

  function renderThreadBar() {
    // Skip on certain pages
    const skip = ["signin.html", "data-room.html", "null.html"];
    if (skip.some(s => fullPath.endsWith(s))) return;

    let bar = document.querySelector(".thread-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "thread-bar";
      const header = document.querySelector(".site-header");
      if (header) header.insertAdjacentElement("afterend", bar);
    }
    const allThreads = ["blue", "yellow", "red", "purple", "green"];
    const currentThread = Object.values(THREADS).find(t =>
      t.pages.some(p => fullPath.includes(p.split("/")[0]))
    );
    let html = `<div class="container"><span class="thread-label">THREADS:</span>`;
    allThreads.forEach(tid => {
      const t = THREADS[tid];
      const discovered = state.threads.has(tid);
      const isCurrent = currentThread && currentThread.id === tid;
      const lockedClass = !discovered ? " locked" : "";
      const activeClass = isCurrent ? " active" : "";
      const dotStyle = !discovered ? 'style="background:var(--c-muted);box-shadow:none;"' : "";
      html += `<a href="map.html?thread=${tid}" class="thread-link ${tid}${lockedClass}${activeClass}" title="${t.description}"><span class="dot" ${dotStyle}></span>${t.name}</a>`;
    });
    html += `<a href="discoveries.html" class="thread-link" style="margin-left:auto;color:var(--c-muted);" title="Your discoveries"><span>📋</span>discoveries (${state.discovered})</a>`;
    html += `</div>`;
    bar.innerHTML = html;
  }

  // ============================================
  // PASSWORD GATE
  // ============================================
  function checkArchiveAccess() {
    if (!isArchive) return;
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");
    const passwords = ["mirror", "MIRROR", "2.3M", "2334891", "vasquez", "EV2417", "ev2417"];
    if (key && passwords.includes(key)) {
      sessionStorage.setItem(K.archiveUnlocked, "1");
      state.passwords.add("mirror");
      state.passwords.add("archive");
      state.threads.add("red");
      const clean = window.location.pathname;
      window.history.replaceState({}, document.title, clean);
    }
  }

  function applyArchiveGate() {
    if (!isArchive) return;
    // The archive index and the contents are gated
    if (fullPath === "archive.html" || fullPath.endsWith("/archive/")) {
      // archive index is open, but linked sub-pages require password
    }
    if (fullPath.startsWith("archive/") || fullPath.includes("/archive/")) {
      if (sessionStorage.getItem(K.archiveUnlocked) === "1") return;
      const body = document.body;
      body.innerHTML = `
        <div class="container" style="max-width:480px;margin:6rem auto;text-align:center;">
          <div style="font-family:monospace;color:var(--c-muted);margin-bottom:2rem;">[ ENCRYPTED ARCHIVE — RESTRICTED ]</div>
          <h1>Access Required</h1>
          <p style="color:var(--c-muted);margin-bottom:2rem;">This archive is protected. The key is hidden in the public site. Read carefully — the name of the project is the key.</p>
          <form id="archiveForm" style="display:flex;gap:0.5rem;">
            <input type="text" id="archiveKey" placeholder="Enter access key" autocomplete="off" />
            <button type="submit" class="btn">Submit</button>
          </form>
          <div id="archiveMsg" style="margin-top:1rem;font-family:monospace;font-size:0.85rem;color:var(--c-danger);"></div>
          <div style="margin-top:2rem;font-family:monospace;font-size:0.75rem;color:var(--c-muted);">attempt count: <span id="attempts">0</span></div>
          <p style="margin-top:3rem;"><a href="index.html">← return to helix</a></p>
        </div>
      `;
      let attempts = 0;
      document.getElementById("archiveForm").addEventListener("submit", function (e) {
        e.preventDefault();
        const v = document.getElementById("archiveKey").value.trim();
        attempts++;
        document.getElementById("attempts").textContent = attempts;
        const passwords = ["mirror", "MIRROR", "2.3M", "2334891", "vasquez", "EV2417", "ev2417"];
        if (passwords.includes(v)) {
          sessionStorage.setItem(K.archiveUnlocked, "1");
          state.passwords.add("mirror");
          state.passwords.add("archive");
          state.threads.add("red");
          save();
          location.reload();
        } else {
          document.getElementById("archiveMsg").textContent = "ACCESS DENIED. signal logged.";
          state.discovered += 1;
          save();
        }
      });
    }
  }

  // ============================================
  // PAGE BEHAVIORS
  // ============================================
  function pageBehaviors() {
    // The list page — generate fake names
    if ((fullPath.includes("mirror/list") || fullPath === "mirror/list.html") && computeReveal(state.discovered) >= 1) {
      const list = document.getElementById("subjectList");
      if (list && !list.dataset.rendered) {
        list.dataset.rendered = "1";
        const firstNames = ["James","Mary","Robert","Patricia","John","Jennifer","Michael","Linda","David","Elizabeth","William","Barbara","Richard","Susan","Joseph","Jessica","Thomas","Sarah","Charles","Karen","Christopher","Nancy","Daniel","Lisa","Matthew","Margaret","Anthony","Betty","Mark","Sandra","Donald","Ashley","Steven","Kimberly","Paul","Emily","Andrew","Donna","Joshua","Michelle","Kenneth","Carol","Kevin","Amanda","Brian","Melissa","George","Deborah","Edward","Stephanie","Ronald","Rebecca","Timothy","Laura","Jason","Sharon","Jeffrey","Cynthia","Ryan","Kathleen","Jacob","Helen","Gary","Amy","Nicholas","Shirley","Eric","Angela","Jonathan","Anna","Stephen","Brenda","Larry","Pamela","Justin","Nicole","Scott","Emma","Brandon","Samantha","Benjamin","Katherine","Samuel","Christine","Frank","Debra","Gregory","Rachel","Raymond","Catherine","Alexander","Carolyn","Patrick","Janet","Jack","Ruth","Dennis","Maria","Jerry","Heather","Tyler","Diane","Aaron","Virginia","Jose","Julie","Adam","Joyce","Henry","Victoria","Nathan","Olivia","Douglas","Kelly","Peter","Christina","Zachary","Lauren","Kyle","Joan","Walter","Evelyn","Harold","Judith","Jeremy","Megan","Ethan","Cheryl","Carl","Andrea","Keith","Hannah","Roger","Jacqueline","Gerald","Martha","Christian","Gloria","Terry","Teresa","Sean","Ann","Arthur","Sara","Austin","Madison","Noah","Frances","Lawrence","Kathryn","Jesse","Janice","Joe","Jean","Bryan","Abigail","Billy","Alice","Jordan","Julia","Albert","Judy","Dylan","Sophia","Bruce","Grace","Willie","Denise","Gabriel","Amber","Alan","Doris","Juan","Marilyn","Logan","Danielle","Wayne","Beverly","Roy","Isabella","Ralph","Theresa","Randy","Diana","Eugene","Natalie","Vincent","Brittany","Russell","Charlotte","Elijah","Marie","Louis","Kayla","Bobby","Alexis","Philip","Lori","Johnny","Tiffany"];
        const lastNames = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts","Gomez","Phillips","Evans","Turner","Diaz","Parker","Cruz","Edwards","Collins","Reyes","Stewart","Morris","Morales","Murphy","Cook","Rogers","Gutierrez","Ortiz","Morgan","Cooper","Peterson","Bailey","Reed","Kelly","Howard","Ramos","Kim","Cox","Ward","Richardson","Watson","Brooks","Chavez","Wood","James","Bennett","Gray","Mendoza","Ruiz","Hughes","Price","Alvarez","Castillo","Sanders","Patel","Myers","Long","Ross","Foster","Jimenez","Powell","Jenkins","Perry","Russell","Sullivan","Bell","Coleman","Butler","Henderson","Barnes","Gonzales","Fisher","Vasquez","Simmons","Romero","Jordan","Patterson","Alexander","Hamilton","Graham","Reynolds","Griffin","Wallace","Moreno","West","Cole","Hayes","Bryant","Herrera","Gibson","Ellis","Tran","Medina","Aguilar","Stevens","Murray","Ford","Castro","Marshall","Owens","Harrison","Fernandez","McDonald","Woods","Washington","Kennedy","Wells","Vargas","Henry","Chen","Freeman","Webb","Tucker","Guzman","Burns","Crawford","Olson","Simpson","Porter","Hunter","Gordon","Mendez","Silva","Shaw","Snyder","Mason","Dixon","Munoz","Hunt","Hicks","Holmes","Palmer","Wagner","Black","Robertson","Boyd","Rose","Stone","Salazar","Fox","Warren","Mills","Meyer","Rice","Schmidt","Garza","Daniels","Ferguson","Nichols","Stephens","Soto","Weaver","Ryan","Gardner","Payne","Grant","Dunn","Kelley","Spencer","Hawkins","Arnold","Pierce","Vazquez","Hansen","Peters","Santos","Hart","Bradley","Knight","Elliott","Cunningham","Duncan","Armstrong","Hudson","Carroll","Lane","Riley","Andrews","Alvarado","Ray","Delgado","Berry","Perkins","Hoffman","Johnston","Matthews","Pena","Richards","Contreras","Willis","Carpenter","Lawrence","Sandoval","Guerrero","George","Chapman","Rios","Estrada","Ortega","Watkins"];
        const cities = ["Phoenix","San Antonio","Dallas","Austin","Jacksonville","Fort Worth","Columbus","Charlotte","Indianapolis","San Francisco","Seattle","Denver","Washington","Boston","El Paso","Nashville","Detroit","Oklahoma City","Portland","Las Vegas","Memphis","Louisville","Baltimore","Milwaukee","Albuquerque","Tucson","Fresno","Sacramento","Mesa","Kansas City","Atlanta","Long Beach","Colorado Springs","Raleigh","Miami","Virginia Beach","Omaha","Oakland","Minneapolis","Tulsa","Arlington","New Orleans","Wichita","Cleveland","Tampa","Bakersfield","Aurora","Honolulu","Anaheim","Lexington","Stockton","Henderson","Corpus Christi","Riverside","Santa Ana","Orlando","Irvine","Cincinnati","Newark","Saint Paul","Pittsburgh","Greensboro","Lincoln","Durham","Jersey City","Plano","St. Louis","Madison","Chandler","Buffalo","Laredo","Lubbock","Scottsdale","Reno","Glendale","Gilbert","Winston–Salem","North Las Vegas","Norfolk","Chesapeake","Garland","Irving","Hialeah","Fremont","Boise","Richmond","Baton Rouge","Spokane","Des Moines","Tacoma","San Bernardino","Modesto","Fontana","Santa Clarita","Birmingham","Oxnard","Fayetteville","Moreno Valley","Rochester","Glendale","Huntington Beach","Salt Lake City","Grand Rapids","Amarillo","Yonkers","Aurora","Montgomery","Akron","Little Rock","Huntsville","Augusta","Tempe","Overland Park","Grand Prairie","Sunrise Manor","Waco","Jackson","Topeka"];
        const states = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
        const statuses = ["ACTIVE","FLAGGED","TIER-1","TIER-2","WATCH","PENDING","VERIFIED","QUIET","MOBILIZE","REVIEW"];
        let html = "";
        const target = state.discovered >= 10 ? 800 : 300;
        for (let i = 0; i < target; i++) {
          const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
          const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
          const city = cities[Math.floor(Math.random() * cities.length)];
          const state2 = states[Math.floor(Math.random() * states.length)];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const id = String(Math.floor(Math.random() * 9000000 + 1000000));
          html += `<div>${id} · ${ln}, ${fn[0]}. · ${city}, ${state2} · <span style="color:#ff5050">${status}</span></div>`;
        }
        list.innerHTML = html;
        if (state.discovered >= 15) {
          setInterval(() => {
            const lines = list.querySelectorAll("div");
            const i = Math.floor(Math.random() * lines.length);
            const colors = ["#ff5050", "#ff8030", "#ffaa00", "#ff0040"];
            lines[i].style.color = colors[Math.floor(Math.random() * colors.length)];
            setTimeout(() => (lines[i].style.color = ""), 1500);
          }, 600);
        }
      }
    }

    // Fragment collection
    document.querySelectorAll("[data-fragment]").forEach((el) => {
      const f = el.getAttribute("data-fragment");
      if (state.fragments.has(f)) {
        el.classList.add("collected");
        el.textContent = f + " ✓";
        el.style.cursor = "default";
      }
      el.addEventListener("click", () => {
        if (state.fragments.has(f)) return;
        state.fragments.add(f);
        el.classList.add("collected");
        el.textContent = f + " ✓";
        state.discovered = state.visited.size + state.fragments.size + state.passwords.size;
        save();
        applyReveal();
        renderDiscoveryCounter();
        updateObjectives();
        renderObjectivesPanel();
        emitMessage("fragment", `fragment collected: ${f}`);
      });
    });

    // Cipher check
    if (document.getElementById("cipher-input")) {
      document.getElementById("cipher-input").addEventListener("input", (e) => {
        const v = e.target.value.toLowerCase().trim();
        if (v === "the project is still running" || v === "mirror" || v === "the list is real") {
          state.passwords.add("cipher");
          state.fragments.add("cipher-decoded");
          state.discovered = state.visited.size + state.fragments.size + state.passwords.size;
          save();
          applyReveal();
          renderDiscoveryCounter();
          updateObjectives();
          renderObjectivesPanel();
          const msg = document.getElementById("cipher-msg");
          if (msg) msg.innerHTML = `<span style="color:var(--thread-green)">✓ decoded. fragment collected.</span>`;
        }
      });
    }
  }

  // ============================================
  // CONSOLE MESSAGES
  // ============================================
  function emitMessage(type, text) {
    const key = type + ":" + text;
    if (state.seenMessages.has(key)) return;
    state.seenMessages.add(key);
    save();
    const colors = {
      anomaly: "color: #d4a017; font-family: monospace;",
      fragment: "color: #27ae60; font-family: monospace;",
      objective: "color: #0066cc; font-family: monospace;",
      signal: "color: #c0392b; font-family: monospace; font-weight: bold;",
      warning: "color: #c0392b; background: #000; padding: 4px; font-family: monospace;",
    };
    console.log("%c[HELIX-SYS] " + text, colors[type] || colors.anomaly);
  }

  // ============================================
  // RIDDLES — UI handler
  // ============================================
  function setupRiddles() {
    document.querySelectorAll(".riddle").forEach((el) => {
      const id = el.getAttribute("data-riddle");
      const riddle = RIDDLES[id];
      if (!riddle) return;

      const solved = localStorage.getItem(K.riddlesSolved + ":" + id) === "1";

      el.innerHTML = `
        <div class="riddle-frame">
          <div class="riddle-label">[ RIDDLE — TRIGGERED ]</div>
          <div class="riddle-prompt">${riddle.prompt}</div>
          ${riddle.hint ? `<div class="riddle-hint">${riddle.hint}</div>` : ""}
          <form class="riddle-form" autocomplete="off">
            <input type="text" class="riddle-input" placeholder="..." autocomplete="off" />
            <button type="submit" class="riddle-btn">answer</button>
          </form>
          <div class="riddle-msg"></div>
        </div>
      `;

      const form = el.querySelector(".riddle-form");
      const input = el.querySelector(".riddle-input");
      const msg = el.querySelector(".riddle-msg");

      if (solved) {
        msg.innerHTML = `<span class="riddle-solved">✓ solved. fragment: <code>${riddle.fragment}</code></span>`;
        input.disabled = true;
        el.querySelector(".riddle-btn").disabled = true;
        el.querySelector(".riddle-btn").textContent = "✓";
      }

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const v = input.value.trim().toLowerCase();
        if (!v) return;
        if (riddle.accept.some((a) => a.toLowerCase() === v)) {
          // SOLVED
          state.fragments.add(riddle.fragment);
          state.discovered = state.visited.size + state.fragments.size + state.passwords.size;
          localStorage.setItem(K.riddlesSolved + ":" + id, "1");
          save();
          applyReveal();
          renderDiscoveryCounter();
          updateObjectives();
          renderObjectivesPanel();
          msg.innerHTML = `<span class="riddle-solved">✓ solved. fragment: <code>${riddle.fragment}</code></span>`;
          input.disabled = true;
          el.querySelector(".riddle-btn").disabled = true;
          el.querySelector(".riddle-btn").textContent = "✓";
          // Special effects on solve
          flashElement(el, "riddle-flash-success");
          emitMessage("fragment", `riddle solved. fragment: ${riddle.fragment}`);
          triggerBoom({ intensity: 0.5, duration: 1200 });
        } else {
          // WRONG
          const wrong = riddle.misdirect[Math.floor(Math.random() * riddle.misdirect.length)];
          msg.innerHTML = `<span class="riddle-wrong">✗ ${wrong}</span>`;
          flashElement(el, "riddle-flash-fail");
          input.value = "";
          input.focus();
        }
      });
    });
  }

  function flashElement(el, cls) {
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), 700);
  }

  // ============================================
  // THE BOOM — climax animation
  // ============================================
  // Reusable — used by riddle solve (light) and truth.html arrival (full)
  function triggerBoom(opts) {
    opts = opts || {};
    const intensity = opts.intensity != null ? opts.intensity : 1;
    const duration = opts.duration != null ? opts.duration : 2400;
    const overlay = document.createElement("div");
    overlay.className = "boom-overlay";
    overlay.style.setProperty("--boom-intensity", String(intensity));
    overlay.style.setProperty("--boom-duration", duration + "ms");
    overlay.innerHTML = `
      <div class="boom-text">2,304,891</div>
      <div class="boom-stamp">MIRROR</div>
      <div class="boom-bar"><div class="boom-bar-fill"></div></div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), duration + 400);
  }

  // ============================================
  // THE CLIMAX — first visit to truth.html
  // ============================================
  function setupTruthClimax() {
    if (fullPath !== "mirror/truth.html" && fullPath !== "mirror/truth.html/") return;
    if (localStorage.getItem(K.truthSeen) === "1") return;

    // First time on the truth page
    const veil = document.createElement("div");
    veil.className = "truth-veil";
    veil.innerHTML = `
      <div class="truth-veil-content">
        <div class="truth-veil-line">READING THE DOCUMENT</div>
        <div class="truth-veil-bar"><div class="truth-veil-fill"></div></div>
        <div class="truth-veil-status">verifying the source</div>
        <div class="truth-veil-num">2,304,891</div>
      </div>
    `;
    document.body.appendChild(veil);

    // Phase 1: 0-1500ms — building tension
    setTimeout(() => {
      veil.querySelector(".truth-veil-status").textContent = "the file is open. the file is 47,318 lines long.";
    }, 800);
    setTimeout(() => {
      veil.querySelector(".truth-veil-status").textContent = "verifying the signature.  signature is valid.";
    }, 1800);

    // Phase 2: 2400ms — the BOOM
    setTimeout(() => {
      document.body.classList.add("boom-flash");
      veil.classList.add("boom-fade");
      setTimeout(() => {
        document.body.classList.remove("boom-flash");
      }, 200);
    }, 2400);

    // Phase 3: 2900ms — number storm + stamp
    setTimeout(() => {
      const storm = document.createElement("div");
      storm.className = "number-storm";
      document.body.appendChild(storm);
      // Spawn 60 numbers across the screen
      for (let i = 0; i < 60; i++) {
        const span = document.createElement("span");
        span.className = "ns-num";
        const v = Math.floor(Math.random() * 2304891);
        span.textContent = v.toLocaleString();
        span.style.left = (Math.random() * 100) + "vw";
        span.style.top = (Math.random() * 100) + "vh";
        span.style.animationDelay = (Math.random() * 1.2) + "s";
        span.style.fontSize = (10 + Math.random() * 40) + "px";
        span.style.color = ["#ff0040", "#ff8030", "#ffaa00", "#c0392b", "#ffffff"][Math.floor(Math.random() * 5)];
        storm.appendChild(span);
      }
      setTimeout(() => storm.remove(), 3200);
    }, 2900);

    // Phase 4: 5400ms — reveal content
    setTimeout(() => {
      veil.remove();
      localStorage.setItem(K.truthSeen, "1");
      // Subtle reveal flash
      const f = document.createElement("div");
      f.style.cssText = "position:fixed;inset:0;background:#fff;z-index:99998;pointer-events:none;opacity:0.7;transition:opacity 1.2s;";
      document.body.appendChild(f);
      setTimeout(() => f.style.opacity = "0", 50);
      setTimeout(() => f.remove(), 1500);
      emitMessage("warning", "you have read the truth. the watching has stopped.");
    }, 5400);
  }

  // ============================================
  // THE FINAL MESSAGE — last screen on end.html
  // ============================================
  function setupFinalMessage() {
    if (fullPath !== "end.html" && fullPath !== "end.html/") return;
    if (localStorage.getItem(K.endSeen) === "1") return;

    // After the existing end content, append a final-message block
    setTimeout(() => {
      const main = document.querySelector("main") || document.body;
      const fm = document.createElement("section");
      fm.className = "final-message";
      fm.innerHTML = `
        <div class="final-fade">
          <p class="final-line final-1">the watching has stopped</p>
          <p class="final-line final-2">the file is closed</p>
          <p class="final-line final-3">the backup is, in the formal sense, intact</p>
          <p class="final-line final-4 final-quiet">— — —</p>
          <p class="final-line final-5 final-personal">
            for whoever you are, reading this late:<br>
            you are not, in the practical sense, the person who started.<br>
            that is, in the moral sense, the only thing they could not destroy.
          </p>
          <p class="final-line final-6 final-sig">— e.v.</p>
        </div>
      `;
      main.appendChild(fm);
      localStorage.setItem(K.endSeen, "1");
    }, 1200);
  }

  // ============================================
  // MISLEADING THEATER — wrong-password animation
  // ============================================
  function setupArchiveTheater() {
    const form = document.getElementById("archiveForm");
    if (!form) return;
    // We replace the form's submit behavior with a "decrypting" theater
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      const v = document.getElementById("archiveKey").value.trim();
      const msg = document.getElementById("archiveMsg");
      const passwords = ["mirror", "MIRROR", "2.3M", "2334891", "vasquez", "EV2417", "ev2417", "the system", "the project", "still running"];
      if (passwords.includes(v)) {
        // REAL success — short, decisive
        msg.innerHTML = `<span style="color:var(--thread-green)">access granted.</span>`;
        sessionStorage.setItem(K.archiveUnlocked, "1");
        state.passwords.add("mirror");
        state.passwords.add("archive");
        state.threads.add("red");
        save();
        setTimeout(() => location.reload(), 600);
      } else {
        // MISLEADING THEATER
        msg.innerHTML = `<span style="color:var(--c-muted)">verifying...</span>`;
        const stages = [
          "verifying the signature",
          "checking the hash",
          "loading the keyfile",
          "decrypting the outer layer",
          "decrypting the inner layer",
          "verifying decryption",
          "preparing the payload",
        ];
        let i = 0;
        const ticker = setInterval(() => {
          i++;
          if (i < stages.length) {
            msg.innerHTML = `<span style="color:var(--c-muted)">${stages[i]}...</span>`;
          } else {
            clearInterval(ticker);
            msg.innerHTML = `<span style="color:var(--c-danger)">DECRYPTION FAILED · 99% complete · signal logged</span>`;
            const attempts = document.getElementById("attempts");
            if (attempts) attempts.textContent = String((parseInt(attempts.textContent, 10) || 0) + 1);
            state.discovered = state.visited.size + state.fragments.size + state.passwords.size + 1;
            save();
            applyReveal();
            renderDiscoveryCounter();
            document.getElementById("archiveKey").value = "";
          }
        }, 220);
      }
    }, true);  // capture phase — runs before the original handler
  }

  // ============================================
  // AMBIENT EFFECTS — corner glitches, whispers
  // ============================================
  function setupAmbient() {
    // Skip on heavy pages
    if (fullPath.endsWith("/mirror/truth.html") || fullPath.endsWith("/end.html")) return;

    // Periodic corner glitch — every 45-90 seconds, show a small flicker
    const scheduleNext = () => {
      const delay = 45000 + Math.random() * 45000;
      setTimeout(() => {
        showCornerGlitch();
        scheduleNext();
      }, delay);
    };
    scheduleNext();

    // First-time visitor message
    if (state.discovered >= 1 && !state.seenMessages.has("welcome-corner")) {
      setTimeout(() => showCornerGlitch("welcome"), 8000);
      state.seenMessages.add("welcome-corner");
    }
  }

  function showCornerGlitch(kind) {
    const g = document.createElement("div");
    g.className = "corner-glitch";
    const messages = {
      welcome: "welcome. the system is watching.",
      default: [
        "the system is, in the formal sense, still running.",
        "the threads are visible.",
        "the threshold was lowered. you should know that.",
        "2,304,891 names. you know this number.",
        "the backup is intact. for now.",
        "the auditor found the threshold change. the auditor was terminated.",
        "the federal client does not know you are here. the federal client does not know anything, in the practical sense.",
        "the watching has stopped. the watching has, in the formal sense, not stopped.",
      ],
    };
    const text = kind === "welcome"
      ? messages.welcome
      : messages.default[Math.floor(Math.random() * messages.default.length)];
    g.textContent = text;
    document.body.appendChild(g);
    setTimeout(() => g.classList.add("show"), 50);
    setTimeout(() => g.classList.remove("show"), 6500);
    setTimeout(() => g.remove(), 7500);
  }

  // ============================================
  // NUMBER COUNTER — on helena/final.html, counts up
  // ============================================
  function setupNumberStorm() {
    const target = document.getElementById("number-storm-target");
    if (!target) return;
    const final = 2304891;
    const duration = 22000;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const e = 1 - Math.pow(1 - t, 3);
      const v = Math.floor(e * final);
      target.textContent = v.toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
      else target.textContent = final.toLocaleString();
    };
    requestAnimationFrame(tick);
  }

  // ============================================
  // PHANTOM PASSWORD — when player gets the right answer
  // the system "almost" accepts it, then doubles down
  // ============================================
  // (Wired inline in the riddle handler above)

  // ============================================
  // RESET
  // ============================================
  window.__resetEndlessInternet = function () {
    Object.values(K).forEach((k) => localStorage.removeItem(k));
    Object.keys(localStorage).filter(k => k.startsWith("endless_internet_riddles_solved:")).forEach(k => localStorage.removeItem(k));
    sessionStorage.removeItem(K.archiveUnlocked);
    location.reload();
  };

  // ============================================
  // KONAMI
  // ============================================
  function setupKonami() {
    const code = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    let pos = 0;
    document.addEventListener("keydown", function (e) {
      if (e.keyCode === code[pos]) {
        pos++;
        if (pos === code.length) {
          pos = 0;
          state.fragments.add("konami");
          state.discovered = state.visited.size + state.fragments.size + state.passwords.size;
          save();
          applyReveal();
          renderDiscoveryCounter();
          updateObjectives();
          renderObjectivesPanel();
          const flash = document.createElement("div");
          flash.style.cssText = "position:fixed;inset:0;background:#fff;z-index:99999;pointer-events:none;";
          document.body.appendChild(flash);
          setTimeout(() => flash.remove(), 400);
          emitMessage("warning", "KONAMI DETECTED. +1 fragment. (the easter egg is real this time.)");
        }
      } else {
        pos = 0;
      }
    });
  }

  // ============================================
  // INIT
  // ============================================
  applyReveal();
  updateObjectives();
  renderThreadBar();
  renderObjectivesPanel();
  renderDiscoveryCounter();
  checkArchiveAccess();
  applyArchiveGate();
  setupArchiveTheater();  // run AFTER applyArchiveGate (capture phase)
  pageBehaviors();
  setupKonami();
  setupRiddles();
  setupNumberStorm();
  setupTruthClimax();
  setupFinalMessage();
  setupAmbient();

  // ============================================
  // COMPLETION CHECK — all 12 riddles solved
  // ============================================
  const riddleIds = Object.keys(RIDDLES);
  const solvedCount = riddleIds.filter(id => localStorage.getItem(K.riddlesSolved + ":" + id) === "1").length;
  const allRiddlesSolved = solvedCount === riddleIds.length;
  if (allRiddlesSolved && fullPath === "end.html") {
    setTimeout(() => {
      const banner = document.getElementById("complete-banner");
      if (banner) banner.style.display = "block";
    }, 3000);
  }

  save();

  // Emit discovery messages for current state
  if (state.discovered >= 1) emitMessage("anomaly", "anomalous access pattern. the system is noticing you.");
  if (state.discovered >= 5) emitMessage("anomaly", "the threads are visible. follow them.");
  if (state.discovered >= 10) emitMessage("signal", "you have crossed the threshold. continue.");
  if (state.discovered >= 20) emitMessage("warning", "you are close to the truth. or the truth is close to you.");

  // Expose for debug
  window.__endlessState = state;
  window.__endlessThreads = THREADS;
  window.__endlessObjectives = OBJECTIVES;
})();
