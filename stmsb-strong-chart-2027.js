(function(){
  "use strict";

  var DATA_URL = "stmsb-strong-chart-2027.json";
  var LOCAL_KEY = "stmsb-strong-chart-2027-data-v1";
  var CARD_W = 208, CARD_H = 78, H_GAP = 16, V_GAP = 110, ROOT_GAP = 40, MARGIN = 50;
  // A multi-child fan-out jogs sideways this far below the parent's card,
  // then drops straight down into each child. It has to land inside the gap
  // between rows (V_GAP - CARD_H) and clear a grid/section box's own top
  // (which itself sits 8px above the row for its rounded border) — otherwise
  // the jog is drawn behind the row below it instead of above it.
  var ELBOW_JOG = 14;
  var GRID_COLS = 2, GRID_ROW_GAP = 14; // childless siblings beyond this many wrap into a 2-column block instead of spreading into one wide row
  var GRID_THRESHOLD = 3;
  // Leaves that share a department with at least one sibling read as one
  // organizational section — a named office box with its people stacked
  // inside, the way a real government org chart draws a bureau or section
  // as a single labeled unit rather than a loose row of individual reports.
  // Members lay out in up to SECTION_COLS columns to keep a big roster short.
  // SECTION_HEAD_GAP (below a merged chief's own row) is wider than the
  // ordinary SECTION_GAP so that chief's collapse-toggle — which overhangs
  // the bottom of their card — has room and doesn't get covered by the
  // staff row underneath, which would make it unclickable.
  var SECTION_PAD = 10, SECTION_HEADER_H = 22, SECTION_GAP = 10, SECTION_HEAD_GAP = 26, SECTION_COLS = 2;
  var PALETTE = ["#2F6F5E","#B98B2A","#3E6B8A","#6B4C6E","#A65B3F","#4C6B3E","#7A5C99","#3E7A8A"];
  var VACANT_COLOR = "#9AA39C";

  // Baseline roster, kept in sync with stmsb-strong-chart-2027.json. This is
  // what actually loads when the page is opened as a plain file:// document —
  // browsers block fetch() of local files, so the separate .json file can't
  // be read that way. `savedAt` is a timestamp for whoever's data is newest:
  // every edit made in this browser stamps its own `savedAt` when it saves to
  // localStorage, and whichever of {this baseline, the fetched .json file (if
  // reachable), your browser's local save} has the latest `savedAt` wins at
  // load time. That way an update made here always shows up on next reload,
  // without clobbering newer edits you made directly in the browser.
  var BASELINE_DATA = {
    "people": [
      {
        "id": "pmtqtfuvv02etb",
        "name": "Director General, Office of the DG",
        "title": "Director General",
        "dept": "Office of the DG",
        "managerId": null,
        "teams": [],
        "vacant": false
      },
      {
        "id": "pmtqtgor3qr0qd",
        "name": "Deputy Director General, SST",
        "title": "Deputy Director General",
        "dept": "SST",
        "managerId": "pmtqtfuvv02etb",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "Executive Sponsor",
            "allocation": "",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmtqthkhlqifvq",
        "name": "Director, STMSB",
        "title": "Director IV",
        "dept": "STMSB",
        "managerId": "pmtqtgor3qr0qd",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "Director",
            "allocation": "",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmtqyu5x0nb22x",
        "name": "STMSB Staff 01",
        "title": "SAA-5",
        "dept": "STMSB",
        "managerId": "pmtqthkhlqifvq",
        "teams": [],
        "vacant": false
      },
      {
        "id": "pmtqyvcttmkex2",
        "name": "STMSB Staff 02",
        "title": "AA-4(D-2)",
        "dept": "STMSB",
        "managerId": "pmtqthkhlqifvq",
        "teams": [],
        "vacant": false
      },
      {
        "id": "pmtqyw8noianop",
        "name": "STMSB Staff 03",
        "title": "AA-3",
        "dept": "STMSB",
        "managerId": "pmtqthkhlqifvq",
        "teams": [],
        "vacant": false
      },
      {
        "id": "pmtqywt3j6exw3",
        "name": "STMSB Staff 04",
        "title": "PTO-3",
        "dept": "STMSB",
        "managerId": "pmtqthkhlqifvq",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "20",
            "type": "solid"
          },
          {
            "teamId": "pmtqz1b1om6ckx",
            "role": "",
            "allocation": "20",
            "type": "solid"
          },
          {
            "teamId": "pmts8vxc3azp3r",
            "role": "Lead",
            "allocation": "80",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmtqyytw8ltefp",
        "name": "Chief, SPCSDD",
        "title": "Chief",
        "dept": "SPCSDD",
        "managerId": "pmtqthkhlqifvq",
        "teams": [],
        "vacant": true
      },
      {
        "id": "pmtqyzdzrveely",
        "name": "Chief, SECSDD",
        "title": "Chief",
        "dept": "SECSDD",
        "managerId": "pmtqthkhlqifvq",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmtqz1b1om6ckx",
            "role": "Lead",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmtqz052lhkfc1",
        "name": "Chief, SMASDD",
        "title": "Chief",
        "dept": "SMASDD",
        "managerId": "pmtqthkhlqifvq",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8ovsku8qa5",
            "role": "",
            "allocation": "90",
            "type": "solid"
          },
          {
            "teamId": "pmts8qj1p2wcfz",
            "role": "",
            "allocation": "10",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmtr057q85ah96",
        "name": "SECSDD Staff 01",
        "title": "SvSRS",
        "dept": "SECSDD",
        "managerId": "pmtqyzdzrveely",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8ovsku8qa5",
            "role": "",
            "allocation": "50",
            "type": "solid"
          },
          {
            "teamId": "pmts8pcpqjzwkr",
            "role": "",
            "allocation": "50",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmtr0svsrsvacant",
        "name": "(Unfilled)",
        "title": "SvSRS",
        "dept": "SECSDD",
        "managerId": "pmtqyzdzrveely",
        "teams": [],
        "vacant": true
      },
      {
        "id": "pmtr087i0o5ksh",
        "name": "SECSDD Staff 02",
        "title": "Senior SRS",
        "dept": "SECSDD",
        "managerId": "pmtqyzdzrveely",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmtqz1b1om6ckx",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8ovsku8qa5",
            "role": "",
            "allocation": "20",
            "type": "solid"
          },
          {
            "teamId": "pmu3frpwd5ndeo",
            "role": "Lead",
            "allocation": "",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmtr08pysl6bq4",
        "name": "SECSDD Staff 03",
        "title": "Senior SRS",
        "dept": "SECSDD",
        "managerId": "pmtqyzdzrveely",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8pcpqjzwkr",
            "role": "",
            "allocation": "20",
            "type": "solid"
          },
          {
            "teamId": "pmts8qj1p2wcfz",
            "role": "Co-Lead",
            "allocation": "80",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmtr09nqkvb31z",
        "name": "SECSDD Staff 04",
        "title": "SRS-1",
        "dept": "SECSDD",
        "managerId": "pmtqyzdzrveely",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8qj1p2wcfz",
            "role": "",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmtr0a15c8npdg",
        "name": "SECSDD Staff 05",
        "title": "SRS-2",
        "dept": "SECSDD",
        "managerId": "pmtqyzdzrveely",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8qj1p2wcfz",
            "role": "",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmtr0aukjwvm7m",
        "name": "SECSDD Staff 06",
        "title": "SRS-1",
        "dept": "SECSDD",
        "managerId": "pmtqyzdzrveely",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8pcpqjzwkr",
            "role": "",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmts66bsjexo3b",
        "name": "SMASDD Staff 01",
        "title": "SvSRS",
        "dept": "SMASDD",
        "managerId": "pmtqz052lhkfc1",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmtqz1b1om6ckx",
            "role": "",
            "allocation": "100",
            "type": "solid"
          },
          {
            "teamId": "pmu3fjrec7qxgm",
            "role": "Lead",
            "allocation": "",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmts699biymigv",
        "name": "SPCSDD Staff 01",
        "title": "SvSRS",
        "dept": "SPCSDD",
        "managerId": "pmtqyytw8ltefp",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8pcpqjzwkr",
            "role": "Lead",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmts8kwmslzeox",
        "name": "SPCSDD Staff 02",
        "title": "SvSRS",
        "dept": "SPCSDD",
        "managerId": "pmtqyytw8ltefp",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmtqz1b1om6ckx",
            "role": "",
            "allocation": "50",
            "type": "solid"
          },
          {
            "teamId": "pmts8q0ega4txq",
            "role": "Lead",
            "allocation": "50",
            "type": "solid"
          },
          {
            "teamId": "pmu3fr7r9fgxog",
            "role": "Lead",
            "allocation": "",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmts8nprm29ijw",
        "name": "SMASDD Staff 02",
        "title": "Senior SRS",
        "dept": "SMASDD",
        "managerId": "pmtqz052lhkfc1",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmtqz1b1om6ckx",
            "role": "",
            "allocation": "70",
            "type": "solid"
          },
          {
            "teamId": "pmts8qj1p2wcfz",
            "role": "",
            "allocation": "30",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmts8r8dridw60",
        "name": "SMASDD Staff 03",
        "title": "Senior SRS",
        "dept": "SMASDD",
        "managerId": "pmtqz052lhkfc1",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8qj1p2wcfz",
            "role": "Co-Lead",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmts8st4y4nphv",
        "name": "SMASDD Staff 04",
        "title": "SRS-2",
        "dept": "SMASDD",
        "managerId": "pmtqz052lhkfc1",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8qj1p2wcfz",
            "role": "",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmts8tdlet66eb",
        "name": "SMASDD Staff 05",
        "title": "SRS-1",
        "dept": "SMASDD",
        "managerId": "pmtqz052lhkfc1",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8qj1p2wcfz",
            "role": "",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmts8u3z6c4k99",
        "name": "SMASDD Staff 06",
        "title": "SRS-1",
        "dept": "SMASDD",
        "managerId": "pmtqz052lhkfc1",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8qj1p2wcfz",
            "role": "",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmts8zicc5l4f5",
        "name": "SPCSDD Staff 03",
        "title": "Senior SRS",
        "dept": "SPCSDD",
        "managerId": "pmtqyytw8ltefp",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8ovsku8qa5",
            "role": "",
            "allocation": "10",
            "type": "solid"
          },
          {
            "teamId": "pmts8pcpqjzwkr",
            "role": "",
            "allocation": "90",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmts90xzyjfvfb",
        "name": "SPCSDD Staff 04",
        "title": "Senior SRS",
        "dept": "SPCSDD",
        "managerId": "pmtqyytw8ltefp",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "",
            "type": "solid"
          },
          {
            "teamId": "pmtqz1b1om6ckx",
            "role": "",
            "allocation": "60",
            "type": "solid"
          },
          {
            "teamId": "pmts8ovsku8qa5",
            "role": "",
            "allocation": "40",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmts930t2i2djb",
        "name": "SPCSDD Staff 05",
        "title": "SRS-2",
        "dept": "SPCSDD",
        "managerId": "pmtqyytw8ltefp",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "",
            "type": "solid"
          },
          {
            "teamId": "pmts8ovsku8qa5",
            "role": "",
            "allocation": "70",
            "type": "solid"
          },
          {
            "teamId": "pmts8pcpqjzwkr",
            "role": "",
            "allocation": "30",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmts93qw9ifhs0",
        "name": "SPCSDD Staff 06",
        "title": "SRS-2",
        "dept": "SPCSDD",
        "managerId": "pmtqyytw8ltefp",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8pcpqjzwkr",
            "role": "",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmts94ljlqaxtl",
        "name": "(Unfilled)",
        "title": "SRS-1",
        "dept": "SPCSDD",
        "managerId": "pmtqyytw8ltefp",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8pcpqjzwkr",
            "role": "",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": true
      },
      {
        "id": "pmts96670u7yi9",
        "name": "SPCSDD Staff 07",
        "title": "SRS-1",
        "dept": "SPCSDD",
        "managerId": "pmtqyytw8ltefp",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmtqz1b1om6ckx",
            "role": "",
            "allocation": "30",
            "type": "solid"
          },
          {
            "teamId": "pmts8qj1p2wcfz",
            "role": "",
            "allocation": "70",
            "type": "solid"
          },
          {
            "teamId": "pmu3fr7r9fgxog",
            "role": "",
            "allocation": "",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmts984mo7m308",
        "name": "SMASDD Staff 07",
        "title": "PTS-5",
        "dept": "SMASDD",
        "managerId": "pmtqz052lhkfc1",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8ovsku8qa5",
            "role": "",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmts99hez62kiq",
        "name": "SECSDD Staff 07",
        "title": "PTS-IV",
        "dept": "SECSDD",
        "managerId": "pmtqyzdzrveely",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmtqz1b1om6ckx",
            "role": "",
            "allocation": "60",
            "type": "solid"
          },
          {
            "teamId": "pmts8ovsku8qa5",
            "role": "",
            "allocation": "40",
            "type": "solid"
          },
          {
            "teamId": "pmu3fjrec7qxgm",
            "role": "",
            "allocation": "",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmts9aah9zsb99",
        "name": "SPCSDD Staff 08",
        "title": "PTS-4",
        "dept": "SPCSDD",
        "managerId": "pmtqyytw8ltefp",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8q0ega4txq",
            "role": "",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmts9bwe118hva",
        "name": "SECSDD Staff 08",
        "title": "PTS-1",
        "dept": "SECSDD",
        "managerId": "pmtqyzdzrveely",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmtqz1b1om6ckx",
            "role": "",
            "allocation": "70",
            "type": "solid"
          },
          {
            "teamId": "pmts8q0ega4txq",
            "role": "",
            "allocation": "30",
            "type": "solid"
          },
          {
            "teamId": "pmu3frpwd5ndeo",
            "role": "",
            "allocation": "",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmttdo3y8giw3s",
        "name": "SMASDD Staff 08",
        "title": "PTS-1",
        "dept": "SMASDD",
        "managerId": "pmtqz052lhkfc1",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8ovsku8qa5",
            "role": "",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmttdpk8lhphwb",
        "name": "SPCSDD Staff 09",
        "title": "CIP Graduate Fellow",
        "dept": "SPCSDD",
        "managerId": "pmtqyytw8ltefp",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8q0ega4txq",
            "role": "",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmttdqhvbw69sx",
        "name": "SECSDD Staff 09",
        "title": "PTS-4",
        "dept": "SECSDD",
        "managerId": "pmtqyzdzrveely",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmtqz1b1om6ckx",
            "role": "",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmttdtl7mqwtts",
        "name": "SPCSDD Staff 10",
        "title": "PTS-3",
        "dept": "SPCSDD",
        "managerId": "pmtqyytw8ltefp",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8pcpqjzwkr",
            "role": "",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmttdvyvk3vlvb",
        "name": "SPCSDD Staff 11",
        "title": "PTS-3",
        "dept": "SPCSDD",
        "managerId": "pmtqyytw8ltefp",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8pcpqjzwkr",
            "role": "",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmttdx14m9is6n",
        "name": "SPCSDD Staff 12",
        "title": "PTS-1",
        "dept": "SPCSDD",
        "managerId": "pmtqyytw8ltefp",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8q0ega4txq",
            "role": "",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmttdxwq4xvoqo",
        "name": "SPCSDD Staff 13",
        "title": "PTA-4",
        "dept": "SPCSDD",
        "managerId": "pmtqyytw8ltefp",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8q0ega4txq",
            "role": "",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmtte1mvoq8jct",
        "name": "(Unfilled)",
        "title": "SRS-2",
        "dept": "SECSDD",
        "managerId": "pmtqyzdzrveely",
        "teams": [],
        "vacant": true
      },
      {
        "id": "pmtte25tco50n9",
        "name": "(Unfilled)",
        "title": "SRS-1",
        "dept": "SECSDD",
        "managerId": "pmtqyzdzrveely",
        "teams": [],
        "vacant": true
      },
      {
        "id": "pmtte4yxipisx1",
        "name": "(Unfilled)",
        "title": "SRS-2",
        "dept": "SMASDD",
        "managerId": "pmtqz052lhkfc1",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8ovsku8qa5",
            "role": "",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": true
      },
      {
        "id": "pmttguxxazb6dk",
        "name": "(Unfilled COS)",
        "title": "PTS-1",
        "dept": "SMASDD",
        "managerId": "pmtqz052lhkfc1",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8ovsku8qa5",
            "role": "",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": true
      },
      {
        "id": "pmttgvm8jik1gs",
        "name": "(Unfilled COS)",
        "title": "PTS-1",
        "dept": "SPCSDD",
        "managerId": "pmtqyytw8ltefp",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8pcpqjzwkr",
            "role": "",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": true
      },
      {
        "id": "pmtuueytwx4b9c",
        "name": "SMASDD Staff 09",
        "title": "PTS-4",
        "dept": "SMASDD",
        "managerId": "pmtqz052lhkfc1",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "80",
            "type": "solid"
          },
          {
            "teamId": "pmts8ovsku8qa5",
            "role": "",
            "allocation": "100",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmtuvnp05wj648",
        "name": "Deputy Director General, SOII",
        "title": "Deputy Director General",
        "dept": "SOII",
        "managerId": "pmtqtfuvv02etb",
        "teams": [],
        "vacant": false
      },
      {
        "id": "pmtuvpqtzlk1yy",
        "name": "Office of the DG Staff 01",
        "title": "Head Executive Assistant",
        "dept": "Office of the DG",
        "managerId": "ps5f6jqb2jb",
        "teams": [],
        "vacant": false
      },
      {
        "id": "ps5f6jqb2jb",
        "name": "(Hidden anchor — DDG-level)",
        "title": "",
        "dept": "",
        "managerId": "pmtqtfuvv02etb",
        "teams": [],
        "vacant": false,
        "hidden": true
      },
      {
        "id": "pmtuxq7bjwhv37",
        "name": "Chief, PPMD",
        "title": "Chief",
        "dept": "PPMD",
        "managerId": "pmtuvpqtzlk1yy",
        "teams": [],
        "vacant": true
      },
      {
        "id": "pmtuxrap8ireai",
        "name": "PPMD Staff 01",
        "title": "Planning Officer IV",
        "dept": "PPMD",
        "managerId": "pmtuxq7bjwhv37",
        "teams": [
          {
            "teamId": "pmts8vxc3azp3r",
            "role": "",
            "allocation": "",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmtuxs6f4n2ev6",
        "name": "PPMD Staff 02",
        "title": "Planning Officer III",
        "dept": "PPMD",
        "managerId": "pmtuxq7bjwhv37",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "Assistant Project Manager",
            "allocation": "",
            "type": "solid",
            "crossFunctional": true
          },
          {
            "teamId": "pmts8qj1p2wcfz",
            "role": "Project Manager",
            "allocation": "",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmtuxso0nh05ha",
        "name": "PPMD Staff 03",
        "title": "PO-I",
        "dept": "PPMD",
        "managerId": "pmtuxq7bjwhv37",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "Project Manager",
            "allocation": "",
            "type": "solid",
            "crossFunctional": true
          }
        ],
        "vacant": false
      },
      {
        "id": "pmtuxswa5mbk0f",
        "name": "PPMD Staff 04",
        "title": "PO-1",
        "dept": "PPMD",
        "managerId": "pmtuxq7bjwhv37",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "Assistant Project Manager",
            "allocation": "",
            "type": "solid",
            "crossFunctional": true
          }
        ],
        "vacant": false
      },
      {
        "id": "pmtwlr1oqmxodt",
        "name": "Director, SIIB",
        "title": "Director IV",
        "dept": "SIIB",
        "managerId": "pmtuvnp05wj648",
        "teams": [],
        "vacant": false
      },
      {
        "id": "pmtwlrlx6h0t8w",
        "name": "Chief, SMCOD",
        "title": "Chief",
        "dept": "SMCOD",
        "managerId": "pmtwlr1oqmxodt",
        "teams": [],
        "vacant": false
      },
      {
        "id": "pmtwls1r0a211h",
        "name": "SMCOD Staff 01",
        "title": "SvSRS",
        "dept": "SMCOD",
        "managerId": "pmtwlrlx6h0t8w",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "20",
            "type": "solid"
          },
          {
            "teamId": "pmtqz1b1om6ckx",
            "role": "",
            "allocation": "20",
            "type": "solid"
          },
          {
            "teamId": "pmts8vxc3azp3r",
            "role": "",
            "allocation": "",
            "type": "solid"
          }
        ],
        "vacant": false
      },
      {
        "id": "pmu3dw368i2j33",
        "name": "Director, FAS",
        "title": "Director IV",
        "dept": "FAS",
        "managerId": "pmtuvnp05wj648",
        "teams": [],
        "vacant": false
      },
      {
        "id": "pmu3dysqkktkbx",
        "name": "Chief, FD",
        "title": "Chief",
        "dept": "FD",
        "managerId": "pmu3dw368i2j33",
        "teams": [],
        "vacant": false
      },
      {
        "id": "pmu3dzf5syyb5w",
        "name": "FD Staff 01",
        "title": "SvAO",
        "dept": "FD",
        "managerId": "pmu3dysqkktkbx",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "",
            "allocation": "",
            "type": "solid",
            "crossFunctional": true
          }
        ],
        "vacant": false
      },
      {
        "id": "pmu3e2vilws7vf",
        "name": "Director, SSMB",
        "title": "Director IV",
        "dept": "SSMB",
        "managerId": "pmtqtgor3qr0qd",
        "teams": [],
        "vacant": false
      },
      {
        "id": "pmu3e3mxpyjisu",
        "name": "Chief, PRID",
        "title": "Chief",
        "dept": "PRID",
        "managerId": "pmu3e2vilws7vf",
        "teams": [],
        "vacant": false
      },
      {
        "id": "pmu3e4512kh7xo",
        "name": "PRID Staff 01",
        "title": "IO-4",
        "dept": "PRID",
        "managerId": "pmu3e3mxpyjisu",
        "teams": [
          {
            "teamId": "pmtqyjbnsc1y4k",
            "role": "Public Relations Officer",
            "allocation": "",
            "type": "solid",
            "crossFunctional": true
          }
        ],
        "vacant": false
      },
      {
        "id": "pmu4tnpl526ygj",
        "name": "(Unfilled)",
        "title": "SvSRS",
        "dept": "SMASDD",
        "managerId": "pmtqz052lhkfc1",
        "teams": [],
        "vacant": true
      }
    ],
    "teams": [
      {
        "id": "pmtqyjbnsc1y4k",
        "name": "STRONG",
        "leadIds": [
          "pmtqtgor3qr0qd"
        ],
        "purpose": "",
        "parentTeamId": null,
        "color": "#2F6F5E"
      },
      {
        "id": "pmtqz1b1om6ckx",
        "name": "MULA Constellation",
        "leadIds": [
          "pmtqyzdzrveely"
        ],
        "purpose": "",
        "parentTeamId": "pmtqyjbnsc1y4k",
        "color": "#6FA290"
      },
      {
        "id": "pmts8ovsku8qa5",
        "name": "AIT Facility and Operations",
        "leadIds": [
          "pmtqz052lhkfc1"
        ],
        "purpose": "",
        "parentTeamId": "pmtqyjbnsc1y4k",
        "color": "#2F6F5E"
      },
      {
        "id": "pmts8pcpqjzwkr",
        "name": "MAYA-7",
        "leadIds": [
          "pmts699biymigv"
        ],
        "purpose": "",
        "parentTeamId": "pmtqyjbnsc1y4k",
        "color": "#2F6F5E"
      },
      {
        "id": "pmts8q0ega4txq",
        "name": "Parts Qualification and Standards",
        "leadIds": [
          "pmts8kwmslzeox"
        ],
        "purpose": "",
        "parentTeamId": "pmtqyjbnsc1y4k",
        "color": "#2F6F5E"
      },
      {
        "id": "pmts8qj1p2wcfz",
        "name": "SIKLAB",
        "leadIds": [
          "pmts8r8dridw60",
          "pmtr08pysl6bq4"
        ],
        "purpose": "",
        "parentTeamId": "pmtqyjbnsc1y4k",
        "color": "#2F6F5E"
      },
      {
        "id": "pmts8vxc3azp3r",
        "name": "Telco Sat",
        "leadIds": [
          "pmtqywt3j6exw3"
        ],
        "purpose": "",
        "parentTeamId": null,
        "color": "#7A5C99"
      },
      {
        "id": "pmu3fjrec7qxgm",
        "name": "Mech",
        "leadIds": [
          "pmts66bsjexo3b"
        ],
        "purpose": "",
        "parentTeamId": "pmtqz1b1om6ckx",
        "color": "#6FA290"
      },
      {
        "id": "pmu3fr7r9fgxog",
        "name": "Opt",
        "leadIds": [
          "pmts8kwmslzeox"
        ],
        "purpose": "",
        "parentTeamId": "pmtqz1b1om6ckx",
        "color": "#6FA290"
      },
      {
        "id": "pmu3frpwd5ndeo",
        "name": "OBDH",
        "leadIds": [
          "pmtr087i0o5ksh"
        ],
        "purpose": "",
        "parentTeamId": "pmtqz1b1om6ckx",
        "color": "#6FA290"
      },
      {
        "id": "srr2026",
        "name": "SRR",
        "leadIds": [],
        "purpose": "2026 project — separate from the 2027 programs",
        "parentTeamId": null,
        "color": "#A65B3F",
        "separate": true
      }
    ],
    "savedAt": "2026-09-29T00:00:00.000Z"
  };
  var EPOCH = "1970-01-01T00:00:00Z";

  var state = {
    people: [],       // {id, name, title, managerId, dept, teams:[{teamId, role, allocation, type}]}
    teams: [],        // {id, name, leadIds:[], purpose, color} — leadIds supports co-leadership (more than one lead per team)
    collapsed: new Set(),
    search: "",
    // Zoom is tracked per view, so zooming the Matrix doesn't shrink the
    // tree and vice versa — each tab keeps whatever level it was left at.
    zooms: { tree: 1, matrix: 1, strongtree: 1, mulatree: 1, srrtree: 1 },
    editingId: null,
    editingTeamId: null,
    dimDept: null,
    overlayTeamId: "",
    view: "tree",
    hoverId: null,
    savedAt: null
  };
  // Each view snaps to "fit width" the first time it is shown, and not again
  // after that — render() runs on every edit, and re-fitting there would yank
  // the zoom out from under anyone who set it by hand.
  var didFitView = { tree: false, matrix: false, strongtree: false, mulatree: false, srrtree: false };
  // A view lands here once its +/- buttons have been used, so a window resize
  // leaves a zoom the user chose deliberately alone.
  var zoomTouched = {};

  // ---------- storage ----------
  // Three possible sources of data: the baseline embedded above, this
  // browser's localStorage save, and (when reachable) the stmsb-strong-chart-2027.json
  // file. Each carries a `savedAt` timestamp; whichever is newest wins, so an
  // edit made here always shows up on reload without discarding newer edits
  // made directly in the browser, and vice versa.
  // A team used to carry a single `leadId`. Teams can now have more than one
  // lead (`leadIds`, an array) so co-leadership can be represented directly —
  // this upgrades any older data (the embedded baseline, a browser's
  // localStorage save, or a .json file exported before this change) the
  // moment it loads, without losing whichever single lead was already set.
  function migrateTeam(t){
    var leadIds = Array.isArray(t.leadIds) ? t.leadIds.slice() : (t.leadId ? [t.leadId] : []);
    var out = { id: t.id, name: t.name, leadIds: leadIds, purpose: t.purpose || '', parentTeamId: t.parentTeamId || null };
    if (t.color) out.color = t.color;
    if (t.separate) out.separate = true;
    return out;
  }
  function normalizeLoaded(json){
    if (!json) return { people: [], teams: [], savedAt: EPOCH };
    if (Array.isArray(json)) return { people: json, teams: [], savedAt: EPOCH };
    return { people: json.people || [], teams: (json.teams || []).map(migrateTeam), savedAt: json.savedAt || EPOCH };
  }
  function readLocalSave(){
    try{
      var raw = localStorage.getItem(LOCAL_KEY);
      if (!raw) return null;
      return normalizeLoaded(JSON.parse(raw));
    }catch(e){ return null; }
  }
  function newer(a, b){ return a.savedAt > b.savedAt ? a : b; }
  function loadData(){
    var baseline = normalizeLoaded(BASELINE_DATA);
    var local = readLocalSave();
    var winner = local ? newer(baseline, local) : baseline;
    applyData(winner);

    if (window.fetch){
      fetch(DATA_URL, { cache: "no-store" })
        .then(function(res){ if (!res.ok) throw new Error("bad status"); return res.json(); })
        .then(function(json){
          var fromFile = normalizeLoaded(json);
          if (fromFile.savedAt > state.savedAt) applyData(fromFile);
        })
        .catch(function(){ /* fetch of a local file is blocked in most browsers — fine, we already rendered */ });
    }
  }
  function applyData(d){
    state.people = d.people;
    state.teams = d.teams;
    state.savedAt = d.savedAt || EPOCH;
    // Bring localStorage up to date with whichever source just won, so the
    // next load starts from here instead of re-comparing stale data.
    try{ localStorage.setItem(LOCAL_KEY, JSON.stringify({ people: state.people, teams: state.teams, savedAt: state.savedAt })); }catch(e){}
    ensureSrrTeam();
    ensureTeamLeadMemberships();
    refreshOverlaySelect();
    // Fresh data can change how wide things are, so let each view fit once
    // more — except where the user has already set a zoom by hand.
    Object.keys(didFitView).forEach(function(k){ if (!zoomTouched[k]) didFitView[k] = false; });
    setView(state.view || "tree");
  }
  var saveTimer = null;
  function persist(){
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function(){
      state.savedAt = new Date().toISOString();
      try{
        localStorage.setItem(LOCAL_KEY, JSON.stringify({ people: state.people, teams: state.teams, savedAt: state.savedAt }));
      }catch(e){}
    }, 250);
  }

  // ---------- helpers ----------
  function uid(){ return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
  function byId(id){ return state.people.find(function(p){ return p.id === id; }); }
  function teamById(id){ return state.teams.find(function(t){ return t.id === id; }); }
  function teamChildren(id){ return state.teams.filter(function(t){ return t.parentTeamId === id; }).map(function(t){ return t.id; }); }
  function teamDescendantsOf(id){
    var out = []; var stack = teamChildren(id);
    while(stack.length){ var c = stack.pop(); out.push(c); stack = stack.concat(teamChildren(c)); }
    return out;
  }
  function teamDepth(t){
    var depth = 0, p = t && t.parentTeamId, guard = 0;
    while(p && guard < 30){ depth++; var parent = teamById(p); p = parent && parent.parentTeamId; guard++; }
    return depth;
  }
  function getChildren(id){ return state.people.filter(function(p){ return p.managerId === id; }).map(function(p){ return p.id; }); }
  function isHidden(id){ var p = byId(id); return !!(p && p.hidden); }
  // A `hidden` person is a placeholder, not a real position — used to anchor
  // someone's card at a deeper visual tier without claiming a manager they
  // don't actually have. It still occupies a real row in the tree (so
  // everything below it sits at the depth that row implies), it just never
  // gets its own card or its own connector segment: displayChildren() skips
  // straight past it to whoever the placeholder is standing in for, so the
  // reporting line still draws as one continuous line from the real manager
  // down to the real person, with nothing visibly occupying the row between.
  function displayChildren(id){
    var out = [];
    getChildren(id).forEach(function(cid){
      if (isHidden(cid)) out = out.concat(displayChildren(cid));
      else out.push(cid);
    });
    return out;
  }
  function visiblePeople(){ return state.people.filter(function(p){ return !p.hidden; }); }
  function getRoots(){
    var ids = {}; state.people.forEach(function(p){ ids[p.id]=true; });
    return state.people.filter(function(p){ return !p.managerId || !ids[p.managerId] || p.managerId === p.id; }).map(function(p){ return p.id; });
  }
  function descendantsOf(id){
    var out = []; var stack = getChildren(id);
    while(stack.length){ var c = stack.pop(); out.push(c); stack = stack.concat(getChildren(c)); }
    return out;
  }
  function deptColor(dept){
    if (!dept) return "#8A9188";
    var s = 0; for (var i=0;i<dept.length;i++){ s += dept.charCodeAt(i); }
    return PALETTE[s % PALETTE.length];
  }
  function cardColor(p){ return p.vacant ? VACANT_COLOR : deptColor(p.dept); }
  function teamColor(t){ return t.color || deptColor(t.name); }
  function distinctDepts(){
    var set = {}; state.people.forEach(function(p){ if(p.dept) set[p.dept]=true; });
    return Object.keys(set).sort();
  }
  // Top-level teams first, each immediately followed by its own subprojects —
  // used everywhere teams are listed so a subproject always reads as nested
  // under its parent instead of scattered in creation order.
  function orderedTeams(){
    var out = [];
    var seen = {};
    state.teams.filter(function(t){ return !t.parentTeamId; }).forEach(function(t){
      out.push(t); seen[t.id] = true;
      state.teams.filter(function(s){ return s.parentTeamId === t.id; }).forEach(function(s){ out.push(s); seen[s.id] = true; });
    });
    state.teams.forEach(function(t){ if (!seen[t.id]) out.push(t); }); // orphaned subprojects (parent deleted)
    return out;
  }
  function escapeHtml(s){
    return (s||"").replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }
  function personTeamEntry(p, teamId){ return (p.teams||[]).find(function(t){ return t.teamId === teamId; }); }
  function teamMembers(teamId){
    return state.people.filter(function(p){ return (p.teams||[]).some(function(t){ return t.teamId === teamId; }); }).map(function(p){ return p.id; });
  }
  // Only top-level team allocations count toward a person's overall-capacity
  // total. A subproject's allocation is a slice of its parent's (e.g. 70%
  // MULA inside an 80% STRONG commitment), not additional load on top of it,
  // so it's shown for reference but excluded here to avoid double-counting.
  // SRR is a 2026 project, so it never overlaps in time with the programs
  // that start in 2027 — a separate team (or anything under one) is left out
  // of the capacity total instead of being stacked on top of 2027 work.
  function allocationTotal(p){
    return (p.teams||[]).reduce(function(sum,t){
      var team = teamById(t.teamId);
      if (team && team.parentTeamId) return sum;
      if (team && isSeparateTeam(team)) return sum;
      var n = parseFloat(t.allocation);
      return sum + (isNaN(n)?0:n);
    }, 0);
  }
  // A "separate" team is a standalone project on its own timeline (SRR, 2026).
  // Its subprojects inherit that, however deep they sit.
  function isSeparateTeam(t){
    var guard = 0;
    while (t && guard++ < 50){
      if (t.separate) return true;
      t = t.parentTeamId ? teamById(t.parentTeamId) : null;
    }
    return false;
  }
  // The SRR tab needs an "SRR" team to draw. Older saves (this browser's
  // localStorage, or a JSON exported before SRR existed) won't have one, so
  // it's added here on load if missing — matched by name, so renaming or
  // re-creating it by hand still works.
  var SRR_TEAM_NAME = 'SRR';
  function srrTeam(){ return state.teams.find(function(t){ return t.name === SRR_TEAM_NAME; }); }
  function ensureSrrTeam(){
    var t = srrTeam();
    if (t){ t.separate = true; return; }
    state.teams.push({ id: 'srr2026', name: SRR_TEAM_NAME, leadIds: [], purpose: '2026 project — separate from the 2027 programs', parentTeamId: null, color: '#A65B3F', separate: true });
  }
  function ensureTeamLeadMemberships(){
    state.teams.forEach(function(team){
      (team.leadIds || []).forEach(function(leadId){
        var p = byId(leadId);
        if (!p) return;
        p.teams = p.teams || [];
        if (!personTeamEntry(p, team.id)){
          p.teams.push({ teamId: team.id, role:'Lead', allocation:'', type:'solid' });
        }
      });
    });
  }
  function hexToTint(hex){
    var r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    return 'rgba('+r+','+g+','+b+',0.13)';
  }

  // ---------- tree layout ----------
  // A parent with more than GRID_THRESHOLD childless children (typical of a
  // flat roster of division/unit leads or admin staff with no reports of
  // their own) gets those children wrapped into a fixed 2-column block
  // instead of spreading them into one wide row — this is what keeps a wide
  // division row from forcing horizontal scrolling. Children that have their
  // own reports always stay as normal individual branches, since a subtree
  // needs to hang below them.
  function gridWidth(n){
    var cols = Math.min(GRID_COLS, n);
    return cols*CARD_W + (cols-1)*H_GAP;
  }
  function gridHeight(n){
    var rows = Math.ceil(n / GRID_COLS);
    return rows*CARD_H + (rows-1)*GRID_ROW_GAP;
  }
  function getChildUnits(id){
    var children = state.collapsed.has(id) ? [] : getChildren(id);
    var leaves = [];
    var plainBranches = [];
    // A branch whose own children are all leaves sharing its department is a
    // division/office lead sitting over their own staff — the chief belongs
    // inside that section box too (as its top card), not floating above it
    // as a separate node with the box hanging below.
    var chiefUnits = [];
    children.forEach(function(c){
      var kids = getChildren(c);
      if (kids.length === 0){ leaves.push(c); return; }
      if (state.collapsed.has(c)){ plainBranches.push(c); return; }
      var cDept = ((byId(c) || {}).dept || '').trim();
      var allLeafKids = kids.every(function(k){ return getChildren(k).length === 0; });
      var allSameDept = cDept && kids.every(function(k){ return ((byId(k)||{}).dept||'').trim() === cDept; });
      if (allLeafKids && allSameDept){
        chiefUnits.push({ headId: c, dept: cDept, staffIds: kids });
      } else {
        plainBranches.push(c);
      }
    });
    var units = [];

    // Group leaves into named sections wherever two or more of them share a
    // department — this is the "Legal Section", "Registration Section" etc.
    // pattern from a real government org chart: a labeled office box holding
    // a stack of people, instead of an anonymous grid. Leaves left over
    // (unique or missing department) fall back to the old flat layout.
    var byDept = {}, deptOrder = [], ungrouped = [];
    leaves.forEach(function(c){
      var d = ((byId(c)||{}).dept || '').trim();
      if (!d){ ungrouped.push(c); return; }
      if (!byDept[d]){ byDept[d] = []; deptOrder.push(d); }
      byDept[d].push(c);
    });
    deptOrder.forEach(function(d){
      var ids = byDept[d];
      if (ids.length >= 2) units.push({ type: 'section', dept: d, ids: ids });
      else ungrouped = ungrouped.concat(ids);
    });
    if (ungrouped.length > GRID_THRESHOLD){
      units.push({ type: 'grid', ids: ungrouped });
    } else {
      ungrouped.forEach(function(c){ units.push({ type: 'single', id: c }); });
    }
    chiefUnits.forEach(function(cu){
      units.push({ type: 'section', dept: cu.dept, headId: cu.headId, ids: cu.staffIds });
    });
    plainBranches.forEach(function(c){ units.push({ type: 'single', id: c }); });
    return units;
  }
  function sectionCols(n){ return Math.max(1, Math.min(SECTION_COLS, n)); }
  // A merged chief+staff section gives the chief their own full row up top,
  // with the staff filling a grid below — the column count (and so the
  // box's width) is driven by the staff count alone.
  function sectionWidth(u){
    var cols = sectionCols(u.headId ? Math.max(u.ids.length, 1) : u.ids.length);
    return cols*CARD_W + (cols-1)*H_GAP + SECTION_PAD*2;
  }
  function sectionHeight(u){
    var n = u.ids.length;
    if (u.headId){
      var cols = sectionCols(Math.max(n, 1));
      var rows = n ? Math.ceil(n/cols) : 0;
      var staffH = rows ? SECTION_HEAD_GAP + rows*CARD_H + (rows-1)*SECTION_GAP : 0;
      return SECTION_HEADER_H + SECTION_PAD + CARD_H + staffH + SECTION_PAD;
    }
    var cols2 = sectionCols(n), rows2 = Math.ceil(n/cols2);
    return SECTION_HEADER_H + SECTION_PAD + rows2*CARD_H + (rows2-1)*SECTION_GAP + SECTION_PAD;
  }
  function unitWidth(widths, u){
    if (u.type === 'grid') return gridWidth(u.ids.length);
    if (u.type === 'section') return sectionWidth(u);
    return widths[u.id];
  }

  function computeWidths(){
    var widths = {};
    function widthOf(id){
      if (widths[id] !== undefined) return widths[id];
      widths[id] = CARD_W; // placeholder to break any accidental cycles during recursion
      var units = getChildUnits(id);
      var w;
      if (units.length === 0) w = CARD_W;
      else {
        var sum = 0;
        units.forEach(function(u){
          if (u.type === 'single') widthOf(u.id);
          sum += unitWidth(widths, u);
        });
        sum += H_GAP * (units.length - 1);
        w = Math.max(CARD_W, sum);
      }
      widths[id] = w;
      return w;
    }
    getRoots().forEach(widthOf);
    return widths;
  }
  function computeLayout(){
    var widths = computeWidths();
    var positions = {};
    var curX = MARGIN;
    var maxDepth = 0;
    var maxBottomY = 0;
    // Grid blocks get ONE trunk connector from the parent to the box, not one
    // line per card — routing an elbow line to each card individually would
    // have to run straight through whichever cards sit above it in the same
    // column, reading as a false connection between them.
    var gridBlocks = [];
    // Sections get the same single-trunk treatment as grid blocks, but stack
    // their members in one column inside a labeled box instead of a
    // 2-column grid — a section reads as one office, not a row of unrelated
    // reports.
    var sectionBlocks = [];
    function placeGrid(parentId, ids, blockX, depth){
      var cols = Math.min(GRID_COLS, ids.length);
      var y0 = MARGIN + depth * V_GAP;
      ids.forEach(function(id, i){
        var col = i % cols, row = Math.floor(i / cols);
        var cx = blockX + col*(CARD_W+H_GAP) + CARD_W/2;
        var cy = y0 + row*(CARD_H+GRID_ROW_GAP);
        positions[id] = { x: cx-CARD_W/2, y: cy, centerX: cx, width: CARD_W };
        if (cy+CARD_H > maxBottomY) maxBottomY = cy+CARD_H;
      });
      if (y0+CARD_H > maxBottomY) maxBottomY = y0+CARD_H;
      var blockW = gridWidth(ids.length), blockH = gridHeight(ids.length);
      gridBlocks.push({ parentId: parentId, ids: ids.slice(), x: blockX, y: y0, width: blockW, height: blockH, centerX: blockX + blockW/2 });
    }
    function placeSection(parentId, u, blockX, depth){
      var y0 = MARGIN + depth * V_GAP;
      var w = sectionWidth(u);
      var top = y0 + SECTION_HEADER_H + SECTION_PAD;
      var allIds = u.headId ? [u.headId].concat(u.ids) : u.ids.slice();
      if (u.headId){
        var headCx = blockX + SECTION_PAD + CARD_W/2;
        positions[u.headId] = { x: headCx - CARD_W/2, y: top, centerX: headCx, width: CARD_W };
        if (top+CARD_H > maxBottomY) maxBottomY = top+CARD_H;
        var staffTop = top + CARD_H + SECTION_HEAD_GAP;
        var cols = sectionCols(Math.max(u.ids.length, 1));
        u.ids.forEach(function(id, i){
          var col = i % cols, row = Math.floor(i / cols);
          var cx = blockX + SECTION_PAD + col*(CARD_W+H_GAP) + CARD_W/2;
          var y = staffTop + row*(CARD_H + SECTION_GAP);
          positions[id] = { x: cx - CARD_W/2, y: y, centerX: cx, width: CARD_W };
          if (y+CARD_H > maxBottomY) maxBottomY = y+CARD_H;
        });
      } else {
        var cols2 = sectionCols(u.ids.length);
        u.ids.forEach(function(id, i){
          var col = i % cols2, row = Math.floor(i / cols2);
          var cx = blockX + SECTION_PAD + col*(CARD_W+H_GAP) + CARD_W/2;
          var y = top + row*(CARD_H + SECTION_GAP);
          positions[id] = { x: cx - CARD_W/2, y: y, centerX: cx, width: CARD_W };
          if (y+CARD_H > maxBottomY) maxBottomY = y+CARD_H;
        });
      }
      var h = sectionHeight(u);
      if (y0+h > maxBottomY) maxBottomY = y0+h;
      sectionBlocks.push({ parentId: parentId, dept: u.dept, headId: u.headId||null, ids: allIds, x: blockX, y: y0, width: w, height: h, centerX: blockX + w/2 });
    }
    function place(id, x, depth){
      var w = widths[id];
      var centerX = x + w/2;
      var y = MARGIN + depth * V_GAP;
      positions[id] = { x: centerX - CARD_W/2, y: y, centerX: centerX, width: w };
      if (depth > maxDepth) maxDepth = depth;
      if (y+CARD_H > maxBottomY) maxBottomY = y+CARD_H;
      var units = getChildUnits(id);
      if (units.length){
        var uWidths = units.map(function(u){ return unitWidth(widths, u); });
        var totalW = uWidths.reduce(function(a,b){return a+b;},0) + H_GAP*(units.length-1);
        var childX = centerX - totalW/2;
        units.forEach(function(u, i){
          if (u.type === 'single') place(u.id, childX, depth+1);
          else if (u.type === 'section') placeSection(id, u, childX, depth+1);
          else placeGrid(id, u.ids, childX, depth+1);
          childX += uWidths[i] + H_GAP;
        });
      }
    }
    getRoots().forEach(function(rootId){
      var w = widths[rootId];
      place(rootId, curX, 0);
      curX += w + ROOT_GAP;
    });
    var totalWidth = Math.max(curX - ROOT_GAP + MARGIN, 400);
    var totalHeight = Math.max(MARGIN*2 + maxDepth*V_GAP + CARD_H, maxBottomY + MARGIN);
    return { positions: positions, totalWidth: totalWidth, totalHeight: totalHeight, gridBlocks: gridBlocks, sectionBlocks: sectionBlocks };
  }

  // ---------- search ----------
  function matchedIds(){
    var q = state.search.trim().toLowerCase();
    if (!q) return null;
    var out = {};
    visiblePeople().forEach(function(p){
      if ((p.name||"").toLowerCase().indexOf(q) !== -1 || (p.title||"").toLowerCase().indexOf(q) !== -1){
        out[p.id] = true;
      }
    });
    return out;
  }
  function expandAncestors(id){
    var cur = byId(id);
    while (cur && cur.managerId){
      state.collapsed.delete(cur.managerId);
      cur = byId(cur.managerId);
    }
  }

  // ---------- top-level render ----------
  function render(){
    var headcountN = visiblePeople().length;
    document.getElementById('headcount').textContent = headcountN + (headcountN === 1 ? " person" : " people");
    var tc = document.getElementById('teamcount');
    if (state.teams.length){
      tc.style.display = 'inline-block';
      tc.textContent = state.teams.length + (state.teams.length === 1 ? ' team' : ' teams');
    } else { tc.style.display = 'none'; }
    renderTree();
    renderMatrix();
    renderStrongTree();
    renderMulaTree();
    renderSrrTree();
    applyViewZoom();
  }

  function renderTree(){
    var empty = document.getElementById('emptyState');
    var spacer = document.getElementById('stageSpacer');
    if (state.people.length === 0){
      empty.style.display = 'flex';
      spacer.style.display = 'none';
      renderLegend();
      return;
    }
    empty.style.display = 'none';
    spacer.style.display = 'block';

    var matches = matchedIds();
    if (matches){ Object.keys(matches).forEach(expandAncestors); }

    var layout = computeLayout();
    var stage = document.getElementById('stage');
    var cardsLayer = document.getElementById('cardsLayer');
    var svg = document.getElementById('connectors');

    stage.style.width = layout.totalWidth + 'px';
    stage.style.height = layout.totalHeight + 'px';
    var treeZoom = zoomOf('tree');
    stage.style.transform = 'scale(' + treeZoom + ')';
    document.getElementById('stageSpacer').style.width = (layout.totalWidth * treeZoom) + 'px';
    document.getElementById('stageSpacer').style.height = (layout.totalHeight * treeZoom) + 'px';
    svg.setAttribute('width', layout.totalWidth);
    svg.setAttribute('height', layout.totalHeight);

    var svgParts = [];
    var cardParts = [];
    var overlayTeam = state.overlayTeamId ? teamById(state.overlayTeamId) : null;

    // Members of a grid block get their trunk connector drawn once, below —
    // skip them in the normal per-child connector loop so they don't also
    // get an individual elbow line running through the cards above them.
    var gridMemberOf = {};
    layout.gridBlocks.forEach(function(b){ b.ids.forEach(function(id){ gridMemberOf[id] = b.parentId; }); });
    var sectionMemberOf = {};
    layout.sectionBlocks.forEach(function(b){ b.ids.forEach(function(id){ sectionMemberOf[id] = b.parentId; }); });

    state.people.forEach(function(p){
      var pos = layout.positions[p.id];
      if (!pos) return;
      // A hidden placeholder gets no card and no connector segment of its
      // own — whoever it's standing in for is drawn straight from its
      // nearest visible ancestor instead (see the ancestor's own iteration,
      // which uses displayChildren() to reach past it).
      if (p.hidden) return;
      var children = getChildren(p.id);
      var visibleChildren = state.collapsed.has(p.id) ? [] : children;
      var lineTargets = state.collapsed.has(p.id) ? [] : displayChildren(p.id);

      // Reporting-line connectors. When a card has exactly one visible report
      // directly beneath it (the common case in a rank ladder like SvSRS →
      // Senior SRS → SRS-1), that report sits at the same centerX as the
      // parent, so the line runs straight down — no elbow jog, so a long
      // chain reads as one continuous spine instead of a series of separate
      // bent segments. An elbow (with a horizontal bus to fan out) is only
      // used where a card actually has multiple reports to spread sideways.
      lineTargets.forEach(function(cid){
        // A boxed member's connection is drawn once, as the box's own trunk
        // line — including a merged chief, whose real children live inside
        // the same box, so no internal line is needed for them either.
        if (gridMemberOf[cid] !== undefined || sectionMemberOf[cid] !== undefined) return;
        var cpos = layout.positions[cid];
        if (!cpos) return;
        var straight = lineTargets.length === 1 && cpos.centerX === pos.centerX;
        var pts = straight
          ? [pos.centerX + ',' + (pos.y + CARD_H), cpos.centerX + ',' + cpos.y].join(' ')
          : [
              pos.centerX + ',' + (pos.y + CARD_H),
              pos.centerX + ',' + (pos.y + CARD_H + ELBOW_JOG),
              cpos.centerX + ',' + (pos.y + CARD_H + ELBOW_JOG),
              cpos.centerX + ',' + cpos.y
            ].join(' ');
        var isHoverLine = state.hoverId && (state.hoverId === p.id || state.hoverId === cid);
        var isFaded = state.hoverId && !isHoverLine;
        var lineCls = 'connector-line' + (straight ? ' straight' : '') + (isHoverLine ? ' active' : '') + (isFaded ? ' faded' : '');
        var dotCls = 'connector-dot' + (isHoverLine ? ' active' : '') + (isFaded ? ' faded' : '');
        svgParts.push('<polyline class="' + lineCls + '" data-from="' + p.id + '" data-to="' + cid + '" points="' + pts + '" stroke-linejoin="round"/>');
        svgParts.push('<circle class="' + dotCls + '" data-from="' + p.id + '" cx="' + pos.centerX + '" cy="' + (pos.y + CARD_H) + '" r="3.25"/>');
        svgParts.push('<circle class="' + dotCls + '" data-to="' + cid + '" cx="' + cpos.centerX + '" cy="' + cpos.y + '" r="3.25"/>');
      });

      var color = cardColor(p);
      var isMatch = matches && matches[p.id];
      var isDim = false;
      if (state.dimDept){ isDim = p.dept !== state.dimDept; }
      else if (overlayTeam){ isDim = !personTeamEntry(p, overlayTeam.id); }
      var inSection = sectionMemberOf[p.id] !== undefined;
      var classes = 'card' + (isMatch ? ' match' : '') + (isDim ? ' dim' : '') + (p.vacant ? ' vacant' : '') + (inSection ? ' in-section' : '');
      cardParts.push(
        '<div class="' + classes + '" data-id="' + p.id + '" style="left:' + pos.x + 'px; top:' + pos.y + 'px;" tabindex="0">' +
          '<div class="card-accent" style="background:' + color + '"></div>' +
          '<div class="card-body">' +
            '<div class="card-name">' + escapeHtml(p.name) + '</div>' +
            (p.title ? '<div class="card-title">' + escapeHtml(p.title) + '</div>' : '') +
            (!inSection && p.dept ? '<div class="card-dept" style="color:' + color + '">' + escapeHtml(p.dept) + '</div>' : '') +
          '</div>' +
          '<button class="quick-add" data-quickadd="' + p.id + '" title="Add direct report">+</button>' +
          (children.length ? '<button class="collapse-toggle" data-toggle="' + p.id + '" style="top:' + CARD_H + 'px;">' + (state.collapsed.has(p.id) ? children.length : '–') + '</button>' : '') +
        '</div>'
      );
    });

    // One trunk connector + a grouping box per grid/section block, instead of
    // one line per member (see the skip above). Box fills are painted AFTER
    // every ordinary reporting line (so a line that geometrically passes
    // behind a box — e.g. the horizontal bus of a wide fan-out — disappears
    // under it instead of drawing over it), and each box's own trunk line
    // is painted last, on top of its box, so that one stays visible.
    var boxFillParts = [];
    var boxTrunkParts = [];
    layout.gridBlocks.forEach(function(b){
      var ppos = layout.positions[b.parentId];
      if (!ppos) return;
      var topCenterX = b.centerX, topY = b.y;
      var midY = ppos.y + CARD_H + ELBOW_JOG;
      var pts = [
        ppos.centerX + ',' + (ppos.y + CARD_H),
        ppos.centerX + ',' + midY,
        topCenterX + ',' + midY,
        topCenterX + ',' + topY
      ].join(' ');
      var isHoverLine = state.hoverId && (state.hoverId === b.parentId || b.ids.indexOf(state.hoverId) !== -1);
      var isFaded = state.hoverId && !isHoverLine;
      var lineCls = 'connector-line' + (isHoverLine ? ' active' : '') + (isFaded ? ' faded' : '');
      var dotCls = 'connector-dot' + (isHoverLine ? ' active' : '') + (isFaded ? ' faded' : '');
      var boxCls = 'grid-block-box' + (isHoverLine ? ' active' : '') + (isFaded ? ' faded' : '');
      boxFillParts.push('<rect class="' + boxCls + '" x="' + (b.x-8) + '" y="' + (b.y-8) + '" width="' + (b.width+16) + '" height="' + (b.height+16) + '" rx="10"/>');
      boxTrunkParts.push('<polyline class="' + lineCls + '" points="' + pts + '" stroke-linejoin="round"/>');
      boxTrunkParts.push('<circle class="' + dotCls + '" cx="' + ppos.centerX + '" cy="' + (ppos.y + CARD_H) + '" r="3.25"/>');
      boxTrunkParts.push('<circle class="' + dotCls + '" cx="' + topCenterX + '" cy="' + topY + '" r="3.25"/>');
    });
    // Section boxes: same single-trunk connector as a grid block, but a
    // solid tinted box (not dashed — a section is a real office, not a
    // loose catch-all) with a header label naming the department.
    var sectionLabelParts = [];
    layout.sectionBlocks.forEach(function(b){
      var ppos = layout.positions[b.parentId];
      if (!ppos) return;
      var topCenterX = b.centerX, topY = b.y;
      var midY = ppos.y + CARD_H + ELBOW_JOG;
      var pts = [
        ppos.centerX + ',' + (ppos.y + CARD_H),
        ppos.centerX + ',' + midY,
        topCenterX + ',' + midY,
        topCenterX + ',' + topY
      ].join(' ');
      var isHoverLine = state.hoverId && (state.hoverId === b.parentId || b.ids.indexOf(state.hoverId) !== -1);
      var isFaded = state.hoverId && !isHoverLine;
      var lineCls = 'connector-line' + (isHoverLine ? ' active' : '') + (isFaded ? ' faded' : '');
      var dotCls = 'connector-dot' + (isHoverLine ? ' active' : '') + (isFaded ? ' faded' : '');
      var boxCls = 'section-box' + (isHoverLine ? ' active' : '') + (isFaded ? ' faded' : '');
      var sColor = deptColor(b.dept);
      boxFillParts.push('<rect class="' + boxCls + '" x="' + b.x + '" y="' + b.y + '" width="' + b.width + '" height="' + b.height + '" rx="10" style="fill:' + hexToTint(sColor) + '; stroke:' + sColor + ';"/>');
      boxTrunkParts.push('<polyline class="' + lineCls + '" points="' + pts + '" stroke-linejoin="round"/>');
      boxTrunkParts.push('<circle class="' + dotCls + '" cx="' + ppos.centerX + '" cy="' + (ppos.y + CARD_H) + '" r="3.25"/>');
      boxTrunkParts.push('<circle class="' + dotCls + '" cx="' + topCenterX + '" cy="' + topY + '" r="3.25"/>');
      sectionLabelParts.push(
        '<div class="section-label' + (isFaded ? ' faded' : '') + '" style="left:' + b.x + 'px; top:' + b.y + 'px; width:' + b.width + 'px; color:' + sColor + ';">' +
          '<span class="lbl-text">' + escapeHtml(b.dept) + '</span>' +
          '<span class="lbl-count">' + b.ids.length + '</span>' +
          '<button class="section-add" data-quickadd="' + (b.headId || b.parentId) + '" data-quickadd-dept="' + escapeHtml(b.dept) + '" title="Add to ' + escapeHtml(b.dept) + '">+</button>' +
        '</div>'
      );
    });
    svgParts = svgParts.concat(boxFillParts, boxTrunkParts);

    if (overlayTeam){
      var memberIds = teamMembers(overlayTeam.id);
      var leadIds = (overlayTeam.leadIds || []).filter(function(id){ return layout.positions[id]; });
      var color2 = teamColor(overlayTeam);
      if (leadIds.length){
        var nonLeadMembers = memberIds.filter(function(mid){ return leadIds.indexOf(mid) === -1; });
        // Every lead gets an arc to every non-lead member — with co-leads this
        // draws more than one arc into a shared member, which is the point:
        // it shows the member is reached through either lead.
        leadIds.forEach(function(leadId){
          var a = layout.positions[leadId];
          nonLeadMembers.forEach(function(mid){
            var b = layout.positions[mid];
            if (!b) return;
            var x1=a.centerX, y1=a.y+CARD_H/2, x2=b.centerX, y2=b.y+CARD_H/2;
            var mx=(x1+x2)/2, my=(y1+y2)/2 - 40;
            var entry = personTeamEntry(byId(mid), overlayTeam.id);
            var dash = (entry && entry.type === 'dotted') ? '2,4' : '7,4';
            svgParts.push('<path class="overlay-arc" d="M '+x1+','+y1+' Q '+mx+','+my+' '+x2+','+y2+'" stroke="'+color2+'" stroke-dasharray="'+dash+'" fill="none" stroke-width="1.75"/>');
          });
        });
        // Co-leads also get a distinct solid line straight to each other, so
        // the shared leadership itself is visible, not just their shared reports.
        for (var li=0; li<leadIds.length; li++){
          for (var lj=li+1; lj<leadIds.length; lj++){
            var a2 = layout.positions[leadIds[li]], b2 = layout.positions[leadIds[lj]];
            var lx1=a2.centerX, ly1=a2.y+CARD_H/2, lx2=b2.centerX, ly2=b2.y+CARD_H/2;
            var lmx=(lx1+lx2)/2, lmy=(ly1+ly2)/2 - 40;
            svgParts.push('<path class="overlay-arc overlay-colead" d="M '+lx1+','+ly1+' Q '+lmx+','+lmy+' '+lx2+','+ly2+'" stroke="'+color2+'" fill="none" stroke-width="2.5"/>');
          }
        }
      }
    }

    svg.innerHTML = svgParts.join('');
    cardsLayer.innerHTML = cardParts.concat(sectionLabelParts).join('');

    renderLegend();

    if (matches){
      var firstId = Object.keys(matches)[0];
      if (firstId){
        var el = cardsLayer.querySelector('[data-id="' + firstId + '"]');
        if (el) setTimeout(function(){ el.scrollIntoView({ behavior:'smooth', block:'center', inline:'center' }); }, 30);
      }
    }
  }

  function renderLegend(){
    var depts = distinctDepts();
    var legend = document.getElementById('legend');
    if (!depts.length){ legend.style.display = 'none'; return; }
    legend.style.display = 'flex';
    legend.innerHTML = depts.map(function(d){
      var dim = state.dimDept && state.dimDept !== d ? ' dim' : '';
      return '<button class="legend-chip' + dim + '" data-dept="' + escapeHtml(d) + '">' +
        '<span class="legend-dot" style="background:' + deptColor(d) + '"></span>' + escapeHtml(d) + '</button>';
    }).join('') + (state.dimDept ? '<button class="legend-chip" data-dept="__clear__">Show all</button>' : '');
  }

  // ---------- matrix ----------
  function renderMatrix(){
    var wrap = document.getElementById('matrixWrap');
    if (!state.people.length){
      wrap.innerHTML = '<div class="matrix-empty-wrap"><div class="empty-state" style="position:static;"><h2>Nothing charted yet</h2><p>Add people first, then create teams to see who overlaps where.</p></div></div>';
      return;
    }
    var q = state.search.trim().toLowerCase();
    var rows = visiblePeople().slice().sort(function(a,b){ return a.name.localeCompare(b.name); });
    if (q){ rows = rows.filter(function(p){ return (p.name+' '+(p.title||'')+' '+(p.dept||'')).toLowerCase().indexOf(q) !== -1; }); }

    var teams = orderedTeams();
    var html = '<table class="matrix-table"><thead><tr><th class="sticky-col">Person</th>';
    teams.forEach(function(t){
      var leads = (t.leadIds || []).map(byId).filter(Boolean);
      var parent = t.parentTeamId ? teamById(t.parentTeamId) : null;
      html += '<th class="' + (parent ? 'subproject-col' : '') + '" style="border-top:3px solid ' + teamColor(t) + '">' +
        (parent ? '<div class="subproject-of">↳ of ' + escapeHtml(parent.name) + '</div>' : '') +
        escapeHtml(t.name) + (isSeparateTeam(t) ? '<span class="period-badge">2026</span>' : '') +
        (leads.length ? '<div class="th-sub">' + (leads.length > 1 ? 'Leads: ' : 'Lead: ') + leads.map(function(l){ return escapeHtml(l.name); }).join(', ') + '</div>' : '<div class="th-sub th-warn">No lead set</div>') +
        '</th>';
    });
    html += '<th class="sticky-col-right">Total<div class="th-sub">top-level, 2027</div></th></tr></thead><tbody>';

    if (!rows.length){
      html += '<tr><td colspan="' + (teams.length+2) + '" style="text-align:center; color:var(--ink-soft);">No one matches that search.</td></tr>';
    }

    rows.forEach(function(p){
      var total = allocationTotal(p);
      html += '<tr><td class="sticky-col"><div class="matrix-person"><span class="legend-dot" style="background:' + cardColor(p) + '"></span><div><div class="mp-name">' + escapeHtml(p.name) + (p.vacant ? ' <span class="vacant-badge">Unfilled</span>' : '') + '</div><div class="mp-title">' + escapeHtml(p.title||'') + '</div></div></div></td>';
      teams.forEach(function(t){
        var entry = personTeamEntry(p, t.id);
        if (entry){
          html += '<td class="matrix-cell" style="background:' + hexToTint(teamColor(t)) + '; border-left:3px ' + (entry.type==='dotted'?'dashed':'solid') + ' ' + teamColor(t) + ';">' +
            (entry.role ? escapeHtml(entry.role) : 'Member') +
            (entry.allocation ? '<div class="mc-alloc">' + escapeHtml(String(entry.allocation)) + '%</div>' : '') +
          '</td>';
        } else {
          html += '<td class="matrix-cell empty">—</td>';
        }
      });
      html += '<td class="sticky-col-right' + (total > 100 ? ' alloc-warn' : '') + '">' + (total ? total + '%' : '—') + '</td></tr>';
    });
    html += '</tbody></table>';
    wrap.innerHTML = '<div class="matrix-scroll">' + html + '</div>';
  }

  // ---------- STRONG tree (subproject breakdown) ----------
  // A tree of just the program/subproject structure: any top-level team
  // that has subprojects underneath it gets a root box, with one box per
  // subproject listing its lead and members. Someone who sits on more than
  // one of these team gets an "Also on ..." line under their name in every
  // box they appear in, with that team's percentage, so a shared allocation
  // is visible wherever it shows up instead of only in the Matrix view.
  function renderStrongTree(){
    var wrap = document.getElementById('strongTreeWrap');
    var programs = state.teams.filter(function(t){
      return !t.parentTeamId && !isSeparateTeam(t) && state.teams.some(function(c){ return c.parentTeamId === t.id; });
    });
    if (!programs.length){
      wrap.innerHTML = '<div class="matrix-empty-wrap"><div class="empty-state" style="position:static;"><h2>No subprojects yet</h2><p>In "Manage teams", set a team&rsquo;s "Subproject of" to another team to see that breakdown here.</p></div></div>';
      return;
    }
    wrap.innerHTML = '<div class="stx-scroll"><div class="stx-programs">' + programs.map(renderProgramTree).join('') + '</div></div>';
  }

  // The MULA tab is the same program-tree drawing as the STRONG tab, just
  // rooted one level down at "MULA Constellation" instead of at a top-level
  // program — renderProgramTree doesn't care that this root already has its
  // own parent (STRONG), it just draws whatever children point at the team
  // it's given.
  function renderMulaTree(){
    var wrap = document.getElementById('mulaTreeWrap');
    var mula = state.teams.find(function(t){ return t.name === 'MULA Constellation'; });
    if (!mula){
      wrap.innerHTML = '<div class="matrix-empty-wrap"><div class="empty-state" style="position:static;"><h2>No "MULA Constellation" team found</h2><p>This tab looks for a team named exactly "MULA Constellation" in "Manage teams".</p></div></div>';
      return;
    }
    wrap.innerHTML = '<div class="stx-scroll"><div class="stx-programs">' + renderProgramTree(mula) + '</div></div>';
  }

  // The SRR tab: same program-tree drawing, rooted at the "SRR" team. SRR is a
  // 2026 project that doesn't share time with the 2027 programs, so nothing
  // here feeds the STRONG tab or the 2027 allocation totals, and SRR never
  // shows up in an "Also on" line over there (those only list teams within
  // the same program).
  function renderSrrTree(){
    var wrap = document.getElementById('srrTreeWrap');
    var srr = srrTeam();
    if (!srr){
      wrap.innerHTML = '<div class="matrix-empty-wrap"><div class="empty-state" style="position:static;"><h2>No "SRR" team found</h2><p>This tab looks for a team named exactly "SRR" in "Manage teams".</p></div></div>';
      return;
    }
    wrap.innerHTML = '<div class="stx-scroll"><div class="stx-programs">' +
      renderProgramTree(srr) + '</div></div>';
  }

  function stxMembersOf(teamId){
    return state.people
      .filter(function(p){ return personTeamEntry(p, teamId); })
      .map(function(p){ return { person: p, entry: personTeamEntry(p, teamId) }; });
  }

  // Lead/sponsor first, then by allocation on this team as a stand-in for
  // seniority / level of involvement (there's no separate field for it),
  // then by name so ties are stable.
  function stxMemberRank(item, team){
    if (item.person.vacant) return 3;
    var roleText = (item.entry.role || '').toLowerCase();
    if (/sponsor/.test(roleText)) return 0;
    var isDesignatedLead = team.leadIds && team.leadIds.indexOf(item.person.id) !== -1;
    if (isDesignatedLead || /lead/.test(roleText)) return 1;
    return 2;
  }
  function stxSortMembers(list, team){
    return list.slice().sort(function(a,b){
      var ra = stxMemberRank(a, team), rb = stxMemberRank(b, team);
      if (ra !== rb) return ra - rb;
      var aa = parseFloat(a.entry.allocation), bb = parseFloat(b.entry.allocation);
      aa = isNaN(aa) ? -1 : aa;
      bb = isNaN(bb) ? -1 : bb;
      if (aa !== bb) return bb - aa;
      return a.person.name.localeCompare(b.person.name);
    });
  }

  // Same card look as a person's box in the STMSB tree: a dept-colored
  // accent bar plus a Fraunces name, just sized to sit inside a subproject
  // box instead of the reporting-line canvas.
  function stxMemberCard(item, teamId, allTeamIds, rootTeamId){
    var p = item.person, entry = item.entry;
    var other = (p.teams||[])
      .filter(function(m){ return m.teamId !== teamId && m.teamId !== rootTeamId && allTeamIds.indexOf(m.teamId) !== -1; })
      .map(function(m){
        var t = teamById(m.teamId);
        if (!t) return null;
        return escapeHtml(t.name) + (m.allocation ? ' (' + escapeHtml(String(m.allocation)) + '%)' : '');
      })
      .filter(function(x){ return !!x; });
    return (
      '<div class="stx-card">' +
        '<div class="stx-card-accent" style="background:' + cardColor(p) + '"></div>' +
        '<div class="stx-card-body">' +
          '<div class="stx-card-name">' + escapeHtml(p.name) + (p.vacant ? ' <span class="vacant-badge">Unfilled</span>' : '') + '</div>' +
          '<div class="stx-card-role">' + escapeHtml(entry.role || 'Member') + (entry.allocation ? ' &middot; <strong>' + escapeHtml(String(entry.allocation)) + '%</strong>' : '') + '</div>' +
          (other.length ? '<div class="stx-shared">Also on ' + other.join(', ') + '</div>' : '') +
        '</div>' +
      '</div>'
    );
  }

  // excludeTeamIds drops anyone who is also a member of one of those teams —
  // used so the overall-program box doesn't repeat everyone who is really
  // being shown one level down, in their subproject's own box.
  function stxNode(team, allTeamIds, extraClass, excludeTeamIds, rootTeamId){
    var leads = (team.leadIds || []).map(byId).filter(Boolean);
    var members = stxMembersOf(team.id);
    if (excludeTeamIds && excludeTeamIds.length){
      members = members.filter(function(item){
        return !(item.person.teams||[]).some(function(m){ return excludeTeamIds.indexOf(m.teamId) !== -1; });
      });
    }
    // People flagged "Cross-functional staff box" on their membership (set
    // from the person drawer) are pulled out of every team's regular roster —
    // renderProgramTree collects them once and draws a single shared box
    // alongside the subprojects instead (see stxAllCrossFunctional/stxXfnBox).
    members = stxSortMembers(members.filter(function(item){ return !item.entry.crossFunctional; }), team);
    var color = teamColor(team);
    return (
      '<div class="stx-node' + (extraClass ? ' ' + extraClass : '') + '" style="border-color:' + color + '; background:' + hexToTint(color) + ';">' +
        '<div class="stx-node-head">' +
          '<div class="stx-node-name" style="color:' + color + '">' + escapeHtml(team.name) + '</div>' +
          (leads.length ? '<div class="stx-node-lead">' + (leads.length > 1 ? 'Leads: ' : 'Lead: ') + leads.map(function(l){ return escapeHtml(l.name); }).join(', ') + '</div>' : '<div class="stx-node-lead stx-warn">No lead set</div>') +
        '</div>' +
        (team.purpose ? '<div class="stx-node-purpose">' + escapeHtml(team.purpose) + '</div>' : '') +
        '<div class="stx-node-members">' +
          (members.length ? members.map(function(m){ return stxMemberCard(m, team.id, allTeamIds, rootTeamId); }).join('') : '<div class="stx-empty">No one assigned yet</div>') +
        '</div>' +
      '</div>'
    );
  }

  // Every person flagged "Cross-functional staff box" on a membership
  // anywhere in this program (the root or any of its subprojects), deduped
  // by person so someone flagged in more than one place only shows once.
  function stxAllCrossFunctional(allTeamIds){
    var seenPersonIds = {};
    var out = [];
    state.people.forEach(function(p){
      (p.teams||[]).forEach(function(entry){
        if (entry.crossFunctional && allTeamIds.indexOf(entry.teamId) !== -1 && !seenPersonIds[p.id]){
          seenPersonIds[p.id] = true;
          out.push({ person: p, entry: entry });
        }
      });
    });
    return out;
  }

  // The undyed box for a program's cross-functional staff — same card look
  // as a subproject's roster, but no team color, no lead line, and its own
  // dashed border so it reads as "attached to, not one of" the subprojects
  // it sits beside.
  function stxXfnBox(xfnMembers, team, allTeamIds, rootTeamId){
    var sorted = stxSortMembers(xfnMembers, team);
    return (
      '<div class="stx-node stx-xfn">' +
        '<div class="stx-node-head">' +
          '<div class="stx-node-name stx-xfn-name">Cross-functional staff</div>' +
        '</div>' +
        '<div class="stx-node-members">' +
          sorted.map(function(m){ return stxMemberCard(m, m.entry.teamId, allTeamIds, rootTeamId); }).join('') +
        '</div>' +
      '</div>'
    );
  }

  function renderProgramTree(root){
    var children = state.teams.filter(function(t){ return t.parentTeamId === root.id; });
    var allTeamIds = [root.id].concat(children.map(function(c){ return c.id; }));
    var childIds = children.map(function(c){ return c.id; });
    var xfnMembers = stxAllCrossFunctional(allTeamIds);
    return (
      '<div class="stx-program">' +
        stxNode(root, allTeamIds, 'stx-root', childIds, root.id) +
        // No subprojects and no cross-functional box (e.g. SRR before it's
        // broken down) — just the root box, with no dangling trunk line.
        ((children.length || xfnMembers.length) ?
        '<div class="stx-trunk"></div>' +
        '<div class="stx-children">' +
          children.map(function(c){ return '<div class="stx-child-wrap"><div class="stx-branch"></div>' + stxNode(c, allTeamIds, 'stx-child', null, root.id) + '</div>'; }).join('') +
          (xfnMembers.length ? '<div class="stx-child-wrap"><div class="stx-branch"></div>' + stxXfnBox(xfnMembers, root, allTeamIds, root.id) + '</div>' : '') +
        '</div>' : '') +
      '</div>'
    );
  }

  // ---------- view switching ----------
  function setView(v){
    state.view = v;
    document.getElementById('viewport').style.display = v === 'tree' ? 'block' : 'none';
    document.getElementById('matrixWrap').style.display = v === 'matrix' ? 'block' : 'none';
    document.getElementById('strongTreeWrap').style.display = v === 'strongtree' ? 'block' : 'none';
    document.getElementById('mulaTreeWrap').style.display = v === 'mulatree' ? 'block' : 'none';
    document.getElementById('srrTreeWrap').style.display = v === 'srrtree' ? 'block' : 'none';
    document.querySelectorAll('.view-tab').forEach(function(btn){
      btn.classList.toggle('active', btn.getAttribute('data-view') === v);
    });
    document.getElementById('overlayTeamSelect').style.display = v === 'tree' ? 'inline-block' : 'none';
    render();
    // Measuring only works once the view is actually on screen, which it now is.
    fitViewIfNeeded(v);
  }

  // ---------- drawer: person ----------
  function populateManagerSelect(excludeId){
    var sel = document.getElementById('managerInput');
    var excluded = {};
    if (excludeId){
      excluded[excludeId] = true;
      descendantsOf(excludeId).forEach(function(d){ excluded[d] = true; });
    }
    var options = ['<option value="">— No manager (top level) —</option>'];
    state.people
      .filter(function(p){ return !excluded[p.id]; })
      .sort(function(a,b){ return a.name.localeCompare(b.name); })
      .forEach(function(p){
        options.push('<option value="' + p.id + '">' + escapeHtml(p.name) + (p.title ? ' (' + escapeHtml(p.title) + ')' : '') + (p.hidden ? ' — hidden placeholder' : '') + '</option>');
      });
    sel.innerHTML = options.join('');
  }
  function populateDeptList(){
    document.getElementById('deptList').innerHTML = distinctDepts().map(function(d){
      return '<option value="' + escapeHtml(d) + '">';
    }).join('');
  }
  function updateDeptDot(){
    var v = document.getElementById('deptInput').value.trim();
    document.getElementById('deptDot').style.background = deptColor(v);
  }
  function renderPersonTeamsList(p){
    var container = document.getElementById('personTeamsList');
    if (!state.teams.length){
      container.innerHTML = '<p class="hint" style="font-size:12.5px; color:var(--ink-soft);">No teams created yet. Use "Manage teams" in the header to add one.</p>';
      updateAllocNote();
      return;
    }
    var memberships = p ? (p.teams||[]) : [];
    container.innerHTML = orderedTeams().map(function(t){
      var entry = memberships.find(function(m){ return m.teamId === t.id; });
      var checked = entry ? 'checked' : '';
      var isSub = !!t.parentTeamId;
      var isSep = isSeparateTeam(t);
      return '<div class="team-row' + (isSub ? ' subproject' : '') + (isSep ? ' separate' : '') + '" data-team="' + t.id + '">' +
        (isSub ? '<div class="team-sub-label">subproject</div>' : '') +
        '<label class="team-row-check"><input type="checkbox" data-team-check="' + t.id + '" ' + checked + '> ' +
          '<span class="legend-dot" style="background:' + teamColor(t) + '"></span> ' + escapeHtml(t.name) + (isSep ? '<span class="period-badge">2026</span>' : '') +
        '</label>' +
        '<div class="team-row-fields" style="' + (entry ? '' : 'display:none;') + '">' +
          '<input type="text" placeholder="Role (e.g. Contributor)" data-team-role="' + t.id + '" value="' + escapeHtml(entry ? (entry.role||'') : '') + '">' +
          '<input type="number" min="0" max="100" placeholder="%" data-team-alloc="' + t.id + '" value="' + (entry && entry.allocation ? entry.allocation : '') + '">' +
          '<select data-team-type="' + t.id + '">' +
            '<option value="solid"' + (entry && entry.type === 'dotted' ? '' : ' selected') + '>Solid line</option>' +
            '<option value="dotted"' + (entry && entry.type === 'dotted' ? ' selected' : '') + '>Dotted line</option>' +
          '</select>' +
        '</div>' +
        '<label class="team-row-xfn" style="' + (entry ? '' : 'display:none;') + '" title="Shows this person in the shared \'Cross-functional staff\' box beside the subproject boxes in the STRONG tab, instead of grouped in with the rest of the team.">' +
          '<input type="checkbox" data-team-xfn="' + t.id + '" ' + (entry && entry.crossFunctional ? 'checked' : '') + '> Cross-functional staff box (STRONG tab)' +
        '</label>' +
      '</div>';
    }).join('');
    updateAllocNote();
  }
  function updateAllocNote(){
    var total = 0; // top-level teams only — a subproject's % is a slice of its parent's, not additional load
    document.querySelectorAll('#personTeamsList .team-row:not(.subproject):not(.separate)').forEach(function(row){
      var checkbox = row.querySelector('[data-team-check]');
      if (checkbox && checkbox.checked){
        var allocInput = row.querySelector('[data-team-alloc]');
        var n = parseFloat(allocInput.value);
        if (!isNaN(n)) total += n;
      }
    });
    var note = document.getElementById('allocTotalNote');
    if (total > 0){
      note.style.display = 'block';
      note.textContent = 'Total 2027 allocation across top-level teams: ' + total + '%' + (total > 100 ? ' — over capacity' : '');
      note.className = 'alloc-total' + (total > 100 ? ' alloc-warn-text' : '');
    } else {
      note.style.display = 'none';
    }
  }
  function collectPersonTeams(){
    var teams = [];
    document.querySelectorAll('#personTeamsList .team-row').forEach(function(row){
      var teamId = row.getAttribute('data-team');
      var checkbox = row.querySelector('[data-team-check]');
      if (checkbox && checkbox.checked){
        var role = row.querySelector('[data-team-role]').value.trim();
        var alloc = row.querySelector('[data-team-alloc]').value.trim();
        var type = row.querySelector('[data-team-type]').value;
        var xfnInput = row.querySelector('[data-team-xfn]');
        var entryObj = { teamId: teamId, role: role, allocation: alloc, type: type };
        if (xfnInput && xfnInput.checked) entryObj.crossFunctional = true;
        teams.push(entryObj);
      }
    });
    return teams;
  }

  function openDrawer(personId, prefillManagerId){
    state.editingId = personId || null;
    document.getElementById('deleteConfirm').style.display = 'none';
    document.getElementById('nameError').style.display = 'none';
    populateDeptList();
    populateManagerSelect(personId);

    var p = personId ? byId(personId) : null;
    document.getElementById('drawerTitle').textContent = p ? 'Edit person' : 'Add person';
    document.getElementById('nameInput').value = p ? p.name : '';
    document.getElementById('titleInput').value = p ? (p.title||'') : '';
    document.getElementById('deptInput').value = p ? (p.dept||'') : '';
    document.getElementById('managerInput').value = p ? (p.managerId||'') : (prefillManagerId||'');
    document.getElementById('vacantInput').checked = p ? !!p.vacant : false;
    updateDeptDot();
    renderPersonTeamsList(p);

    var deleteBtn = document.getElementById('deleteBtn');
    var note = document.getElementById('reportsNote');
    if (p){
      deleteBtn.style.display = 'inline-flex';
      var childCount = getChildren(p.id).length;
      if (childCount){
        note.style.display = 'block';
        note.textContent = childCount + (childCount === 1 ? ' person reports' : ' people report') + ' directly to ' + p.name + ' on the admin line.';
      } else { note.style.display = 'none'; }
    } else {
      deleteBtn.style.display = 'none';
      note.style.display = 'none';
    }

    document.getElementById('drawer').classList.add('open');
    document.getElementById('overlay').classList.add('open');
    setTimeout(function(){ document.getElementById('nameInput').focus(); }, 50);
  }
  function closeDrawer(){
    document.getElementById('drawer').classList.remove('open');
    document.getElementById('overlay').classList.remove('open');
    state.editingId = null;
  }
  function savePerson(){
    var name = document.getElementById('nameInput').value.trim();
    if (!name){
      document.getElementById('nameError').style.display = 'block';
      return;
    }
    var title = document.getElementById('titleInput').value.trim();
    var dept = document.getElementById('deptInput').value.trim();
    var managerId = document.getElementById('managerInput').value || null;
    var vacant = document.getElementById('vacantInput').checked;
    var teamsData = collectPersonTeams();

    if (state.editingId){
      var p = byId(state.editingId);
      p.name = name; p.title = title; p.dept = dept; p.managerId = managerId; p.teams = teamsData; p.vacant = vacant;
    } else {
      state.people.push({ id: uid(), name: name, title: title, dept: dept, managerId: managerId, teams: teamsData, vacant: vacant });
    }
    persist();
    closeDrawer();
    refreshOverlaySelect();
    render();
  }
  function requestDelete(){
    var p = byId(state.editingId);
    if (!p) return;
    var children = getChildren(p.id);
    var text;
    if (children.length){
      var upManager = p.managerId ? byId(p.managerId) : null;
      text = 'Removing ' + p.name + ' will move ' + children.length + (children.length===1?' person':' people') +
        ' up to report to ' + (upManager ? upManager.name : 'the top level') + '. They will also be removed from any teams they lead. Continue?';
    } else {
      text = 'Remove ' + p.name + ' from the chart? They will also be removed as lead from any team they lead.';
    }
    document.getElementById('deleteConfirmText').textContent = text;
    document.getElementById('deleteConfirm').style.display = 'flex';
  }
  function confirmDelete(){
    var p = byId(state.editingId);
    if (!p) return;
    var children = getChildren(p.id);
    children.forEach(function(c){ byId(c).managerId = p.managerId; });
    state.teams.forEach(function(t){ if (t.leadIds) t.leadIds = t.leadIds.filter(function(id){ return id !== p.id; }); });
    state.people = state.people.filter(function(x){ return x.id !== p.id; });
    persist();
    closeDrawer();
    refreshOverlaySelect();
    render();
  }

  // ---------- teams modal ----------
  // Any team can be a parent, including one that's already a subproject
  // itself (e.g. a team under MULA Constellation, which is itself under
  // STRONG) — nesting isn't capped at one level. The only teams left out are
  // the one being edited and its own descendants, so a team can never end up
  // as its own ancestor.
  function populateTeamParentSelect(excludeId){
    var sel = document.getElementById('teamParentInput');
    var opts = ['<option value="">— Not a subproject (top-level) —</option>'];
    var blocked = excludeId ? [excludeId].concat(teamDescendantsOf(excludeId)) : [];
    state.teams
      .filter(function(t){ return blocked.indexOf(t.id) === -1; })
      .forEach(function(t){
        var indent = ' '.repeat(teamDepth(t)) + (t.parentTeamId ? '↳ ' : '');
        opts.push('<option value="' + t.id + '">' + indent + escapeHtml(t.name) + '</option>');
      });
    sel.innerHTML = opts.join('');
  }
  function renderTeamsList(){
    var el = document.getElementById('teamsList');
    if (!state.teams.length){
      el.innerHTML = '<p class="hint">No teams yet — add one below.</p>';
      return;
    }
    el.innerHTML = orderedTeams().map(function(t){
      var leads = (t.leadIds || []).map(byId).filter(Boolean);
      var count = teamMembers(t.id).length;
      var parent = t.parentTeamId ? teamById(t.parentTeamId) : null;
      var leadLabel = leads.length
        ? ((leads.length > 1 ? 'Leads: ' : 'Lead: ') + leads.map(function(l){ return escapeHtml(l.name); }).join(', '))
        : '<span class="th-warn">No lead set</span>';
      return '<div class="team-list-row' + (parent ? ' subproject' : '') + '">' +
        '<span class="legend-dot" style="background:' + teamColor(t) + '"></span>' +
        '<div style="flex:1;">' + (parent ? '<div class="team-sub-label">subproject of ' + escapeHtml(parent.name) + '</div>' : '') +
          '<strong>' + escapeHtml(t.name) + '</strong>' + (isSeparateTeam(t) ? '<span class="period-badge">2026 · separate</span>' : '') +
          '<div class="th-sub">' + leadLabel + '</div>' +
          '<div class="th-sub">' + count + (count === 1 ? ' member' : ' members') + '</div>' +
        '</div>' +
        '<button class="btn btn-quiet" data-edit-team="' + t.id + '">Edit</button>' +
        '<button class="btn btn-quiet" data-delete-team="' + t.id + '" style="color:var(--danger);">Delete</button>' +
      '</div>';
    }).join('');
  }
  // Checkbox picker for a team's lead(s) — replaces the old single-select so
  // more than one person can be designated lead (co-leadership).
  function renderTeamLeadPicker(selectedIds){
    var container = document.getElementById('teamLeadInput');
    var selected = selectedIds || [];
    var sorted = visiblePeople().slice().sort(function(a,b){ return a.name.localeCompare(b.name); });
    if (!sorted.length){
      container.innerHTML = '<p class="hint" style="margin:2px 0;">Add people first.</p>';
      return;
    }
    container.innerHTML = sorted.map(function(p){
      var checked = selected.indexOf(p.id) !== -1 ? 'checked' : '';
      return '<label class="lead-picker-row"><input type="checkbox" data-team-lead-check="' + p.id + '" ' + checked + '> ' +
        escapeHtml(p.name) + (p.title ? ' <span class="hint" style="font-weight:400; display:inline;">(' + escapeHtml(p.title) + ')</span>' : '') +
      '</label>';
    }).join('');
  }
  function collectTeamLeadIds(){
    var ids = [];
    document.querySelectorAll('#teamLeadInput [data-team-lead-check]').forEach(function(cb){
      if (cb.checked) ids.push(cb.getAttribute('data-team-lead-check'));
    });
    return ids;
  }
  function resetTeamForm(){
    state.editingTeamId = null;
    document.getElementById('teamFormTitle').textContent = 'Add a team';
    document.getElementById('teamNameInput').value = '';
    renderTeamLeadPicker([]);
    document.getElementById('teamParentInput').value = '';
    document.getElementById('teamPurposeInput').value = '';
    document.getElementById('teamSeparateInput').checked = false;
    document.getElementById('cancelTeamEditBtn').style.display = 'none';
    populateTeamParentSelect(null);
  }
  function openTeamsModal(){
    resetTeamForm();
    renderTeamsList();
    document.getElementById('teamsModal').classList.add('open');
    document.getElementById('overlay').classList.add('open');
  }
  function closeTeamsModal(){
    document.getElementById('teamsModal').classList.remove('open');
    document.getElementById('overlay').classList.remove('open');
  }
  function saveTeam(){
    var name = document.getElementById('teamNameInput').value.trim();
    if (!name) return;
    var leadIds = collectTeamLeadIds();
    var parentTeamId = document.getElementById('teamParentInput').value || null;
    var purpose = document.getElementById('teamPurposeInput').value.trim();
    var separate = document.getElementById('teamSeparateInput').checked;
    if (state.editingTeamId){
      var t = teamById(state.editingTeamId);
      t.name = name; t.leadIds = leadIds; t.purpose = purpose; t.parentTeamId = parentTeamId;
      if (separate) t.separate = true; else delete t.separate;
    } else {
      var color = PALETTE[state.teams.length % PALETTE.length];
      if (parentTeamId){
        var p2 = teamById(parentTeamId);
        if (p2 && p2.color) color = p2.color;
      }
      var newTeam = { id: uid(), name: name, leadIds: leadIds, purpose: purpose, color: color, parentTeamId: parentTeamId };
      if (separate) newTeam.separate = true;
      state.teams.push(newTeam);
    }
    ensureTeamLeadMemberships();
    persist();
    resetTeamForm();
    renderTeamsList();
    refreshOverlaySelect();
    render();
  }
  function editTeam(id){
    var t = teamById(id);
    if (!t) return;
    state.editingTeamId = id;
    document.getElementById('teamFormTitle').textContent = 'Edit team';
    document.getElementById('teamNameInput').value = t.name;
    renderTeamLeadPicker(t.leadIds || []);
    document.getElementById('teamPurposeInput').value = t.purpose || '';
    document.getElementById('teamSeparateInput').checked = !!t.separate;
    populateTeamParentSelect(t.id);
    document.getElementById('teamParentInput').value = t.parentTeamId || '';
    document.getElementById('cancelTeamEditBtn').style.display = 'inline-flex';
  }
  function deleteTeam(id){
    state.teams = state.teams.filter(function(t){ return t.id !== id; });
    // a subproject whose parent just got deleted becomes a top-level team rather than vanishing
    state.teams.forEach(function(t){ if (t.parentTeamId === id) t.parentTeamId = null; });
    state.people.forEach(function(p){ p.teams = (p.teams||[]).filter(function(t){ return t.teamId !== id; }); });
    if (state.overlayTeamId === id) state.overlayTeamId = '';
    persist();
    renderTeamsList();
    refreshOverlaySelect();
    render();
  }
  function refreshOverlaySelect(){
    var sel = document.getElementById('overlayTeamSelect');
    var cur = state.overlayTeamId;
    sel.innerHTML = '<option value="">Highlight team…</option>' + state.teams.map(function(t){
      return '<option value="' + t.id + '">' + escapeHtml(t.name) + '</option>';
    }).join('');
    sel.value = cur;
  }

  // ---------- import / export ----------
  function openImportModal(){
    document.getElementById('exportText').value = JSON.stringify({ people: state.people, teams: state.teams, savedAt: state.savedAt }, null, 2);
    document.getElementById('importText').value = '';
    document.getElementById('importStatus').textContent = '';
    document.getElementById('jsonUploadStatus').textContent = '';
    document.getElementById('importModal').classList.add('open');
    document.getElementById('overlay').classList.add('open');
  }
  function closeImportModal(){
    document.getElementById('importModal').classList.remove('open');
    document.getElementById('overlay').classList.remove('open');
  }
  function runImport(){
    var raw = document.getElementById('importText').value;
    var lines = raw.split('\n').map(function(l){ return l.trim(); }).filter(Boolean);
    if (!lines.length){ document.getElementById('importStatus').textContent = 'Paste at least one line first.'; return; }

    var created = [];
    lines.forEach(function(line){
      var parts = line.split(',').map(function(s){ return s.trim(); });
      var name = parts[0] || '';
      if (!name) return;
      var title = parts[1] || '';
      var managerName = parts[2] || '';
      created.push({ id: uid(), name: name, title: title, dept: '', managerName: managerName, managerId: null, teams: [] });
    });

    var lookup = {};
    state.people.forEach(function(p){ lookup[p.name.toLowerCase()] = p.id; });
    created.forEach(function(p){ lookup[p.name.toLowerCase()] = p.id; });

    var unresolved = 0;
    created.forEach(function(p){
      if (p.managerName){
        var mid = lookup[p.managerName.toLowerCase()];
        if (mid) p.managerId = mid; else unresolved++;
      }
      delete p.managerName;
      state.people.push(p);
    });

    persist();
    document.getElementById('importStatus').textContent = 'Added ' + created.length + (created.length===1?' person':' people') +
      (unresolved ? ' (' + unresolved + " with a manager name that didn't match — added at the top level)" : '') + '.';
    document.getElementById('importText').value = '';
    refreshOverlaySelect();
    render();
  }
  function handleJsonUpload(file){
    var status = document.getElementById('jsonUploadStatus');
    var reader = new FileReader();
    reader.onload = function(evt){
      try{
        var data = JSON.parse(evt.target.result);
        var incomingPeople = Array.isArray(data) ? data : (data.people || []);
        var incomingTeams = Array.isArray(data) ? [] : (data.teams || []);
        var addedP=0, updatedP=0, addedT=0, updatedT=0;

        incomingPeople.forEach(function(p){
          if (!p || !p.id || !p.name) return;
          var existing = byId(p.id);
          if (existing){
            existing.name = p.name; existing.title = p.title||''; existing.dept = p.dept||'';
            existing.managerId = p.managerId||null; existing.teams = p.teams||[]; existing.vacant = !!p.vacant;
            if (p.hidden) existing.hidden = true; else delete existing.hidden;
            updatedP++;
          } else {
            var newPerson = { id:p.id, name:p.name, title:p.title||'', dept:p.dept||'', managerId:p.managerId||null, teams:p.teams||[], vacant: !!p.vacant };
            if (p.hidden) newPerson.hidden = true;
            state.people.push(newPerson);
            addedP++;
          }
        });
        incomingTeams.forEach(function(t){
          if (!t || !t.id || !t.name) return;
          var existing = teamById(t.id);
          var incomingLeadIds = Array.isArray(t.leadIds) ? t.leadIds : (t.leadId ? [t.leadId] : []);
          if (existing){
            existing.name = t.name; existing.leadIds = incomingLeadIds; existing.purpose = t.purpose||'';
            existing.parentTeamId = t.parentTeamId||null;
            if (t.color) existing.color = t.color;
            if (t.separate) existing.separate = true;
            updatedT++;
          } else {
            var addedTeam = { id:t.id, name:t.name, leadIds: incomingLeadIds, purpose:t.purpose||'', color:t.color||PALETTE[state.teams.length % PALETTE.length], parentTeamId: t.parentTeamId||null };
            if (t.separate) addedTeam.separate = true;
            state.teams.push(addedTeam);
            addedT++;
          }
        });

        ensureSrrTeam();
        ensureTeamLeadMemberships();
        persist();
        status.textContent = 'Added ' + addedP + ', updated ' + updatedP + ' people' +
          (incomingTeams.length ? ('; added ' + addedT + ', updated ' + updatedT + ' teams') : '') + '.';
        refreshOverlaySelect();
        render();
      } catch(err){
        status.textContent = 'Could not read that file — make sure it is valid JSON exported from here.';
      }
    };
    reader.readAsText(file);
  }
  function downloadExport(){
    var payload = { people: state.people, teams: state.teams, savedAt: new Date().toISOString() };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'stmsb-strong-chart-2027.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ---------- zoom ----------
  // Every view is zoomable. The tree is drawn at absolute positions, so it
  // scales with a transform on the stage. The Matrix, STRONG, MULA and SRR views
  // are ordinary flow layout, so they use CSS zoom instead — that reflows
  // rather than just painting smaller, which keeps the sticky table header
  // and the scrollbars honest.
  // The tree stops at 40% because cards stop being readable below that. A
  // table or a program tree can still be skimmed smaller, and a wide one
  // needs the extra room to fit on screen at all, so it goes further down.
  var ZOOM_MAX = 1.6;
  function zoomMin(v){ return v === 'tree' ? 0.4 : 0.25; }
  function zoomOf(v){
    var z = state.zooms[v];
    return typeof z === 'number' ? z : 1;
  }
  function setZoom(z){
    state.zooms[state.view] = Math.max(zoomMin(state.view), Math.min(ZOOM_MAX, z));
    render();
  }
  function renderZoomLabel(){
    document.getElementById('zoomLabel').textContent = Math.round(zoomOf(state.view) * 100) + '%';
  }
  // Per view: the element that scrolls, and the element inside it that
  // actually carries the content's width.
  function zoomTargets(v){
    if (v === 'matrix') return { scroller: document.querySelector('#matrixWrap .matrix-scroll'), content: document.querySelector('#matrixWrap .matrix-table') };
    if (v === 'strongtree') return { scroller: document.querySelector('#strongTreeWrap .stx-scroll'), content: document.querySelector('#strongTreeWrap .stx-programs') };
    if (v === 'mulatree') return { scroller: document.querySelector('#mulaTreeWrap .stx-scroll'), content: document.querySelector('#mulaTreeWrap .stx-programs') };
    if (v === 'srrtree') return { scroller: document.querySelector('#srrTreeWrap .stx-scroll'), content: document.querySelector('#srrTreeWrap .stx-programs') };
    return { scroller: document.getElementById('viewport'), content: document.getElementById('stage') };
  }
  // The flow-layout views are rebuilt from scratch on every render, so their
  // inline zoom has to be put back each time.
  function applyViewZoom(){
    ['matrix','strongtree','mulatree','srrtree'].forEach(function(v){
      var t = zoomTargets(v);
      if (t.content) t.content.style.zoom = zoomOf(v);
    });
    renderZoomLabel();
  }
  // Fits the content's width into the viewport only — height is left alone, so
  // something tall just scrolls vertically instead of everything shrinking
  // down to fit on screen at once. Never zooms in past 100%. Returns false if
  // the view can't be measured yet (it's hidden, or it has no content).
  function fitZoom(){
    var v = state.view;
    var t = zoomTargets(v);
    if (!t.scroller || !t.content) return false;
    var avail, w;
    if (v === 'tree'){
      if (!state.people.length) return false;
      avail = t.scroller.clientWidth - 40;
      w = computeLayout().totalWidth;
    } else {
      // Measure unscaled first, then scale to whatever room there is.
      t.content.style.zoom = 1;
      w = Math.max(t.content.scrollWidth, t.content.offsetWidth);
      avail = t.scroller.clientWidth;
      // Content that already fits stays at a clean 100%. Only when it has to
      // shrink does it get a few pixels of slack, with the ratio rounded down
      // rather than up, so sub-pixel widths and borders don't leave a
      // scrollbar sitting there at the level that was supposed to fit.
      if (w > avail) avail -= 8;
    }
    if (!w || avail <= 0){ applyViewZoom(); return false; }
    setZoom(Math.min(1, Math.floor((avail / w) * 1000) / 1000));
    return true;
  }
  // A view can only be measured once it's on screen, so each tab's first fit
  // happens the first time that tab is shown.
  function fitViewIfNeeded(v){
    if (didFitView[v]) return;
    if (fitZoom()) didFitView[v] = true;
  }

  // ---------- connector highlight on hover/focus ----------
  function setHover(id){
    if (state.hoverId === id) return;
    state.hoverId = id;
    renderTree();
  }

  // ---------- events ----------
  document.getElementById('addPersonBtn').addEventListener('click', function(){ openDrawer(null, null); });
  document.getElementById('emptyAddBtn').addEventListener('click', function(){ openDrawer(null, null); });
  document.getElementById('emptyImportBtn').addEventListener('click', openImportModal);
  document.getElementById('openImport').addEventListener('click', openImportModal);
  document.getElementById('manageTeamsBtn').addEventListener('click', openTeamsModal);
  document.getElementById('teamsModalClose').addEventListener('click', closeTeamsModal);
  document.getElementById('saveTeamBtn').addEventListener('click', saveTeam);
  document.getElementById('cancelTeamEditBtn').addEventListener('click', resetTeamForm);
  document.getElementById('teamsList').addEventListener('click', function(e){
    var editBtn = e.target.closest('[data-edit-team]');
    if (editBtn){ editTeam(editBtn.getAttribute('data-edit-team')); return; }
    var delBtn = e.target.closest('[data-delete-team]');
    if (delBtn){ deleteTeam(delBtn.getAttribute('data-delete-team')); return; }
  });
  document.getElementById('drawerClose').addEventListener('click', closeDrawer);
  document.getElementById('cancelBtn').addEventListener('click', closeDrawer);
  document.getElementById('saveBtn').addEventListener('click', savePerson);
  document.getElementById('deleteBtn').addEventListener('click', requestDelete);
  document.getElementById('deleteCancel').addEventListener('click', function(){ document.getElementById('deleteConfirm').style.display = 'none'; });
  document.getElementById('deleteConfirmBtn').addEventListener('click', confirmDelete);
  document.getElementById('deptInput').addEventListener('input', updateDeptDot);
  document.getElementById('personTeamsList').addEventListener('change', function(e){
    if (e.target.matches('[data-team-check]')){
      var row = e.target.closest('.team-row');
      row.querySelector('.team-row-fields').style.display = e.target.checked ? 'flex' : 'none';
      row.querySelector('.team-row-xfn').style.display = e.target.checked ? 'flex' : 'none';
      updateAllocNote();
    } else if (e.target.matches('[data-team-alloc], [data-team-type]')){
      updateAllocNote();
    }
  });
  document.getElementById('personTeamsList').addEventListener('input', function(e){
    if (e.target.matches('[data-team-alloc]')) updateAllocNote();
  });
  document.getElementById('modalClose').addEventListener('click', closeImportModal);
  document.getElementById('runImport').addEventListener('click', runImport);
  document.getElementById('jsonUploadBtn').addEventListener('click', function(){ document.getElementById('jsonFileInput').click(); });
  document.getElementById('jsonFileInput').addEventListener('change', function(e){
    var file = e.target.files[0];
    if (file) handleJsonUpload(file);
    e.target.value = '';
  });
  document.getElementById('copyExport').addEventListener('click', function(){
    var ta = document.getElementById('exportText');
    ta.select();
    try{ document.execCommand('copy'); }catch(e){}
  });
  document.getElementById('downloadExport').addEventListener('click', downloadExport);
  document.getElementById('saveDownloadBtn').addEventListener('click', downloadExport);
  document.getElementById('overlay').addEventListener('click', function(){ closeDrawer(); closeImportModal(); closeTeamsModal(); });
  document.getElementById('zoomIn').addEventListener('click', function(){ zoomTouched[state.view] = true; setZoom(zoomOf(state.view) + 0.1); });
  document.getElementById('zoomOut').addEventListener('click', function(){ zoomTouched[state.view] = true; setZoom(zoomOf(state.view) - 0.1); });
  document.getElementById('zoomFit').addEventListener('click', function(){ delete zoomTouched[state.view]; fitZoom(); });
  // Resizing the window changes what "fit" means. Re-fit the view on show,
  // unless its zoom was set by hand — then leave it exactly where it was.
  var zoomResizeTimer = null;
  window.addEventListener('resize', function(){
    clearTimeout(zoomResizeTimer);
    zoomResizeTimer = setTimeout(function(){
      if (!zoomTouched[state.view]) fitZoom();
    }, 150);
  });
  document.querySelectorAll('.view-tab').forEach(function(btn){
    btn.addEventListener('click', function(){ setView(btn.getAttribute('data-view')); });
  });
  document.getElementById('overlayTeamSelect').addEventListener('change', function(e){
    state.overlayTeamId = e.target.value;
    state.dimDept = null;
    render();
  });

  document.getElementById('searchInput').addEventListener('input', function(e){
    state.search = e.target.value;
    render();
  });

  document.getElementById('legend').addEventListener('click', function(e){
    var chip = e.target.closest('.legend-chip');
    if (!chip) return;
    var dept = chip.getAttribute('data-dept');
    state.dimDept = (dept === '__clear__' || state.dimDept === dept) ? null : dept;
    state.overlayTeamId = '';
    document.getElementById('overlayTeamSelect').value = '';
    render();
  });

  document.getElementById('cardsLayer').addEventListener('click', function(e){
    var quick = e.target.closest('[data-quickadd]');
    if (quick){
      openDrawer(null, quick.getAttribute('data-quickadd'));
      var qdept = quick.getAttribute('data-quickadd-dept');
      if (qdept){
        document.getElementById('deptInput').value = qdept;
        updateDeptDot();
      }
      return;
    }
    var toggle = e.target.closest('[data-toggle]');
    if (toggle){
      var id = toggle.getAttribute('data-toggle');
      if (state.collapsed.has(id)) state.collapsed.delete(id); else state.collapsed.add(id);
      render();
      return;
    }
    var card = e.target.closest('.card');
    if (card){ openDrawer(card.getAttribute('data-id'), null); }
  });
  document.getElementById('cardsLayer').addEventListener('keydown', function(e){
    if (e.key === 'Enter' || e.key === ' '){
      var card = e.target.closest('.card');
      if (card){ e.preventDefault(); openDrawer(card.getAttribute('data-id'), null); }
    }
  });
  // Highlight the reporting-line connector for whichever card is hovered or
  // focused, so it's obvious at a glance who connects to whom.
  document.getElementById('cardsLayer').addEventListener('mouseover', function(e){
    var card = e.target.closest('.card');
    if (card) setHover(card.getAttribute('data-id'));
  });
  document.getElementById('cardsLayer').addEventListener('mouseout', function(e){
    var card = e.target.closest('.card');
    if (card && (!e.relatedTarget || !e.relatedTarget.closest('.card'))) setHover(null);
  });
  document.getElementById('cardsLayer').addEventListener('focusin', function(e){
    var card = e.target.closest('.card');
    if (card) setHover(card.getAttribute('data-id'));
  });
  document.getElementById('cardsLayer').addEventListener('focusout', function(e){
    var card = e.target.closest('.card');
    if (card && (!e.relatedTarget || !e.relatedTarget.closest('.card'))) setHover(null);
  });

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape'){ closeDrawer(); closeImportModal(); closeTeamsModal(); }
  });

  loadData();
})();
